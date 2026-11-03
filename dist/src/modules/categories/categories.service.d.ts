import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        image: {
            url: string;
            altText: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        imageId: string | null;
        parentId: string | null;
        order: number;
    }>>;
    findTree(): Promise<unknown[]>;
    findById(id: string): Promise<{
        image: {
            url: string;
            altText: string | null;
        } | null;
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        imageId: string | null;
        parentId: string | null;
        order: number;
    }>;
    findPublicBySlug(slug: string): Promise<{
        image: {
            url: string;
            altText: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        imageId: string | null;
        parentId: string | null;
        order: number;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        image: {
            url: string;
            altText: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        imageId: string | null;
        parentId: string | null;
        order: number;
    }>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<{
        image: {
            url: string;
            altText: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        imageId: string | null;
        parentId: string | null;
        order: number;
    }>;
    delete(id: string): Promise<void>;
    private buildTree;
    private assertSlugUnique;
    private assertParentExists;
    private assertNoCycle;
}
