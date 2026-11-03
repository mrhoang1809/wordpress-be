import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlockType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BlockItemDto {
  @ApiProperty({ description: 'Stable block CUID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ enum: BlockType })
  @IsEnum(BlockType)
  type!: BlockType;

  @ApiProperty({ description: 'Zero-based display order' })
  @IsInt()
  @Min(0)
  order!: number;

  @ApiProperty({ description: 'Block configuration data (type-specific)' })
  @IsObject()
  data!: Record<string, unknown>;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  schemaVersion?: number;
}

export class SyncBlocksDto {
  @ApiProperty({ description: 'Current page version (optimistic concurrency)' })
  @IsInt()
  @Min(1)
  version!: number;

  @ApiProperty({ type: [BlockItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockItemDto)
  blocks!: BlockItemDto[];
}
