import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessagePlatform } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ enum: MessagePlatform })
  @IsEnum(MessagePlatform)
  platform!: MessagePlatform;

  @ApiPropertyOptional({ default: 'text' })
  @IsOptional()
  @IsString()
  messageType?: string;

  @ApiProperty({ description: 'Template content (JSON)' })
  @IsObject()
  content!: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
