import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const skip = (page - 1) * pageSize;
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
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

    return paginate(categories, total, page, pageSize);
  }

  async findTree() {
    const all = await this.prisma.category.findMany({
      where: { isActive: true },
      include: { image: { select: { url: true, altText: true } } },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return this.buildTree(all);
  }

  async findById(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: {
        image: { select: { url: true, altText: true } },
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async findPublicBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: { image: { select: { url: true, altText: true } } },
    });
    if (!cat || !cat.isActive) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
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

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');

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

  async delete(id: string): Promise<void> {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, postCategories: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat._count.children > 0) {
      throw new BadRequestException('Cannot delete category with children');
    }
    if (cat._count.postCategories > 0) {
      throw new BadRequestException('Cannot delete category that has posts');
    }
    await this.prisma.category.delete({ where: { id } });
  }

  private buildTree(
    categories: { id: string; parentId: string | null; [key: string]: unknown }[],
  ): unknown[] {
    type NodeWithChildren = { id: string; parentId: string | null; children: unknown[]; [key: string]: unknown };
    const map = new Map<string, NodeWithChildren>(
      categories.map((c) => [c.id, { ...c, children: [] as unknown[] }]),
    );
    const roots: unknown[] = [];
    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }
    return roots;
  }

  private async assertSlugUnique(slug: string) {
    const exists = await this.prisma.category.findUnique({ where: { slug } });
    if (exists) throw new ConflictException(`Category slug "${slug}" already in use`);
  }

  private async assertParentExists(parentId: string) {
    const parent = await this.prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Parent category not found');
  }

  private async assertNoCycle(id: string, newParentId: string): Promise<void> {
    const visited = new Set<string>();
    let cursor: string | null = newParentId;
    while (cursor !== null) {
      if (cursor === id) {
        throw new BadRequestException('Circular category hierarchy detected');
      }
      if (visited.has(cursor)) break;
      visited.add(cursor);
      // eslint-disable-next-line no-await-in-loop
      const row: { parentId: string | null } | null = await this.prisma.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = row?.parentId ?? null;
    }
  }
}
