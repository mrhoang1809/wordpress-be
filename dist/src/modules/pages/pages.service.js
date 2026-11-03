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
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const revalidation_service_1 = require("../revalidation/revalidation.service");
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 500);
}
const PAGE_INCLUDE = {
    createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    featuredImage: { select: { id: true, url: true, altText: true } },
    blocks: { orderBy: { order: 'asc' } },
};
let PagesService = class PagesService {
    constructor(prisma, revalidation) {
        this.prisma = prisma;
        this.revalidation = revalidation;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const sortBy = query.sortBy ?? 'updatedAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const [pages, total] = await Promise.all([
            this.prisma.page.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { [sortBy]: sortOrder },
                include: PAGE_INCLUDE,
            }),
            this.prisma.page.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(pages, total, page, pageSize);
    }
    async findById(id) {
        const page = await this.prisma.page.findUnique({
            where: { id },
            include: PAGE_INCLUDE,
        });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return page;
    }
    async findPublicBySlug(slug) {
        const page = await this.prisma.page.findUnique({
            where: { slug },
            include: {
                blocks: { orderBy: { order: 'asc' } },
                featuredImage: { select: { url: true, altText: true } },
            },
        });
        if (!page || page.status !== client_1.ContentStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Page not found');
        }
        const { blocks, ...rest } = page;
        return {
            id: rest.id,
            title: rest.title,
            slug: rest.slug,
            excerpt: rest.excerpt,
            status: rest.status,
            featuredImage: rest.featuredImage,
            seo: {
                title: rest.seoTitle ?? rest.title,
                description: rest.seoDescription,
                image: rest.seoImage,
            },
            publishedAt: rest.publishedAt,
            blocks: blocks.map((b) => ({
                id: b.id,
                type: b.type,
                order: b.order,
                schemaVersion: b.schemaVersion,
                data: b.data,
            })),
        };
    }
    async create(dto, user) {
        const slug = dto.slug ?? slugify(dto.title);
        await this.assertSlugUnique(slug);
        return this.prisma.page.create({
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt,
                seoTitle: dto.seoTitle,
                seoDescription: dto.seoDescription,
                seoImage: dto.seoImage,
                featuredImageId: dto.featuredImageId,
                createdById: user.sub,
            },
            include: PAGE_INCLUDE,
        });
    }
    async update(id, dto, user) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        const isAdmin = user.roles.includes('ADMIN');
        if (page.createdById !== user.sub && !isAdmin) {
            throw new common_1.ForbiddenException('Permission denied');
        }
        if (dto.slug && dto.slug !== page.slug) {
            await this.assertSlugUnique(dto.slug);
        }
        return this.prisma.page.update({
            where: { id },
            data: {
                title: dto.title,
                slug: dto.slug,
                excerpt: dto.excerpt,
                seoTitle: dto.seoTitle,
                seoDescription: dto.seoDescription,
                seoImage: dto.seoImage,
                featuredImageId: dto.featuredImageId,
            },
            include: PAGE_INCLUDE,
        });
    }
    async delete(id, user) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        const isAdmin = user.roles.includes('ADMIN');
        if (page.createdById !== user.sub && !isAdmin) {
            throw new common_1.ForbiddenException('Permission denied');
        }
        await this.prisma.page.delete({ where: { id } });
    }
    async publish(id, user) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        const updated = await this.prisma.page.update({
            where: { id },
            data: {
                status: client_1.ContentStatus.PUBLISHED,
                publishedAt: page.publishedAt ?? new Date(),
            },
            include: PAGE_INCLUDE,
        });
        await this.revalidation.revalidate('page', page.slug);
        return updated;
    }
    async unpublish(id, user) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        const updated = await this.prisma.page.update({
            where: { id },
            data: { status: client_1.ContentStatus.DRAFT },
            include: PAGE_INCLUDE,
        });
        await this.revalidation.revalidate('page', page.slug);
        return updated;
    }
    async duplicate(id, user) {
        const page = await this.prisma.page.findUnique({
            where: { id },
            include: { blocks: { orderBy: { order: 'asc' } } },
        });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        const newSlug = await this.generateUniqueSlug(`${page.slug}-copy`);
        return this.prisma.page.create({
            data: {
                title: `${page.title} (Copy)`,
                slug: newSlug,
                excerpt: page.excerpt,
                seoTitle: page.seoTitle,
                seoDescription: page.seoDescription,
                seoImage: page.seoImage,
                featuredImageId: page.featuredImageId,
                createdById: user.sub,
                status: client_1.ContentStatus.DRAFT,
                blocks: {
                    create: page.blocks.map((b) => ({
                        type: b.type,
                        order: b.order,
                        data: b.data,
                        schemaVersion: b.schemaVersion,
                    })),
                },
            },
            include: PAGE_INCLUDE,
        });
    }
    async generatePreviewToken(id, user) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return { token: id };
    }
    async assertSlugUnique(slug) {
        const existing = await this.prisma.page.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException(`Slug "${slug}" is already in use`);
    }
    async generateUniqueSlug(base) {
        let slug = base;
        let counter = 1;
        while (await this.prisma.page.findUnique({ where: { slug } })) {
            slug = `${base}-${counter++}`;
        }
        return slug;
    }
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        revalidation_service_1.RevalidationService])
], PagesService);
//# sourceMappingURL=pages.service.js.map