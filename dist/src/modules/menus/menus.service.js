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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
const revalidation_service_1 = require("../revalidation/revalidation.service");
let MenusService = class MenusService {
    constructor(prisma, revalidation) {
        this.prisma = prisma;
        this.revalidation = revalidation;
    }
    async findAll() {
        return this.prisma.menu.findMany({
            include: { _count: { select: { items: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id) {
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: { items: { orderBy: { order: 'asc' } } },
        });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        return { ...menu, items: this.buildItemTree(menu.items) };
    }
    async findPublicByLocation(location) {
        const menu = await this.prisma.menu.findUnique({
            where: { location },
            include: {
                items: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!menu || !menu.isActive)
            throw new common_1.NotFoundException('Menu not found');
        return { ...menu, items: this.buildItemTree(menu.items) };
    }
    async create(dto) {
        return this.prisma.menu.create({ data: dto });
    }
    async update(id, dto) {
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        return this.prisma.menu.update({
            where: { id },
            data: { name: dto.name, location: dto.location, isActive: dto.isActive },
        });
    }
    async delete(id) {
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        await this.prisma.menu.delete({ where: { id } });
    }
    async syncItems(menuId, dto) {
        const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        const requestIds = new Set(dto.items.map((i) => i.id));
        for (const item of dto.items) {
            if (item.parentId && !requestIds.has(item.parentId)) {
                throw new common_1.BadRequestException(`Item "${item.label}" has parentId "${item.parentId}" that doesn't exist in request`);
            }
        }
        this.detectCycles(dto.items);
        for (const item of dto.items) {
            this.validateItemType(item);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.menuItem.deleteMany({ where: { menuId } });
            for (const item of dto.items) {
                await tx.menuItem.create({
                    data: {
                        id: item.id,
                        menuId,
                        label: item.label,
                        type: item.type,
                        parentId: item.parentId ?? null,
                        order: item.order,
                        pageId: item.pageId,
                        postId: item.postId,
                        categoryId: item.categoryId,
                        customUrl: item.customUrl,
                        openInNewTab: item.openInNewTab ?? false,
                        isActive: item.isActive ?? true,
                    },
                });
            }
            const updated = await tx.menu.findUnique({
                where: { id: menuId },
                include: { items: { orderBy: { order: 'asc' } } },
            });
            return { ...updated, items: this.buildItemTree(updated.items) };
        });
    }
    detectCycles(items) {
        const map = new Map(items.map((i) => [i.id, i.parentId]));
        for (const item of items) {
            const visited = new Set();
            let current = item.parentId;
            while (current) {
                if (current === item.id) {
                    throw new common_1.BadRequestException(`Circular menu item hierarchy detected for "${item.label}"`);
                }
                if (visited.has(current))
                    break;
                visited.add(current);
                current = map.get(current);
            }
        }
    }
    validateItemType(item) {
        if (item.type === client_1.MenuItemType.PAGE && !item.pageId) {
            throw new common_1.BadRequestException(`Menu item "${item.label}" of type PAGE requires a pageId`);
        }
        if (item.type === client_1.MenuItemType.POST && !item.postId) {
            throw new common_1.BadRequestException(`Menu item "${item.label}" of type POST requires a postId`);
        }
        if (item.type === client_1.MenuItemType.CATEGORY && !item.categoryId) {
            throw new common_1.BadRequestException(`Menu item "${item.label}" of type CATEGORY requires a categoryId`);
        }
        if (item.type === client_1.MenuItemType.CUSTOM_URL && !item.customUrl) {
            throw new common_1.BadRequestException(`Menu item "${item.label}" of type CUSTOM_URL requires a customUrl`);
        }
    }
    buildItemTree(items) {
        const map = new Map(items.map((i) => [i.id, { ...i, children: [] }]));
        const roots = [];
        for (const item of map.values()) {
            const i = item;
            if (i.parentId && map.has(i.parentId)) {
                map.get(i.parentId).children.push(i);
            }
            else {
                roots.push(i);
            }
        }
        return roots;
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        revalidation_service_1.RevalidationService])
], MenusService);
//# sourceMappingURL=menus.service.js.map