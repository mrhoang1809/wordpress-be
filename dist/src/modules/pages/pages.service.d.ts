import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { RevalidationService } from '../revalidation/revalidation.service';
export declare class PagesService {
    private readonly prisma;
    private readonly revalidation;
    constructor(prisma: PrismaService, revalidation: RevalidationService);
    findAll(query: PaginationQueryDto & {
        status?: ContentStatus;
        sortBy?: string;
    }): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>>;
    findById(id: string): Promise<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
    findPublicBySlug(slug: string): Promise<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        status: import(".prisma/client").$Enums.ContentStatus;
        featuredImage: {
            url: string;
            altText: string | null;
        } | null;
        seo: {
            title: string;
            description: string | null;
            image: string | null;
        };
        publishedAt: Date | null;
        blocks: {
            id: string;
            type: import(".prisma/client").$Enums.BlockType;
            order: number;
            schemaVersion: number;
            data: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
    create(dto: CreatePageDto, user: JwtPayload): Promise<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
    update(id: string, dto: UpdatePageDto, user: JwtPayload): Promise<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
    delete(id: string, user: JwtPayload): Promise<void>;
    publish(id: string, user: JwtPayload): Promise<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
    unpublish(id: string, user: JwtPayload): Promise<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
    duplicate(id: string, user: JwtPayload): Promise<{
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            pageId: string;
            type: import(".prisma/client").$Enums.BlockType;
            schemaVersion: number;
        }[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContentStatus;
        slug: string;
        title: string;
        excerpt: string | null;
        featuredImageId: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImage: string | null;
        publishedAt: Date | null;
        version: number;
        createdById: string;
    }>;
    generatePreviewToken(id: string, user: JwtPayload): Promise<{
        token: string;
    }>;
    private assertSlugUnique;
    private generateUniqueSlug;
}
