import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CampaignStatus, MessagePlatform } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { SubscribersService } from './subscribers.service';
import { ZaloProvider } from './providers/zalo.provider';
import { FacebookProvider } from './providers/facebook.provider';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly subscribersService: SubscribersService,
    private readonly zaloProvider: ZaloProvider,
    private readonly facebookProvider: FacebookProvider,
  ) {}

  async findAll(
    query: PaginationQueryDto & { status?: CampaignStatus; platform?: MessagePlatform },
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.platform) where.platform = query.platform;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.messageCampaign.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { recipients: true } },
        },
      }),
      this.prisma.messageCampaign.count({ where }),
    ]);

    return paginate(campaigns, total, page, pageSize);
  }

  async findById(id: string) {
    const campaign = await this.prisma.messageCampaign.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        recipients: {
          include: { subscriber: { select: { id: true, name: true, phone: true, zaloUserId: true, facebookPsid: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(dto: CreateCampaignDto, user: JwtPayload) {
    // Validate content based on platform
    this.validateContent(dto.platform, dto.content);

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;

    return this.prisma.messageCampaign.create({
      data: {
        title: dto.title,
        platform: dto.platform,
        messageType: dto.messageType ?? 'text',
        content: dto.content as object,
        targetTags: dto.targetTags ?? [],
        scheduledAt,
        createdById: user.sub,
        status: scheduledAt ? CampaignStatus.QUEUED : CampaignStatus.DRAFT,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: UpdateCampaignDto, user: JwtPayload) {
    const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status === CampaignStatus.SENDING || campaign.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Cannot edit a campaign that is sending or completed');
    }

    const isAdmin = user.roles.includes('ADMIN');
    if (campaign.createdById !== user.sub && !isAdmin) {
      throw new ForbiddenException('Permission denied');
    }

    if (dto.platform && dto.content) {
      this.validateContent(dto.platform, dto.content);
    }

    return this.prisma.messageCampaign.update({
      where: { id },
      data: {
        title: dto.title,
        platform: dto.platform,
        messageType: dto.messageType,
        content: dto.content as object,
        targetTags: dto.targetTags,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.prisma.messageCampaign.delete({ where: { id } });
  }

  /**
   * Send a campaign to all matching subscribers.
   * This is the core bulk-send logic with rate limiting and per-recipient tracking.
   */
  async send(id: string, user: JwtPayload): Promise<{ started: boolean; recipientCount: number }> {
    const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    // Check platform configuration
    if (campaign.platform === MessagePlatform.ZALO && !this.zaloProvider.isConfigured()) {
      throw new BadRequestException('Zalo OA not configured. Set ZALO_OA_ID, ZALO_OA_SECRET, ZALO_OA_REFRESH_TOKEN');
    }
    if (campaign.platform === MessagePlatform.FACEBOOK && !this.facebookProvider.isConfigured()) {
      throw new BadRequestException('Facebook not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN');
    }

    if (campaign.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Campaign is already being sent');
    }
    if (campaign.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Campaign already completed');
    }

    // Find matching subscribers
    const subscribers = await this.subscribersService.findForCampaign(
      campaign.platform,
      campaign.targetTags,
    );

    if (subscribers.length === 0) {
      throw new BadRequestException('No matching subscribers found for this campaign');
    }

    // Update campaign status + create recipient records
    await this.prisma.$transaction(async (tx) => {
      // Delete any existing pending recipients (for re-sends)
      await tx.messageRecipient.deleteMany({
        where: { campaignId: id, status: 'PENDING' },
      });

      // Create new recipient records
      await tx.messageRecipient.createMany({
        data: subscribers.map((sub) => ({
          campaignId: id,
          subscriberId: sub.id,
          status: 'PENDING' as const,
        })),
        skipDuplicates: true,
      });

      // Update campaign
      await tx.messageCampaign.update({
        where: { id },
        data: {
          status: CampaignStatus.SENDING,
          totalRecipients: subscribers.length,
          sentCount: 0,
          failedCount: 0,
          startedAt: new Date(),
        },
      });
    });

    // Start sending asynchronously (fire-and-forget, non-blocking)
    this.processCampaign(id, campaign.platform, campaign.content as Record<string, unknown>)
      .catch((err) => this.logger.error(`Campaign ${id} failed`, err));

    return { started: true, recipientCount: subscribers.length };
  }

  async cancel(id: string): Promise<void> {
    const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== CampaignStatus.QUEUED && campaign.status !== CampaignStatus.SENDING) {
      throw new BadRequestException('Can only cancel queued or sending campaigns');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.messageCampaign.update({
        where: { id },
        data: { status: CampaignStatus.CANCELLED },
      });
      // Mark pending recipients as failed
      await tx.messageRecipient.updateMany({
        where: { campaignId: id, status: 'PENDING' },
        data: { status: 'FAILED', errorMessage: 'Campaign cancelled' },
      });
    });
  }

  /**
   * Get delivery statistics for a campaign.
   */
  async getStats(id: string) {
    const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const [pending, sent, failed, delivered, read] = await Promise.all([
      this.prisma.messageRecipient.count({ where: { campaignId: id, status: 'PENDING' } }),
      this.prisma.messageRecipient.count({ where: { campaignId: id, status: 'SENT' } }),
      this.prisma.messageRecipient.count({ where: { campaignId: id, status: 'FAILED' } }),
      this.prisma.messageRecipient.count({ where: { campaignId: id, status: 'DELIVERED' } }),
      this.prisma.messageRecipient.count({ where: { campaignId: id, status: 'READ' } }),
    ]);

    return {
      total: campaign.totalRecipients,
      pending,
      sent,
      failed,
      delivered,
      read,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      status: campaign.status,
    };
  }

  // ─── Private: Bulk send processing ──────────────────────────────────────────

  private async processCampaign(
    campaignId: string,
    platform: MessagePlatform,
    content: Record<string, unknown>,
  ) {
    const rateLimitMs = this.configService.get('messaging', { infer: true }).rateLimitMs;
    const batchSize = this.configService.get('messaging', { infer: true }).batchSize;

    let sentCount = 0;
    let failedCount = 0;

    // Process in batches to avoid overwhelming the API
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      // Check if campaign was cancelled
      const campaign = await this.prisma.messageCampaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      });
      if (!campaign || campaign.status === CampaignStatus.CANCELLED) {
        this.logger.log(`Campaign ${campaignId} cancelled — stopping`);
        break;
      }

      const recipients = await this.prisma.messageRecipient.findMany({
        where: { campaignId, status: 'PENDING' },
        include: {
          subscriber: { select: { zaloUserId: true, facebookPsid: true, name: true } },
        },
        take: batchSize,
        skip,
      });

      if (recipients.length === 0) {
        hasMore = false;
        break;
      }

      for (const recipient of recipients) {
        // Check cancellation again
        if (skip % 10 === 0) {
          const c = await this.prisma.messageCampaign.findUnique({
            where: { id: campaignId },
            select: { status: true },
          });
          if (c?.status === CampaignStatus.CANCELLED) {
            hasMore = false;
            break;
          }
        }

        const targetId = platform === MessagePlatform.ZALO
          ? recipient.subscriber.zaloUserId
          : recipient.subscriber.facebookPsid;

        if (!targetId) {
          await this.prisma.messageRecipient.update({
            where: { id: recipient.id },
            data: { status: 'FAILED', errorMessage: 'No platform ID for this subscriber', sentAt: new Date() },
          });
          failedCount++;
          continue;
        }

        const provider = platform === MessagePlatform.ZALO
          ? this.zaloProvider as { send: (id: string, content: Record<string, unknown>) => Promise<{ success: boolean; messageId?: string; error?: string }> }
          : this.facebookProvider as { send: (id: string, content: Record<string, unknown>) => Promise<{ success: boolean; messageId?: string; error?: string }> };
        const result = await provider.send(targetId, content);

        if (result.success) {
          await this.prisma.messageRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'SENT',
              platformMessageId: result.messageId,
              sentAt: new Date(),
            },
          });
          sentCount++;
        } else {
          await this.prisma.messageRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'FAILED',
              errorMessage: result.error ?? 'Unknown error',
              sentAt: new Date(),
            },
          });
          failedCount++;
        }

        // Rate limit between sends
        await this.delay(rateLimitMs);
      }

      // Update campaign counters periodically
      await this.prisma.messageCampaign.update({
        where: { id: campaignId },
        data: { sentCount: { increment: recipients.length }, failedCount: { increment: 0 } },
      });

      skip += batchSize;
    }

    // Finalize campaign
    await this.prisma.messageCampaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.COMPLETED,
        completedAt: new Date(),
        sentCount,
        failedCount,
      },
    });

    this.logger.log(`Campaign ${campaignId} completed: ${sentCount} sent, ${failedCount} failed`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private validateContent(platform: MessagePlatform, content: Record<string, unknown>): void {
    const messageType = (content.messageType as string) ?? 'text';

    if (messageType === 'text' && !content.text) {
      throw new BadRequestException('Text message requires a "text" field');
    }

    if (messageType === 'image' && !content.imageUrl) {
      throw new BadRequestException('Image message requires an "imageUrl" field');
    }

    if (messageType === 'button') {
      if (!content.text) throw new BadRequestException('Button message requires a "text" field');
      if (!Array.isArray(content.buttons) || content.buttons.length === 0) {
        throw new BadRequestException('Button message requires a "buttons" array');
      }
      if (platform === MessagePlatform.FACEBOOK && (content.buttons as unknown[]).length > 3) {
        throw new BadRequestException('Facebook button template supports max 3 buttons');
      }
    }

    if (messageType === 'generic') {
      if (!Array.isArray(content.elements) || content.elements.length === 0) {
        throw new BadRequestException('Generic template requires an "elements" array');
      }
    }
  }
}
