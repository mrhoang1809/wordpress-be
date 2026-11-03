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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const transliteration_1 = require("transliteration");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const revalidation_service_1 = require("../revalidation/revalidation.service");
function slugify(text) {
    return (0, transliteration_1.slugify)(text, { lowercase: true, separator: '-', trim: true })
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 500);
}
const POST_INCLUDE = {
    author: { select: { id: true, firstName: true, lastName: true, email: true } },
    featuredImage: { select: { id: true, url: true, altText: true } },
    blocks: { orderBy: { order: 'asc' } },
    postCategories: { include: { category: { select: { id: true, name: true, slug: true } } } },
};
let PostsService = class PostsService {
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
        if (query.categorySlug) {
            where.postCategories = {
                some: { category: { slug: query.categorySlug } },
            };
        }
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { updatedAt: 'desc' },
                include: POST_INCLUDE,
            }),
            this.prisma.post.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(posts, total, page, pageSize);
    }
    async findById(id) {
        const post = await this.prisma.post.findUnique({ where: { id }, include: POST_INCLUDE });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    async findPublicBySlug(slug) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                blocks: { orderBy: { order: 'asc' } },
                featuredImage: { select: { url: true, altText: true } },
                postCategories: { include: { category: { select: { id: true, name: true, slug: true } } } },
                _count: { select: { comments: true } },
            },
        });
        if (!post || post.status !== client_1.ContentStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Post not found');
        }
        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            publishedAt: post.publishedAt,
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            commentCount: post._count.comments,
            author: post.author,
            categories: post.postCategories.map((pc) => pc.category),
            seo: {
                title: post.seoTitle ?? post.title,
                description: post.seoDescription,
                image: post.seoImage,
            },
            blocks: post.blocks.map((b) => ({
                id: b.id,
                type: b.type,
                order: b.order,
                schemaVersion: b.schemaVersion,
                data: b.data,
            })),
        };
    }
    async getPublicEngagement(slug) {
        const post = await this.prisma.post.findFirst({
            where: { slug, status: client_1.ContentStatus.PUBLISHED },
            select: {
                viewCount: true,
                likeCount: true,
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 100,
                    select: { id: true, name: true, text: true, createdAt: true },
                },
            },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return {
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            commentCount: post.comments.length,
            comments: post.comments,
        };
    }
    async recordPublicView(slug) {
        const post = await this.findPublishedPost(slug);
        await this.prisma.post.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
        });
        return this.getPublicEngagement(slug);
    }
    async recordPublicLike(slug) {
        const post = await this.findPublishedPost(slug);
        await this.prisma.post.update({
            where: { id: post.id },
            data: { likeCount: { increment: 1 } },
        });
        return this.getPublicEngagement(slug);
    }
    async createPublicComment(slug, dto) {
        const post = await this.findPublishedPost(slug);
        await this.prisma.postComment.create({
            data: { postId: post.id, name: dto.name.trim(), text: dto.text.trim() },
        });
        return this.getPublicEngagement(slug);
    }
    async listPublicPosts(query) {
        const page = query.page ?? 1;
        const pageSize = Math.min(query.pageSize ?? 12, 50);
        const skip = (page - 1) * pageSize;
        const where = {
            status: client_1.ContentStatus.PUBLISHED,
        };
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { excerpt: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.categorySlug) {
            where.postCategories = {
                some: { category: { slug: query.categorySlug } },
            };
        }
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { publishedAt: 'desc' },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                    featuredImage: { select: { url: true, altText: true } },
                    postCategories: {
                        include: { category: { select: { id: true, name: true, slug: true } } },
                    },
                },
            }),
            this.prisma.post.count({ where }),
        ]);
        const items = posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            featuredImage: p.featuredImage,
            publishedAt: p.publishedAt,
            author: p.author,
            categories: p.postCategories.map((pc) => pc.category),
        }));
        return {
            data: items,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async create(dto, user) {
        const slug = dto.slug ?? slugify(dto.title);
        await this.assertSlugUnique(slug);
        return this.prisma.post.create({
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt,
                seoTitle: dto.seoTitle,
                seoDescription: dto.seoDescription,
                seoImage: dto.seoImage,
                featuredImageId: dto.featuredImageId,
                authorId: user.sub,
                postCategories: dto.categoryIds?.length
                    ? { create: dto.categoryIds.map((cid) => ({ categoryId: cid })) }
                    : undefined,
            },
            include: POST_INCLUDE,
        });
    }
    async update(id, dto, user) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const isAdmin = user.roles.includes('ADMIN');
        const isEditor = user.roles.includes('EDITOR');
        if (post.authorId !== user.sub && !isAdmin && !isEditor) {
            throw new common_1.ForbiddenException('Permission denied');
        }
        if (dto.slug && dto.slug !== post.slug)
            await this.assertSlugUnique(dto.slug);
        return this.prisma.$transaction(async (tx) => {
            if (dto.categoryIds !== undefined) {
                await tx.postCategory.deleteMany({ where: { postId: id } });
                if (dto.categoryIds.length > 0) {
                    await tx.postCategory.createMany({
                        data: dto.categoryIds.map((cid) => ({ postId: id, categoryId: cid })),
                    });
                }
            }
            return tx.post.update({
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
                include: POST_INCLUDE,
            });
        });
    }
    async delete(id, user) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const isAdmin = user.roles.includes('ADMIN');
        if (post.authorId !== user.sub && !isAdmin)
            throw new common_1.ForbiddenException('Permission denied');
        await this.prisma.post.delete({ where: { id } });
    }
    async publish(id) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const updated = await this.prisma.post.update({
            where: { id },
            data: {
                status: client_1.ContentStatus.PUBLISHED,
                publishedAt: post.publishedAt ?? new Date(),
            },
            include: POST_INCLUDE,
        });
        await this.revalidation.revalidate('post', post.slug);
        return updated;
    }
    async unpublish(id) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: client_1.ContentStatus.DRAFT },
            include: POST_INCLUDE,
        });
        await this.revalidation.revalidate('post', post.slug);
        return updated;
    }
    async getBlocks(postId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return this.prisma.postBlock.findMany({
            where: { postId },
            orderBy: { order: 'asc' },
        });
    }
    async syncBlocks(postId, dto, user) {
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({ where: { id: postId } });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
            if (post.version !== dto.version) {
                throw new common_1.ConflictException('Version mismatch');
            }
            const isAdmin = user.roles.includes('ADMIN');
            const isEditor = user.roles.includes('EDITOR');
            if (post.authorId !== user.sub && !isAdmin && !isEditor) {
                throw new common_1.ForbiddenException('Permission denied');
            }
            const ids = dto.blocks.map((b) => b.id);
            if (new Set(ids).size !== ids.length) {
                throw new common_1.ConflictException('Duplicate block IDs');
            }
            const { validateBlockData } = await Promise.resolve().then(() => require('../pages/blocks/block-validator'));
            for (const b of dto.blocks)
                validateBlockData(b.type, b.data);
            if (ids.length > 0) {
                await tx.postBlock.deleteMany({ where: { postId, id: { notIn: ids } } });
            }
            else {
                await tx.postBlock.deleteMany({ where: { postId } });
            }
            for (const block of dto.blocks) {
                await tx.postBlock.upsert({
                    where: { id: block.id },
                    create: {
                        id: block.id,
                        postId,
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
            return tx.post.update({
                where: { id: postId },
                data: { version: { increment: 1 } },
                include: { blocks: { orderBy: { order: 'asc' } } },
            });
        });
    }
    async assertSlugUnique(slug) {
        const exists = await this.prisma.post.findUnique({ where: { slug } });
        if (exists)
            throw new common_1.ConflictException(`Slug "${slug}" is already in use`);
    }
    async findPublishedPost(slug) {
        const post = await this.prisma.post.findFirst({
            where: { slug, status: client_1.ContentStatus.PUBLISHED },
            select: { id: true },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        revalidation_service_1.RevalidationService])
], PostsService);
//# sourceMappingURL=posts.service.js.map