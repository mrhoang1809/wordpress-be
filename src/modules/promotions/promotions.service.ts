import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  CreatePromotionBannerDto,
  UpdatePromotionBannerDto,
} from './dto/promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Admin: full CRUD ────────────────────────────────────────────────────────

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.promotionBanner.findMany({
        skip,
        take: pageSize,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.promotionBanner.count(),
    ]);

    return paginate(items, total, page, pageSize);
  }

  async findById(id: string) {
    const banner = await this.prisma.promotionBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Promotion banner not found');
    return banner;
  }

  async create(dto: CreatePromotionBannerDto) {
    return this.prisma.promotionBanner.create({
      data: {
        badgeText: dto.badgeText,
        headline: dto.headline,
        description: dto.description,
        ctaLabel: dto.ctaLabel ?? 'Đăng ký ngay',
        ctaSource: dto.ctaSource ?? 'Promotion Banner',
        countdownLabel: dto.countdownLabel ?? 'Chương trình kết thúc sau:',
        endsAt: new Date(dto.endsAt),
        bgGradientFrom: dto.bgGradientFrom ?? 'from-brand-900',
        bgGradientVia: dto.bgGradientVia ?? 'via-brand-800',
        bgGradientTo: dto.bgGradientTo ?? 'to-accent-magenta',
        badgeBg: dto.badgeBg ?? 'bg-yellow-400',
        badgeText2: dto.badgeText2 ?? 'text-brand-900',
        isActive: dto.isActive ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdatePromotionBannerDto) {
    const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion banner not found');

    return this.prisma.promotionBanner.update({
      where: { id },
      data: {
        badgeText: dto.badgeText,
        headline: dto.headline,
        description: dto.description,
        ctaLabel: dto.ctaLabel,
        ctaSource: dto.ctaSource,
        countdownLabel: dto.countdownLabel,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        bgGradientFrom: dto.bgGradientFrom,
        bgGradientVia: dto.bgGradientVia,
        bgGradientTo: dto.bgGradientTo,
        badgeBg: dto.badgeBg,
        badgeText2: dto.badgeText2,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion banner not found');
    await this.prisma.promotionBanner.delete({ where: { id } });
  }

  /**
   * Activate a banner and deactivate all others (only one active at a time).
   */
  async activate(id: string) {
    const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion banner not found');

    return this.prisma.$transaction(async (tx) => {
      // Deactivate all
      await tx.promotionBanner.updateMany({ data: { isActive: false } });
      // Activate this one
      return tx.promotionBanner.update({
        where: { id },
        data: { isActive: true },
      });
    });
  }

  async deactivate(id: string) {
    const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion banner not found');
    return this.prisma.promotionBanner.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ── Public: get the currently active banner ──────────────────────────────

  async findActive() {
    return this.prisma.promotionBanner.findFirst({
      where: { isActive: true, endsAt: { gt: new Date() } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
