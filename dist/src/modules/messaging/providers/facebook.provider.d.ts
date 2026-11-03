import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';
export interface FacebookSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare class FacebookProvider {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService<AppConfig, true>);
    private get config();
    isConfigured(): boolean;
    private get baseUrl();
    sendTextMessage(psid: string, text: string): Promise<FacebookSendResult>;
    sendImageMessage(psid: string, imageUrl: string): Promise<FacebookSendResult>;
    sendButtonTemplate(psid: string, text: string, buttons: Array<{
        type: string;
        title: string;
        url?: string;
        payload?: string;
    }>): Promise<FacebookSendResult>;
    sendGenericTemplate(psid: string, elements: Array<{
        title: string;
        image_url?: string;
        subtitle?: string;
        buttons?: Array<{
            type: string;
            title: string;
            url?: string;
        }>;
    }>): Promise<FacebookSendResult>;
    private sendToGraph;
    send(psid: string, content: Record<string, unknown>): Promise<FacebookSendResult>;
}
