import { BlockType } from '@prisma/client';
export declare class BlockItemDto {
    id: string;
    type: BlockType;
    order: number;
    data: Record<string, unknown>;
    schemaVersion?: number;
}
export declare class SyncBlocksDto {
    version: number;
    blocks: BlockItemDto[];
}
