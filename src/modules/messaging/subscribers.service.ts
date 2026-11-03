import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Subscriber } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateSubscriberDto, UpdateSubscriberDto } from './dto/subscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { platform?: string; tag?: string }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SubscriberWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.platform === 'ZALO') where.NOT = { zaloUserId: null };
    if (query.platform === 'FACEBOOK') where.NOT = { facebookPsid: null };
    if (query.tag) where.tags = { has: query.tag };

    const [subscribers, total] = await Promise.all([
      this.prisma.subscriber.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscriber.count({ where }),
    ]);

    return paginate(subscribers, total, page, pageSize);
  }

  async findById(id: string): Promise<Subscriber> {
    const sub = await this.prisma.subscriber.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    return sub;
  }

  async create(dto: CreateSubscriberDto): Promise<Subscriber> {
    // Check uniqueness for provided identifiers
    if (dto.phone) {
      const existing = await this.prisma.subscriber.findUnique({ where: { phone: dto.phone } });
      if (existing) throw new ConflictException('Phone already registered');
    }
    if (dto.email) {
      const existing = await this.prisma.subscriber.findFirst({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already registered');
    }
    if (dto.zaloUserId) {
      const existing = await this.prisma.subscriber.findUnique({ where: { zaloUserId: dto.zaloUserId } });
      if (existing) throw new ConflictException('Zalo user ID already registered');
    }
    if (dto.facebookPsid) {
      const existing = await this.prisma.subscriber.findUnique({ where: { facebookPsid: dto.facebookPsid } });
      if (existing) throw new ConflictException('Facebook PSID already registered');
    }

    return this.prisma.subscriber.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        zaloUserId: dto.zaloUserId,
        facebookPsid: dto.facebookPsid,
        tags: dto.tags ?? [],
        isActive: dto.isActive ?? true,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateSubscriberDto): Promise<Subscriber> {
    const existing = await this.prisma.subscriber.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Subscriber not found');

    return this.prisma.subscriber.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        zaloUserId: dto.zaloUserId,
        facebookPsid: dto.facebookPsid,
        tags: dto.tags,
        isActive: dto.isActive,
        notes: dto.notes,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const sub = await this.prisma.subscriber.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    await this.prisma.subscriber.delete({ where: { id } });
  }

  async bulkImport(subscribers: CreateSubscriberDto[]): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    for (const dto of subscribers) {
      try {
        await this.create(dto);
        created++;
      } catch {
        // Skip duplicates or invalid entries
        skipped++;
      }
    }

    return { created, skipped };
  }

  /**
   * Find subscribers matching a campaign's target criteria.
   * Used by the campaign service when sending.
   */
  async findForCampaign(
    platform: 'ZALO' | 'FACEBOOK',
    targetTags: string[],
  ): Promise<Subscriber[]> {
    const where: Prisma.SubscriberWhereInput = {
      isActive: true,
    };

    if (platform === 'ZALO') {
      where.zaloUserId = { not: null };
    } else {
      where.facebookPsid = { not: null };
    }

    if (targetTags.length > 0) {
      where.tags = { hasSome: targetTags };
    }

    return this.prisma.subscriber.findMany({ where });
  }

  /**
   * Get all unique tags used by subscribers.
   */
  async getTags(): Promise<string[]> {
    const subscribers = await this.prisma.subscriber.findMany({
      select: { tags: true },
      where: { isActive: true },
    });
    const tagSet = new Set<string>();
    for (const s of subscribers) {
      for (const t of s.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }
}
