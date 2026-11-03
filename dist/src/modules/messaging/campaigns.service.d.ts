import { CampaignStatus, MessagePlatform } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { SubscribersService } from './subscribers.service';
import { ZaloProvider } from './providers/zalo.provider';
import { FacebookProvider } from './providers/facebook.provider';
export declare class CampaignsService {
    private readonly prisma;
    private readonly configService;
    private readonly subscribersService;
    private readonly zaloProvider;
    private readonly facebookProvider;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService<AppConfig, true>, subscribersService: SubscribersService, zaloProvider: ZaloProvider, facebookProvider: FacebookProvider);
    findAll(query: PaginationQueryDto & {
        status?: CampaignStatus;
        platform?: MessagePlatform;
    }): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
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
    findById(id: string): Promise<{
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
    delete(id: string): Promise<void>;
    send(id: string, user: JwtPayload): Promise<{
        started: boolean;
        recipientCount: number;
    }>;
    cancel(id: string): Promise<void>;
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
    private processCampaign;
    private delay;
    private validateContent;
}
