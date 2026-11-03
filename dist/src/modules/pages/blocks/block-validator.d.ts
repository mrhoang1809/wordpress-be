import { BlockType } from '@prisma/client';
export declare function validateBlockData(type: BlockType, data: unknown): void;
export declare function isValidBlockType(type: string): type is BlockType;
