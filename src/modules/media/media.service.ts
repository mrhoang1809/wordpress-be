import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharpModule from 'sharp';

// In the NestJS CJS context, sharp is callable directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sharpFn: (input: string) => import('sharp').Sharp = (sharpModule as any).default ?? sharpModule as any;
import { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Images > this size get compressed to WebP (SVG/GIF pass through unchanged)
const COMPRESS_THRESHOLD_BYTES = 50 * 1024; // 50KB

export interface UploadedFileInfo {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const where = query.search
      ? {
          OR: [
            { altText: { contains: query.search, mode: 'insensitive' as const } },
            { storageKey: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.media.count({ where }),
    ]);

    return paginate(media, total, page, pageSize);
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async upload(file: UploadedFileInfo, user: JwtPayload, altText?: string, caption?: string) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported MIME type: ${file.mimetype}`);
    }

    const uploadDest = this.configService.get('media', { infer: true }).uploadDest;
    const originalPath = file.path;
    let storageKey = file.filename;
    let finalMime = file.mimetype;
    let finalSize = file.size;
    let width: number | null = null;
    let height: number | null = null;

    // ── Compress raster images to WebP ──────────────────────────────
    const isRaster = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);

    if (isRaster) {
      // Always convert to WebP for best SEO/performance
      const webpFilename = file.filename.replace(/\.[^.]+$/, '.webp');
      const webpPath = path.join(uploadDest, webpFilename);

      const sharpInstance = sharpFn(originalPath);
      const meta = await sharpInstance.metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;

      // Resize if wider than 1920px (typical max content width)
      const maxWidth = 1920;
      const resizeOpts = meta.width && meta.width > maxWidth
        ? { width: maxWidth, withoutEnlargement: true }
        : undefined;

      const { size: compressedSize } = await sharpInstance
        .rotate()                       // auto-orient from EXIF
        .resize(resizeOpts)
        .webp({ quality: 82, effort: 4 }) // quality 82 = great balance size/quality
        .toFile(webpPath);

      // Delete original raw file
      try { fs.unlinkSync(originalPath); } catch { /* ignore */ }

      storageKey = webpFilename;
      finalMime = 'image/webp';
      finalSize = compressedSize;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? `http://localhost:${process.env.PORT ?? 3001}`;
    const url = `${baseUrl}/api/v1/media/uploads/${storageKey}`;

    return this.prisma.media.create({
      data: {
        storageKey,
        url,
        mimeType: finalMime,
        size: finalSize,
        width: width ?? undefined,
        height: height ?? undefined,
        altText,
        caption,
        createdById: user.sub,
      },
    });
  }

  async update(id: string, dto: { altText?: string; caption?: string }) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    return this.prisma.media.update({
      where: { id },
      data: { altText: dto.altText, caption: dto.caption },
    });
  }

  async delete(id: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    // Delete file from disk
    const uploadDest = this.configService.get('media', { infer: true }).uploadDest;
    const filePath = path.join(uploadDest, media.storageKey);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Log but don't fail — the DB record must still be removed
    }

    await this.prisma.media.delete({ where: { id } });
  }
}
