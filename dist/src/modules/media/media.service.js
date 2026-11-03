"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const sharpModule = require("sharp");
const sharpFn = sharpModule.default ?? sharpModule;
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];
const COMPRESS_THRESHOLD_BYTES = 50 * 1024;
let MediaService = class MediaService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = query.search
            ? {
                OR: [
                    { altText: { contains: query.search, mode: 'insensitive' } },
                    { storageKey: { contains: query.search, mode: 'insensitive' } },
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
        return (0, pagination_dto_1.paginate)(media, total, page, pageSize);
    }
    async findById(id) {
        const media = await this.prisma.media.findUnique({ where: { id } });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        return media;
    }
    async upload(file, user, altText, caption) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Unsupported MIME type: ${file.mimetype}`);
        }
        const uploadDest = this.configService.get('media', { infer: true }).uploadDest;
        const originalPath = file.path;
        let storageKey = file.filename;
        let finalMime = file.mimetype;
        let finalSize = file.size;
        let width = null;
        let height = null;
        const isRaster = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        if (isRaster) {
            const webpFilename = file.filename.replace(/\.[^.]+$/, '.webp');
            const webpPath = path.join(uploadDest, webpFilename);
            const sharpInstance = sharpFn(originalPath);
            const meta = await sharpInstance.metadata();
            width = meta.width ?? null;
            height = meta.height ?? null;
            const maxWidth = 1920;
            const resizeOpts = meta.width && meta.width > maxWidth
                ? { width: maxWidth, withoutEnlargement: true }
                : undefined;
            const { size: compressedSize } = await sharpInstance
                .rotate()
                .resize(resizeOpts)
                .webp({ quality: 82, effort: 4 })
                .toFile(webpPath);
            try {
                fs.unlinkSync(originalPath);
            }
            catch { }
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
    async update(id, dto) {
        const media = await this.prisma.media.findUnique({ where: { id } });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        return this.prisma.media.update({
            where: { id },
            data: { altText: dto.altText, caption: dto.caption },
        });
    }
    async delete(id) {
        const media = await this.prisma.media.findUnique({ where: { id } });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        const uploadDest = this.configService.get('media', { infer: true }).uploadDest;
        const filePath = path.join(uploadDest, media.storageKey);
        try {
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
        }
        catch {
        }
        await this.prisma.media.delete({ where: { id } });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map