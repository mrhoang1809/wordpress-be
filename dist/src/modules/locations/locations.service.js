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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let LocationsService = class LocationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const searchVal = (query.search || '').toLowerCase();
        const where = searchVal
            ? {
                OR: [
                    { name: { contains: searchVal, mode: 'insensitive' } },
                    { address: { contains: searchVal, mode: 'insensitive' } },
                ],
            }
            : {};
        const [items, total] = await Promise.all([
            this.prisma.location.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { order: 'asc' },
            }),
            this.prisma.location.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, pageSize);
    }
    async findById(id) {
        const location = await this.prisma.location.findUnique({ where: { id } });
        if (!location)
            throw new common_1.NotFoundException('Location not found');
        return {
            ...location,
            createdAt: location.createdAt.toISOString(),
            updatedAt: location.updatedAt.toISOString(),
        };
    }
    async findActive() {
        const locations = await this.prisma.location.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return locations.map((l) => ({
            ...l,
            createdAt: l.createdAt.toISOString(),
            updatedAt: l.updatedAt.toISOString(),
        }));
    }
    async create(dto) {
        return this.prisma.location.create({
            data: {
                ...dto,
                order: dto.order ?? 0,
                isActive: dto.isActive ?? true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.location.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Location not found');
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.slug !== undefined)
            updateData.slug = dto.slug;
        if (dto.address !== undefined)
            updateData.address = dto.address;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone;
        if (dto.email !== undefined)
            updateData.email = dto.email;
        if (dto.latitude !== undefined)
            updateData.latitude = dto.latitude;
        if (dto.longitude !== undefined)
            updateData.longitude = dto.longitude;
        if (dto.order !== undefined)
            updateData.order = dto.order;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        return this.prisma.location.update({
            where: { id },
            data: { ...updateData, updatedAt: new Date() },
        });
    }
    async delete(id) {
        const existing = await this.prisma.location.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Location not found');
        await this.prisma.location.delete({ where: { id } });
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map