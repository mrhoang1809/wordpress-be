import { ContentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PagesService } from './pages.service';
import { BlocksService } from './blocks/blocks.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { SyncBlocksDto } from './dto/sync-blocks.dto';
declare class PageQueryDto extends PaginationQueryDto {
    status?: ContentStatus;
    sortBy?: string;
}
export declare class PagesController {
    private readonly pagesService;
    private readonly blocksService;
    constructor(pagesService: PagesService, blocksService: BlocksService);
    findAll(query: PageQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
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
    findOne(id: string): Promise<{
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
    getBlocks(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        order: number;
        pageId: string;
        type: import(".prisma/client").$Enums.BlockType;
        schemaVersion: number;
    }[]>;
    syncBlocks(id: string, dto: SyncBlocksDto, user: JwtPayload): Promise<{
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
}
export declare class PublicPagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    findPublic(slug: string): Promise<{
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
}
export {};
