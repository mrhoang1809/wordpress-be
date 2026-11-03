import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlockType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { validateBlockData } from './block-validator';
import { JwtPayload } from '../../../common/types/jwt-payload.type';

export interface BlockDto {
  id: string;
  type: BlockType;
  order: number;
  data: Record<string, unknown>;
  schemaVersion?: number;
}

export interface SyncBlocksDto {
  version: number;
  blocks: BlockDto[];
}

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async getBlocks(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');

    return this.prisma.pageBlock.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });
  }

  async syncBlocks(pageId: string, dto: SyncBlocksDto, user: JwtPayload) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Load and verify the page
      const page = await tx.page.findUnique({ where: { id: pageId } });
      if (!page) throw new NotFoundException('Page not found');

      // 2. Optimistic concurrency check
      if (page.version !== dto.version) {
        throw new ConflictException(
          `Version mismatch. Expected ${page.version}, got ${dto.version}. Please reload and try again.`,
        );
      }

      // 3. Ownership or admin check
      const isAdmin = user.roles.includes('ADMIN');
      if (page.createdById !== user.sub && !isAdmin) {
        throw new ForbiddenException('You do not have permission to edit this page');
      }

      // 4. Validate unique block IDs in request
      const requestIds = dto.blocks.map((b) => b.id);
      if (new Set(requestIds).size !== requestIds.length) {
        throw new BadRequestException('Duplicate block IDs in request');
      }

      // 5. Validate all blocks against their type schemas
      for (const block of dto.blocks) {
        if (!Object.values(BlockType).includes(block.type)) {
          throw new BadRequestException(`Unknown block type: ${block.type}`);
        }
        validateBlockData(block.type, block.data);
      }

      // 6. Delete blocks that are no longer in the request
      if (requestIds.length > 0) {
        await tx.pageBlock.deleteMany({
          where: { pageId, id: { notIn: requestIds } },
        });
      } else {
        await tx.pageBlock.deleteMany({ where: { pageId } });
      }

      // 7. Upsert blocks
      for (const block of dto.blocks) {
        await tx.pageBlock.upsert({
          where: { id: block.id },
          create: {
            id: block.id,
            pageId,
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

      // 8. Bump page version
      const updatedPage = await tx.page.update({
        where: { id: pageId },
        data: { version: { increment: 1 }, updatedAt: new Date() },
        include: { blocks: { orderBy: { order: 'asc' } } },
      });

      return updatedPage;
    });
  }
}
