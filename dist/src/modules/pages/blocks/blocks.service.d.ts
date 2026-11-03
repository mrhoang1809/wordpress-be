import { BlockType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
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
export declare class BlocksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBlocks(pageId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        order: number;
        pageId: string;
        type: import(".prisma/client").$Enums.BlockType;
        schemaVersion: number;
    }[]>;
    syncBlocks(pageId: string, dto: SyncBlocksDto, user: JwtPayload): Promise<{
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
}
