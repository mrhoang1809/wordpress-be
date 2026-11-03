import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePromotionBannerDto {
  @ApiProperty({ example: 'Ưu Đãi Tháng 10' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  badgeText!: string;

  @ApiProperty({ example: 'Tặng 01 Buổi Phân Tích InBody & 3 Ngày Tập Thử Miễn Phí' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  headline!: string;

  @ApiPropertyOptional({ example: 'Nhận ngay gói trải nghiệm toàn bộ máy kháng thủy lực...' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ default: 'Đăng ký ngay' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaLabel?: string;

  @ApiPropertyOptional({ default: 'Promotion Banner' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaSource?: string;

  @ApiPropertyOptional({ default: 'Chương trình kết thúc sau:' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  countdownLabel?: string;

  @ApiProperty({ description: 'ISO 8601 datetime — when the countdown reaches zero', example: '2026-11-01T23:59:59.000Z' })
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({ default: 'from-brand-900' })
  @IsOptional()
  @IsString()
  bgGradientFrom?: string;

  @ApiPropertyOptional({ default: 'via-brand-800' })
  @IsOptional()
  @IsString()
  bgGradientVia?: string;

  @ApiPropertyOptional({ default: 'to-accent-magenta' })
  @IsOptional()
  @IsString()
  bgGradientTo?: string;

  @ApiPropertyOptional({ default: 'bg-yellow-400' })
  @IsOptional()
  @IsString()
  badgeBg?: string;

  @ApiPropertyOptional({ default: 'text-brand-900' })
  @IsOptional()
  @IsString()
  badgeText2?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdatePromotionBannerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badgeText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  headline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  countdownLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bgGradientFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bgGradientVia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bgGradientTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  badgeBg?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  badgeText2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
