import { CampaignStatus, MessagePlatform } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
declare class CampaignQueryDto extends PaginationQueryDto {
    status?: CampaignStatus;
    platform?: MessagePlatform;
}
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(query: CampaignQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        _count: {
            recipients: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        title: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdById: string;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
        targetTags: string[];
        scheduledAt: Date | null;
        totalRecipients: number;
        sentCount: number;
        failedCount: number;
        startedAt: Date | null;
        completedAt: Date | null;
    }>>;
    findOne(id: string): Promise<{
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        recipients: ({
            subscriber: {
                id: string;
                name: string;
                phone: string | null;
                zaloUserId: string | null;
                facebookPsid: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.DeliveryStatus;
            campaignId: string;
            subscriberId: string;
            platformMessageId: string | null;
            errorMessage: string | null;
            sentAt: Date | null;
            deliveredAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        title: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdById: string;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
        targetTags: string[];
        scheduledAt: Date | null;
        totalRecipients: number;
        sentCount: number;
        failedCount: number;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    getStats(id: string): Promise<{
        total: number;
        pending: number;
        sent: number;
        failed: number;
        delivered: number;
        read: number;
        sentCount: number;
        failedCount: number;
        status: import(".prisma/client").$Enums.CampaignStatus;
    }>;
    create(dto: CreateCampaignDto, user: JwtPayload): Promise<{
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        title: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdById: string;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
        targetTags: string[];
        scheduledAt: Date | null;
        totalRecipients: number;
        sentCount: number;
        failedCount: number;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    update(id: string, dto: UpdateCampaignDto, user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        title: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdById: string;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
        targetTags: string[];
        scheduledAt: Date | null;
        totalRecipients: number;
        sentCount: number;
        failedCount: number;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    send(id: string, user: JwtPayload): Promise<{
        started: boolean;
        recipientCount: number;
    }>;
    cancel(id: string): Promise<void>;
    delete(id: string): Promise<void>;
}
export {};
