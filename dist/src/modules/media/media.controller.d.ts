import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { MediaService, UploadedFileInfo } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
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
    serveFile(): null;
    findOne(id: string): Promise<{
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
