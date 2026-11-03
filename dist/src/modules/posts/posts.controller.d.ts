import { ContentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SyncBlocksDto } from '../pages/dto/sync-blocks.dto';
declare class PostQueryDto extends PaginationQueryDto {
    status?: ContentStatus;
    categorySlug?: string;
}
declare class CreatePublicCommentDto {
    name: string;
    text: string;
}
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    findAll(query: PostQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        postCategories: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            createdAt: Date;
            postId: string;
            categoryId: string;
        })[];
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>>;
    findOne(id: string): Promise<{
        postCategories: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            createdAt: Date;
            postId: string;
            categoryId: string;
        })[];
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>;
    create(dto: CreatePostDto, user: JwtPayload): Promise<{
        postCategories: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            createdAt: Date;
            postId: string;
            categoryId: string;
        })[];
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>;
    update(id: string, dto: CreatePostDto, user: JwtPayload): Promise<{
        postCategories: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            createdAt: Date;
            postId: string;
            categoryId: string;
        })[];
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>;
    delete(id: string, user: JwtPayload): Promise<void>;
    publish(id: string): Promise<{
        postCategories: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            createdAt: Date;
            postId: string;
            categoryId: string;
        })[];
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>;
    unpublish(id: string): Promise<{
        postCategories: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            createdAt: Date;
            postId: string;
            categoryId: string;
        })[];
        featuredImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        blocks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            order: number;
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>;
    getBlocks(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        order: number;
        postId: string;
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
            postId: string;
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
        authorId: string;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        version: number;
    }>;
}
export declare class PublicPostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    listPublic(page?: string, pageSize?: string, categorySlug?: string, search?: string): Promise<{
        data: {
            id: string;
            title: string;
            slug: string;
            excerpt: string | null;
            featuredImage: {
                url: string;
                altText: string | null;
            } | null;
            publishedAt: Date | null;
            author: {
                id: string;
                firstName: string;
                lastName: string;
            };
            categories: {
                id: string;
                name: string;
                slug: string;
            }[];
        }[];
        meta: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    getEngagement(slug: string): Promise<{
        viewCount: number;
        likeCount: number;
        commentCount: number;
        comments: {
            id: string;
            createdAt: Date;
            name: string;
            text: string;
        }[];
    }>;
    recordView(slug: string): Promise<{
        viewCount: number;
        likeCount: number;
        commentCount: number;
        comments: {
            id: string;
            createdAt: Date;
            name: string;
            text: string;
        }[];
    }>;
    recordLike(slug: string): Promise<{
        viewCount: number;
        likeCount: number;
        commentCount: number;
        comments: {
            id: string;
            createdAt: Date;
            name: string;
            text: string;
        }[];
    }>;
    createComment(slug: string, dto: CreatePublicCommentDto): Promise<{
        viewCount: number;
        likeCount: number;
        commentCount: number;
        comments: {
            id: string;
            createdAt: Date;
            name: string;
            text: string;
        }[];
    }>;
    findPublic(slug: string): Promise<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: {
            url: string;
            altText: string | null;
        } | null;
        publishedAt: Date | null;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        seo: {
            title: string;
            description: string | null;
            image: string | null;
        };
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
