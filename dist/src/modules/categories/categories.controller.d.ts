import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: CreateCategoryDto): Promise<{
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
}
export declare class PublicCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getTree(): Promise<unknown[]>;
    findPublic(slug: string): Promise<{
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
}
