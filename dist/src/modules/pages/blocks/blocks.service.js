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
exports.BlocksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../database/prisma.service");
const block_validator_1 = require("./block-validator");
let BlocksService = class BlocksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBlocks(pageId) {
        const page = await this.prisma.page.findUnique({ where: { id: pageId } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return this.prisma.pageBlock.findMany({
            where: { pageId },
            orderBy: { order: 'asc' },
        });
    }
    async syncBlocks(pageId, dto, user) {
        return this.prisma.$transaction(async (tx) => {
            const page = await tx.page.findUnique({ where: { id: pageId } });
            if (!page)
                throw new common_1.NotFoundException('Page not found');
            if (page.version !== dto.version) {
                throw new common_1.ConflictException(`Version mismatch. Expected ${page.version}, got ${dto.version}. Please reload and try again.`);
            }
            const isAdmin = user.roles.includes('ADMIN');
            if (page.createdById !== user.sub && !isAdmin) {
                throw new common_1.ForbiddenException('You do not have permission to edit this page');
            }
            const requestIds = dto.blocks.map((b) => b.id);
            if (new Set(requestIds).size !== requestIds.length) {
                throw new common_1.BadRequestException('Duplicate block IDs in request');
            }
            for (const block of dto.blocks) {
                if (!Object.values(client_1.BlockType).includes(block.type)) {
                    throw new common_1.BadRequestException(`Unknown block type: ${block.type}`);
                }
                (0, block_validator_1.validateBlockData)(block.type, block.data);
            }
            if (requestIds.length > 0) {
                await tx.pageBlock.deleteMany({
                    where: { pageId, id: { notIn: requestIds } },
                });
            }
            else {
                await tx.pageBlock.deleteMany({ where: { pageId } });
            }
            for (const block of dto.blocks) {
                await tx.pageBlock.upsert({
                    where: { id: block.id },
                    create: {
                        id: block.id,
                        pageId,
                        type: block.type,
                        order: block.order,
                        data: block.data,
                        schemaVersion: block.schemaVersion ?? 1,
                    },
                    update: {
                        type: block.type,
                        order: block.order,
                        data: block.data,
                        schemaVersion: block.schemaVersion ?? 1,
                    },
                });
            }
            const updatedPage = await tx.page.update({
                where: { id: pageId },
                data: { version: { increment: 1 }, updatedAt: new Date() },
                include: { blocks: { orderBy: { order: 'asc' } } },
            });
            return updatedPage;
        });
    }
};
exports.BlocksService = BlocksService;
exports.BlocksService = BlocksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlocksService);
//# sourceMappingURL=blocks.service.js.map