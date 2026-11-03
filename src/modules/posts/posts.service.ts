import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { slugify as transliterateSlugify } from 'transliteration';
import { PrismaService } from '../../database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { BlocksService as PageBlocksService, SyncBlocksDto } from '../pages/blocks/blocks.service';
import { RevalidationService } from '../revalidation/revalidation.service';

function slugify(text: string): string {
  // transliterateSlugify handles Vietnamese → ASCII (e.g. "Bài Viết" → "bai-viet")
  return transliterateSlugify(text, { lowercase: true, separator: '-', trim: true })
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 500);
}

const POST_INCLUDE = {
  author: { select: { id: true, firstName: true, lastName: true, email: true } },
  featuredImage: { select: { id: true, url: true, altText: true } },
  blocks: { orderBy: { order: 'asc' as const } },
  postCategories: { include: { category: { select: { id: true, name: true, slug: true } } } },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  async findAll(query: PaginationQueryDto & { status?: ContentStatus; categorySlug?: string }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
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

    return paginate(posts, total, page, pageSize);
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, include: POST_INCLUDE });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findPublicBySlug(slug: string) {
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
    if (!post || post.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
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

  async getPublicEngagement(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
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
    if (!post) throw new NotFoundException('Post not found');

    return {
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.comments.length,
      comments: post.comments,
    };
  }

  async recordPublicView(slug: string) {
    const post = await this.findPublishedPost(slug);
    await this.prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
    return this.getPublicEngagement(slug);
  }

  async recordPublicLike(slug: string) {
    const post = await this.findPublishedPost(slug);
    await this.prisma.post.update({
      where: { id: post.id },
      data: { likeCount: { increment: 1 } },
    });
    return this.getPublicEngagement(slug);
  }

  async createPublicComment(slug: string, dto: { name: string; text: string }) {
    const post = await this.findPublishedPost(slug);
    await this.prisma.postComment.create({
      data: { postId: post.id, name: dto.name.trim(), text: dto.text.trim() },
    });
    return this.getPublicEngagement(slug);
  }

  async listPublicPosts(query: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    search?: string;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 12, 50);
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      status: ContentStatus.PUBLISHED,
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

  async create(dto: CreatePostDto, user: JwtPayload) {
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

  async update(id: string, dto: Partial<CreatePostDto>, user: JwtPayload) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const isAdmin = user.roles.includes('ADMIN');
    const isEditor = user.roles.includes('EDITOR');
    if (post.authorId !== user.sub && !isAdmin && !isEditor) {
      throw new ForbiddenException('Permission denied');
    }

    if (dto.slug && dto.slug !== post.slug) await this.assertSlugUnique(dto.slug);

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

  async delete(id: string, user: JwtPayload): Promise<void> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const isAdmin = user.roles.includes('ADMIN');
    if (post.authorId !== user.sub && !isAdmin) throw new ForbiddenException('Permission denied');

    await this.prisma.post.delete({ where: { id } });
  }

  async publish(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: post.publishedAt ?? new Date(),
      },
      include: POST_INCLUDE,
    });

    await this.revalidation.revalidate('post', post.slug);
    return updated;
  }

  async unpublish(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const updated = await this.prisma.post.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
      include: POST_INCLUDE,
    });

    await this.revalidation.revalidate('post', post.slug);
    return updated;
  }

  async getBlocks(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.postBlock.findMany({
      where: { postId },
      orderBy: { order: 'asc' },
    });
  }

  async syncBlocks(postId: string, dto: SyncBlocksDto, user: JwtPayload) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post) throw new NotFoundException('Post not found');
      if (post.version !== dto.version) {
        throw new ConflictException('Version mismatch');
      }

      const isAdmin = user.roles.includes('ADMIN');
      const isEditor = user.roles.includes('EDITOR');
      if (post.authorId !== user.sub && !isAdmin && !isEditor) {
        throw new ForbiddenException('Permission denied');
      }

      const ids = dto.blocks.map((b) => b.id);
      if (new Set(ids).size !== ids.length) {
        throw new ConflictException('Duplicate block IDs');
      }

      const { validateBlockData } = await import('../pages/blocks/block-validator');
      for (const b of dto.blocks) validateBlockData(b.type, b.data);

      if (ids.length > 0) {
        await tx.postBlock.deleteMany({ where: { postId, id: { notIn: ids } } });
      } else {
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
            data: block.data as object,
            schemaVersion: block.schemaVersion ?? 1,
          },
          update: {
            type: block.type,
            order: block.order,
            data: block.data as object,
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

  private async assertSlugUnique(slug: string) {
    const exists = await this.prisma.post.findUnique({ where: { slug } });
    if (exists) throw new ConflictException(`Slug "${slug}" is already in use`);
  }

  private async findPublishedPost(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
