import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuItemType, MenuLocation } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto, MenuItemDto, SyncMenuItemsDto } from './dto/create-menu.dto';
import { RevalidationService } from '../revalidation/revalidation.service';

@Injectable()
export class MenusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  async findAll() {
    return this.prisma.menu.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return { ...menu, items: this.buildItemTree(menu.items) };
  }

  async findPublicByLocation(location: MenuLocation) {
    const menu = await this.prisma.menu.findUnique({
      where: { location },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!menu || !menu.isActive) throw new NotFoundException('Menu not found');
    return { ...menu, items: this.buildItemTree(menu.items) };
  }

  async create(dto: CreateMenuDto) {
    return this.prisma.menu.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateMenuDto>) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');

    return this.prisma.menu.update({
      where: { id },
      data: { name: dto.name, location: dto.location, isActive: dto.isActive },
    });
  }

  async delete(id: string): Promise<void> {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');
    await this.prisma.menu.delete({ where: { id } });
  }

  async syncItems(menuId: string, dto: SyncMenuItemsDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu not found');

    // Validate: all parentIds reference items within this menu's request
    const requestIds = new Set(dto.items.map((i) => i.id));
    for (const item of dto.items) {
      if (item.parentId && !requestIds.has(item.parentId)) {
        throw new BadRequestException(
          `Item "${item.label}" has parentId "${item.parentId}" that doesn't exist in request`,
        );
      }
    }

    // Validate: no cycles
    this.detectCycles(dto.items);

    // Validate: reference types match
    for (const item of dto.items) {
      this.validateItemType(item);
    }

    // Transactional sync
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

      return { ...updated, items: this.buildItemTree(updated!.items) };
    });
  }

  private detectCycles(items: MenuItemDto[]) {
    const map = new Map(items.map((i) => [i.id, i.parentId]));
    for (const item of items) {
      const visited = new Set<string>();
      let current: string | undefined = item.parentId;
      while (current) {
        if (current === item.id) {
          throw new BadRequestException(`Circular menu item hierarchy detected for "${item.label}"`);
        }
        if (visited.has(current)) break;
        visited.add(current);
        current = map.get(current);
      }
    }
  }

  private validateItemType(item: MenuItemDto) {
    if (item.type === MenuItemType.PAGE && !item.pageId) {
      throw new BadRequestException(`Menu item "${item.label}" of type PAGE requires a pageId`);
    }
    if (item.type === MenuItemType.POST && !item.postId) {
      throw new BadRequestException(`Menu item "${item.label}" of type POST requires a postId`);
    }
    if (item.type === MenuItemType.CATEGORY && !item.categoryId) {
      throw new BadRequestException(
        `Menu item "${item.label}" of type CATEGORY requires a categoryId`,
      );
    }
    if (item.type === MenuItemType.CUSTOM_URL && !item.customUrl) {
      throw new BadRequestException(
        `Menu item "${item.label}" of type CUSTOM_URL requires a customUrl`,
      );
    }
  }

  private buildItemTree(
    items: { id: string; parentId: string | null; [key: string]: unknown }[],
  ) {
    const map = new Map(items.map((i) => [i.id, { ...i, children: [] as unknown[] }]));
    const roots: unknown[] = [];
    for (const item of map.values()) {
      const i = item as { id: string; parentId: string | null; children: unknown[] };
      if (i.parentId && map.has(i.parentId)) {
        (map.get(i.parentId) as { children: unknown[] }).children.push(i);
      } else {
        roots.push(i);
      }
    }
    return roots;
  }
}
