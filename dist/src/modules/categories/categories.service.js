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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 200);
}
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 50;
        const skip = (page - 1) * pageSize;
        const where = query.search
            ? { name: { contains: query.search, mode: 'insensitive' } }
            : {};
        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: pageSize,
                include: { image: { select: { url: true, altText: true } } },
                orderBy: [{ order: 'asc' }, { name: 'asc' }],
            }),
            this.prisma.category.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(categories, total, page, pageSize);
    }
    async findTree() {
        const all = await this.prisma.category.findMany({
            where: { isActive: true },
            include: { image: { select: { url: true, altText: true } } },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
        });
        return this.buildTree(all);
    }
    async findById(id) {
        const cat = await this.prisma.category.findUnique({
            where: { id },
            include: {
                image: { select: { url: true, altText: true } },
                parent: { select: { id: true, name: true, slug: true } },
                children: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        return cat;
    }
    async findPublicBySlug(slug) {
        const cat = await this.prisma.category.findUnique({
            where: { slug },
            include: { image: { select: { url: true, altText: true } } },
        });
        if (!cat || !cat.isActive)
            throw new common_1.NotFoundException('Category not found');
        return cat;
    }
    async create(dto) {
        const slug = dto.slug ?? slugify(dto.name);
        await this.assertSlugUnique(slug);
        if (dto.parentId) {
            await this.assertParentExists(dto.parentId);
        }
        return this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                parentId: dto.parentId,
                imageId: dto.imageId,
                order: dto.order ?? 0,
                isActive: dto.isActive ?? true,
            },
            include: { image: { select: { url: true, altText: true } } },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.category.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Category not found');
        if (dto.slug && dto.slug !== existing.slug) {
            await this.assertSlugUnique(dto.slug);
        }
        if (dto.parentId && dto.parentId !== existing.parentId) {
            await this.assertParentExists(dto.parentId);
            await this.assertNoCycle(id, dto.parentId);
        }
        return this.prisma.category.update({
            where: { id },
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                parentId: dto.parentId,
                imageId: dto.imageId,
                order: dto.order,
                isActive: dto.isActive,
            },
            include: { image: { select: { url: true, altText: true } } },
        });
    }
    async delete(id) {
        const cat = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { children: true, postCategories: true } } },
        });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        if (cat._count.children > 0) {
            throw new common_1.BadRequestException('Cannot delete category with children');
        }
        if (cat._count.postCategories > 0) {
            throw new common_1.BadRequestException('Cannot delete category that has posts');
        }
        await this.prisma.category.delete({ where: { id } });
    }
    buildTree(categories) {
        const map = new Map(categories.map((c) => [c.id, { ...c, children: [] }]));
        const roots = [];
        for (const item of map.values()) {
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId).children.push(item);
            }
            else {
                roots.push(item);
            }
        }
        return roots;
    }
    async assertSlugUnique(slug) {
        const exists = await this.prisma.category.findUnique({ where: { slug } });
        if (exists)
            throw new common_1.ConflictException(`Category slug "${slug}" already in use`);
    }
    async assertParentExists(parentId) {
        const parent = await this.prisma.category.findUnique({ where: { id: parentId } });
        if (!parent)
            throw new common_1.NotFoundException('Parent category not found');
    }
    async assertNoCycle(id, newParentId) {
        const visited = new Set();
        let cursor = newParentId;
        while (cursor !== null) {
            if (cursor === id) {
                throw new common_1.BadRequestException('Circular category hierarchy detected');
            }
            if (visited.has(cursor))
                break;
            visited.add(cursor);
            const row = await this.prisma.category.findUnique({
                where: { id: cursor },
                select: { parentId: true },
            });
            cursor = row?.parentId ?? null;
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map