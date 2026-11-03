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
exports.SubscribersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let SubscribersService = class SubscribersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 50;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.platform === 'ZALO')
            where.NOT = { zaloUserId: null };
        if (query.platform === 'FACEBOOK')
            where.NOT = { facebookPsid: null };
        if (query.tag)
            where.tags = { has: query.tag };
        const [subscribers, total] = await Promise.all([
            this.prisma.subscriber.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subscriber.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(subscribers, total, page, pageSize);
    }
    async findById(id) {
        const sub = await this.prisma.subscriber.findUnique({ where: { id } });
        if (!sub)
            throw new common_1.NotFoundException('Subscriber not found');
        return sub;
    }
    async create(dto) {
        if (dto.phone) {
            const existing = await this.prisma.subscriber.findUnique({ where: { phone: dto.phone } });
            if (existing)
                throw new common_1.ConflictException('Phone already registered');
        }
        if (dto.email) {
            const existing = await this.prisma.subscriber.findFirst({ where: { email: dto.email } });
            if (existing)
                throw new common_1.ConflictException('Email already registered');
        }
        if (dto.zaloUserId) {
            const existing = await this.prisma.subscriber.findUnique({ where: { zaloUserId: dto.zaloUserId } });
            if (existing)
                throw new common_1.ConflictException('Zalo user ID already registered');
        }
        if (dto.facebookPsid) {
            const existing = await this.prisma.subscriber.findUnique({ where: { facebookPsid: dto.facebookPsid } });
            if (existing)
                throw new common_1.ConflictException('Facebook PSID already registered');
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
    async update(id, dto) {
        const existing = await this.prisma.subscriber.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Subscriber not found');
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
    async delete(id) {
        const sub = await this.prisma.subscriber.findUnique({ where: { id } });
        if (!sub)
            throw new common_1.NotFoundException('Subscriber not found');
        await this.prisma.subscriber.delete({ where: { id } });
    }
    async bulkImport(subscribers) {
        let created = 0;
        let skipped = 0;
        for (const dto of subscribers) {
            try {
                await this.create(dto);
                created++;
            }
            catch {
                skipped++;
            }
        }
        return { created, skipped };
    }
    async findForCampaign(platform, targetTags) {
        const where = {
            isActive: true,
        };
        if (platform === 'ZALO') {
            where.zaloUserId = { not: null };
        }
        else {
            where.facebookPsid = { not: null };
        }
        if (targetTags.length > 0) {
            where.tags = { hasSome: targetTags };
        }
        return this.prisma.subscriber.findMany({ where });
    }
    async getTags() {
        const subscribers = await this.prisma.subscriber.findMany({
            select: { tags: true },
            where: { isActive: true },
        });
        const tagSet = new Set();
        for (const s of subscribers) {
            for (const t of s.tags)
                tagSet.add(t);
        }
        return Array.from(tagSet).sort();
    }
};
exports.SubscribersService = SubscribersService;
exports.SubscribersService = SubscribersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscribersService);
//# sourceMappingURL=subscribers.service.js.map