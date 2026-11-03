import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessagePlatform } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ enum: MessagePlatform })
  @IsEnum(MessagePlatform)
  platform!: MessagePlatform;

  @ApiPropertyOptional({ default: 'text', description: 'text | image | list | template' })
  @IsOptional()
  @IsString()
  messageType?: string;

  @ApiProperty({
    description: 'Message content — validated per platform and type',
    example: { text: 'Hello from CMS!' },
  })
  @IsObject()
  content!: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String], description: 'Filter subscribers by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTags?: string[];

  @ApiPropertyOptional({ description: 'ISO date string for scheduled send' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: MessagePlatform })
  @IsOptional()
  @IsEnum(MessagePlatform)
  platform?: MessagePlatform;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  messageType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledAt?: string;
}

export class SendCampaignDto {
  @ApiPropertyOptional({ description: 'Override target tags for this send' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTags?: string[];

  @ApiPropertyOptional({ default: 20, description: 'Batch size for rate-limited sends' })
  @IsOptional()
  @IsInt()
  @Min(1)
  batchSize?: number;
}
