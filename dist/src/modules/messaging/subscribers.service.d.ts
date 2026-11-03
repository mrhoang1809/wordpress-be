import { Subscriber } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateSubscriberDto, UpdateSubscriberDto } from './dto/subscriber.dto';
export declare class SubscribersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findById(id: string): Promise<Subscriber>;
    create(dto: CreateSubscriberDto): Promise<Subscriber>;
    update(id: string, dto: UpdateSubscriberDto): Promise<Subscriber>;
    delete(id: string): Promise<void>;
    bulkImport(subscribers: CreateSubscriberDto[]): Promise<{
        created: number;
        skipped: number;
    }>;
    findForCampaign(platform: 'ZALO' | 'FACEBOOK', targetTags: string[]): Promise<Subscriber[]>;
    getTags(): Promise<string[]>;
}
