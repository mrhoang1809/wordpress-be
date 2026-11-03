import { MessagePlatform } from '@prisma/client';
export declare class CreateCampaignDto {
    title: string;
    platform: MessagePlatform;
    messageType?: string;
    content: Record<string, unknown>;
    targetTags?: string[];
    scheduledAt?: string;
}
export declare class UpdateCampaignDto {
    title?: string;
    platform?: MessagePlatform;
    messageType?: string;
    content?: Record<string, unknown>;
    targetTags?: string[];
    scheduledAt?: string;
}
export declare class SendCampaignDto {
    targetTags?: string[];
    batchSize?: number;
}
