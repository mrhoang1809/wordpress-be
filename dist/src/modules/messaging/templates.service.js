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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TemplatesService = class TemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(platform) {
        const where = platform ? { platform } : {};
        return this.prisma.messageTemplate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const template = await this.prisma.messageTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
    }
    async create(dto) {
        return this.prisma.messageTemplate.create({
            data: {
                name: dto.name,
                platform: dto.platform,
                messageType: dto.messageType ?? 'text',
                content: dto.content,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.messageTemplate.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.messageTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                platform: dto.platform,
                messageType: dto.messageType,
                content: dto.content,
                isActive: dto.isActive,
            },
        });
    }
    async delete(id) {
        const existing = await this.prisma.messageTemplate.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Template not found');
        await this.prisma.messageTemplate.delete({ where: { id } });
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map