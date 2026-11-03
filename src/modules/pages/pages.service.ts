import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { RevalidationService } from '../revalidation/revalidation.service';

function slugify(text: string): string {
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
  blocks: { orderBy: { order: 'asc' as const } },
};

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  async findAll(
    query: PaginationQueryDto & { status?: ContentStatus; sortBy?: string },
  ) {
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

    return paginate(pages, total, page, pageSize);
  }

  async findById(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: PAGE_INCLUDE,
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findPublicBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { orderBy: { order: 'asc' } },
        featuredImage: { select: { url: true, altText: true } },
      },
    });
    if (!page || page.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Page not found');
    }
    // Strip internal fields
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

  async create(dto: CreatePageDto, user: JwtPayload) {
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

  async update(id: string, dto: UpdatePageDto, user: JwtPayload) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const isAdmin = user.roles.includes('ADMIN');
    if (page.createdById !== user.sub && !isAdmin) {
      throw new ForbiddenException('Permission denied');
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

  async delete(id: string, user: JwtPayload): Promise<void> {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const isAdmin = user.roles.includes('ADMIN');
    if (page.createdById !== user.sub && !isAdmin) {
      throw new ForbiddenException('Permission denied');
    }

    await this.prisma.page.delete({ where: { id } });
  }

  async publish(id: string, user: JwtPayload) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: page.publishedAt ?? new Date(),
      },
      include: PAGE_INCLUDE,
    });

    await this.revalidation.revalidate('page', page.slug);
    return updated;
  }

  async unpublish(id: string, user: JwtPayload) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const updated = await this.prisma.page.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
      include: PAGE_INCLUDE,
    });

    await this.revalidation.revalidate('page', page.slug);
    return updated;
  }

  async duplicate(id: string, user: JwtPayload) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { blocks: { orderBy: { order: 'asc' } } },
    });
    if (!page) throw new NotFoundException('Page not found');

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
        status: ContentStatus.DRAFT,
        blocks: {
          create: page.blocks.map((b) => ({
            type: b.type,
            order: b.order,
            data: b.data as object,
            schemaVersion: b.schemaVersion,
          })),
        },
      },
      include: PAGE_INCLUDE,
    });
  }

  async generatePreviewToken(id: string, user: JwtPayload): Promise<{ token: string }> {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    // We return the page ID + a signed indicator — the actual JWT signing
    // is done in the preview module. Here we just return the pageId for simplicity;
    // the controller/preview service handles token creation.
    return { token: id };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async assertSlugUnique(slug: string): Promise<void> {
    const existing = await this.prisma.page.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" is already in use`);
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let counter = 1;
    while (await this.prisma.page.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
