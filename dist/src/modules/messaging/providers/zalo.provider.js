"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ZaloProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ZaloProvider = ZaloProvider_1 = class ZaloProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ZaloProvider_1.name);
    }
    get config() {
        return this.configService.get('messaging', { infer: true }).zalo;
    }
    isConfigured() {
        const c = this.config;
        return !!(c.oaId && c.oaSecret && c.oaRefreshToken);
    }
    async getAccessToken() {
        const c = this.config;
        if (!this.isConfigured()) {
            throw new Error('Zalo OA not configured — set ZALO_OA_ID, ZALO_OA_SECRET, ZALO_OA_REFRESH_TOKEN');
        }
        const url = `${c.apiUrl}/oa/access_token`;
        const body = {
            refresh_token: c.oaRefreshToken,
            app_id: c.oaId,
            grant_type: 'refresh_token',
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(body).toString(),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Zalo token refresh failed (${res.status}): ${text}`);
        }
        const data = (await res.json());
        if (data.error) {
            throw new Error(`Zalo token error: ${data.message ?? data.error}`);
        }
        return data.access_token;
    }
    async sendTextMessage(accessToken, zaloUserId, text) {
        return this.sendMessage(accessToken, zaloUserId, {
            recipient: { user_id: zaloUserId },
            message: { text },
        });
    }
    async sendImageMessage(accessToken, zaloUserId, imageUrl, caption) {
        return this.sendMessage(accessToken, zaloUserId, {
            recipient: { user_id: zaloUserId },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'media',
                        elements: [
                            {
                                media_type: 'image',
                                url: imageUrl,
                                ...(caption ? { caption: caption } : {}),
                            },
                        ],
                    },
                },
            },
        });
    }
    async sendMessage(accessToken, zaloUserId, body) {
        const c = this.config;
        const url = `${c.apiUrl}/oa/message`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': accessToken,
                },
                body: JSON.stringify(body),
            });
            const data = (await res.json());
            if (data.error && data.error !== 0) {
                return { success: false, error: data.message ?? `Zalo error ${data.error}` };
            }
            return { success: true, messageId: data.data?.msg_id };
        }
        catch (err) {
            this.logger.error(`Zalo send failed for user ${zaloUserId}`, err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
    async send(zaloUserId, content) {
        if (!this.isConfigured()) {
            return { success: false, error: 'Zalo OA not configured' };
        }
        const accessToken = await this.getAccessToken();
        const messageType = content.messageType ?? 'text';
        switch (messageType) {
            case 'text':
                return this.sendTextMessage(accessToken, zaloUserId, content.text ?? '');
            case 'image': {
                const imageUrl = content.imageUrl;
                const caption = content.caption;
                return this.sendImageMessage(accessToken, zaloUserId, imageUrl, caption);
            }
            default:
                return this.sendTextMessage(accessToken, zaloUserId, JSON.stringify(content));
        }
    }
};
exports.ZaloProvider = ZaloProvider;
exports.ZaloProvider = ZaloProvider = ZaloProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ZaloProvider);
//# sourceMappingURL=zalo.provider.js.map