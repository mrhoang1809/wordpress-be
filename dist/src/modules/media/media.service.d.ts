import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
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
export declare class MediaService {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService<AppConfig, true>);
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        createdById: string;
        storageKey: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        caption: string | null;
    }>>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        createdById: string;
        storageKey: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        caption: string | null;
    }>;
    upload(file: UploadedFileInfo, user: JwtPayload, altText?: string, caption?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        createdById: string;
        storageKey: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        caption: string | null;
    }>;
    update(id: string, dto: {
        altText?: string;
        caption?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        createdById: string;
        storageKey: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        caption: string | null;
    }>;
    delete(id: string): Promise<void>;
}
