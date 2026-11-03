import { MessagePlatform } from '@prisma/client';
export declare class CreateTemplateDto {
    name: string;
    platform: MessagePlatform;
    messageType?: string;
    content: Record<string, unknown>;
    isActive?: boolean;
}
export declare class UpdateTemplateDto {
    name?: string;
    platform?: MessagePlatform;
    messageType?: string;
    content?: Record<string, unknown>;
    isActive?: boolean;
}
