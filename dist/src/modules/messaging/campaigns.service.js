"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CampaignsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const subscribers_service_1 = require("./subscribers.service");
const zalo_provider_1 = require("./providers/zalo.provider");
const facebook_provider_1 = require("./providers/facebook.provider");
let CampaignsService = CampaignsService_1 = class CampaignsService {
    constructor(prisma, configService, subscribersService, zaloProvider, facebookProvider) {
        this.prisma = prisma;
        this.configService = configService;
        this.subscribersService = subscribersService;
        this.zaloProvider = zaloProvider;
        this.facebookProvider = facebookProvider;
        this.logger = new common_1.Logger(CampaignsService_1.name);
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.platform)
            where.platform = query.platform;
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
        return (0, pagination_dto_1.paginate)(campaigns, total, page, pageSize);
    }
    async findById(id) {
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
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async create(dto, user) {
        this.validateContent(dto.platform, dto.content);
        const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
        return this.prisma.messageCampaign.create({
            data: {
                title: dto.title,
                platform: dto.platform,
                messageType: dto.messageType ?? 'text',
                content: dto.content,
                targetTags: dto.targetTags ?? [],
                scheduledAt,
                createdById: user.sub,
                status: scheduledAt ? client_1.CampaignStatus.QUEUED : client_1.CampaignStatus.DRAFT,
            },
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async update(id, dto, user) {
        const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.status === client_1.CampaignStatus.SENDING || campaign.status === client_1.CampaignStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot edit a campaign that is sending or completed');
        }
        const isAdmin = user.roles.includes('ADMIN');
        if (campaign.createdById !== user.sub && !isAdmin) {
            throw new common_1.ForbiddenException('Permission denied');
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
                content: dto.content,
                targetTags: dto.targetTags,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
            },
        });
    }
    async delete(id) {
        const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        await this.prisma.messageCampaign.delete({ where: { id } });
    }
    async send(id, user) {
        const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.platform === client_1.MessagePlatform.ZALO && !this.zaloProvider.isConfigured()) {
            throw new common_1.BadRequestException('Zalo OA not configured. Set ZALO_OA_ID, ZALO_OA_SECRET, ZALO_OA_REFRESH_TOKEN');
        }
        if (campaign.platform === client_1.MessagePlatform.FACEBOOK && !this.facebookProvider.isConfigured()) {
            throw new common_1.BadRequestException('Facebook not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN');
        }
        if (campaign.status === client_1.CampaignStatus.SENDING) {
            throw new common_1.BadRequestException('Campaign is already being sent');
        }
        if (campaign.status === client_1.CampaignStatus.COMPLETED) {
            throw new common_1.BadRequestException('Campaign already completed');
        }
        const subscribers = await this.subscribersService.findForCampaign(campaign.platform, campaign.targetTags);
        if (subscribers.length === 0) {
            throw new common_1.BadRequestException('No matching subscribers found for this campaign');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.messageRecipient.deleteMany({
                where: { campaignId: id, status: 'PENDING' },
            });
            await tx.messageRecipient.createMany({
                data: subscribers.map((sub) => ({
                    campaignId: id,
                    subscriberId: sub.id,
                    status: 'PENDING',
                })),
                skipDuplicates: true,
            });
            await tx.messageCampaign.update({
                where: { id },
                data: {
                    status: client_1.CampaignStatus.SENDING,
                    totalRecipients: subscribers.length,
                    sentCount: 0,
                    failedCount: 0,
                    startedAt: new Date(),
                },
            });
        });
        this.processCampaign(id, campaign.platform, campaign.content)
            .catch((err) => this.logger.error(`Campaign ${id} failed`, err));
        return { started: true, recipientCount: subscribers.length };
    }
    async cancel(id) {
        const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.status !== client_1.CampaignStatus.QUEUED && campaign.status !== client_1.CampaignStatus.SENDING) {
            throw new common_1.BadRequestException('Can only cancel queued or sending campaigns');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.messageCampaign.update({
                where: { id },
                data: { status: client_1.CampaignStatus.CANCELLED },
            });
            await tx.messageRecipient.updateMany({
                where: { campaignId: id, status: 'PENDING' },
                data: { status: 'FAILED', errorMessage: 'Campaign cancelled' },
            });
        });
    }
    async getStats(id) {
        const campaign = await this.prisma.messageCampaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
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
    async processCampaign(campaignId, platform, content) {
        const rateLimitMs = this.configService.get('messaging', { infer: true }).rateLimitMs;
        const batchSize = this.configService.get('messaging', { infer: true }).batchSize;
        let sentCount = 0;
        let failedCount = 0;
        let hasMore = true;
        let skip = 0;
        while (hasMore) {
            const campaign = await this.prisma.messageCampaign.findUnique({
                where: { id: campaignId },
                select: { status: true },
            });
            if (!campaign || campaign.status === client_1.CampaignStatus.CANCELLED) {
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
                if (skip % 10 === 0) {
                    const c = await this.prisma.messageCampaign.findUnique({
                        where: { id: campaignId },
                        select: { status: true },
                    });
                    if (c?.status === client_1.CampaignStatus.CANCELLED) {
                        hasMore = false;
                        break;
                    }
                }
                const targetId = platform === client_1.MessagePlatform.ZALO
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
                const provider = platform === client_1.MessagePlatform.ZALO
                    ? this.zaloProvider
                    : this.facebookProvider;
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
                }
                else {
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
                await this.delay(rateLimitMs);
            }
            await this.prisma.messageCampaign.update({
                where: { id: campaignId },
                data: { sentCount: { increment: recipients.length }, failedCount: { increment: 0 } },
            });
            skip += batchSize;
        }
        await this.prisma.messageCampaign.update({
            where: { id: campaignId },
            data: {
                status: client_1.CampaignStatus.COMPLETED,
                completedAt: new Date(),
                sentCount,
                failedCount,
            },
        });
        this.logger.log(`Campaign ${campaignId} completed: ${sentCount} sent, ${failedCount} failed`);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    validateContent(platform, content) {
        const messageType = content.messageType ?? 'text';
        if (messageType === 'text' && !content.text) {
            throw new common_1.BadRequestException('Text message requires a "text" field');
        }
        if (messageType === 'image' && !content.imageUrl) {
            throw new common_1.BadRequestException('Image message requires an "imageUrl" field');
        }
        if (messageType === 'button') {
            if (!content.text)
                throw new common_1.BadRequestException('Button message requires a "text" field');
            if (!Array.isArray(content.buttons) || content.buttons.length === 0) {
                throw new common_1.BadRequestException('Button message requires a "buttons" array');
            }
            if (platform === client_1.MessagePlatform.FACEBOOK && content.buttons.length > 3) {
                throw new common_1.BadRequestException('Facebook button template supports max 3 buttons');
            }
        }
        if (messageType === 'generic') {
            if (!Array.isArray(content.elements) || content.elements.length === 0) {
                throw new common_1.BadRequestException('Generic template requires an "elements" array');
            }
        }
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = CampaignsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        subscribers_service_1.SubscribersService,
        zalo_provider_1.ZaloProvider,
        facebook_provider_1.FacebookProvider])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map