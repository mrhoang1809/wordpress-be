import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto, UpdateSubscriberDto, ImportSubscribersDto } from './dto/subscriber.dto';
export declare class SubscribersController {
    private readonly subscribersService;
    constructor(subscribersService: SubscribersService);
    findAll(query: PaginationQueryDto & {
        platform?: string;
        tag?: string;
    }): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        phone: string | null;
        tags: string[];
        zaloUserId: string | null;
        facebookPsid: string | null;
        notes: string | null;
    }>>;
    getTags(): Promise<string[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        phone: string | null;
        tags: string[];
        zaloUserId: string | null;
        facebookPsid: string | null;
        notes: string | null;
    }>;
    create(dto: CreateSubscriberDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        phone: string | null;
        tags: string[];
        zaloUserId: string | null;
        facebookPsid: string | null;
        notes: string | null;
    }>;
    bulkImport(dto: ImportSubscribersDto): Promise<{
        created: number;
        skipped: number;
    }>;
    update(id: string, dto: UpdateSubscriberDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        phone: string | null;
        tags: string[];
        zaloUserId: string | null;
        facebookPsid: string | null;
        notes: string | null;
    }>;
    delete(id: string): Promise<void>;
}
