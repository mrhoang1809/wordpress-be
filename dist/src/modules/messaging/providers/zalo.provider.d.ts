import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';
export interface ZaloSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare class ZaloProvider {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService<AppConfig, true>);
    private get config();
    isConfigured(): boolean;
    getAccessToken(): Promise<string>;
    sendTextMessage(accessToken: string, zaloUserId: string, text: string): Promise<ZaloSendResult>;
    sendImageMessage(accessToken: string, zaloUserId: string, imageUrl: string, caption?: string): Promise<ZaloSendResult>;
    private sendMessage;
    send(zaloUserId: string, content: Record<string, unknown>): Promise<ZaloSendResult>;
}
