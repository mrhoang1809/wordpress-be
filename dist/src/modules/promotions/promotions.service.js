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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let PromotionsService = class PromotionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
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
        return (0, pagination_dto_1.paginate)(items, total, page, pageSize);
    }
    async findById(id) {
        const banner = await this.prisma.promotionBanner.findUnique({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Promotion banner not found');
        return banner;
    }
    async create(dto) {
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
    async update(id, dto) {
        const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promotion banner not found');
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
    async delete(id) {
        const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promotion banner not found');
        await this.prisma.promotionBanner.delete({ where: { id } });
    }
    async activate(id) {
        const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promotion banner not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.promotionBanner.updateMany({ data: { isActive: false } });
            return tx.promotionBanner.update({
                where: { id },
                data: { isActive: true },
            });
        });
    }
    async deactivate(id) {
        const existing = await this.prisma.promotionBanner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promotion banner not found');
        return this.prisma.promotionBanner.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async findActive() {
        return this.prisma.promotionBanner.findFirst({
            where: { isActive: true, endsAt: { gt: new Date() } },
            orderBy: { sortOrder: 'asc' },
        });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map