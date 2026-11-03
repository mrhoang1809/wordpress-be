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
var FacebookProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let FacebookProvider = FacebookProvider_1 = class FacebookProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FacebookProvider_1.name);
    }
    get config() {
        return this.configService.get('messaging', { infer: true }).facebook;
    }
    isConfigured() {
        const c = this.config;
        return !!(c.pageId && c.pageAccessToken);
    }
    get baseUrl() {
        return `https://graph.facebook.com/${this.config.graphApiVersion}/${this.config.pageId}/messages`;
    }
    async sendTextMessage(psid, text) {
        return this.sendToGraph({
            recipient: { id: psid },
            message: { text },
            messaging_type: 'RESPONSE',
        });
    }
    async sendImageMessage(psid, imageUrl) {
        return this.sendToGraph({
            recipient: { id: psid },
            message: {
                attachment: {
                    type: 'image',
                    payload: { url: imageUrl, is_reusable: true },
                },
            },
        });
    }
    async sendButtonTemplate(psid, text, buttons) {
        return this.sendToGraph({
            recipient: { id: psid },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text,
                        buttons,
                    },
                },
            },
        });
    }
    async sendGenericTemplate(psid, elements) {
        return this.sendToGraph({
            recipient: { id: psid },
            message: {
                attachment: {
                    type: 'template',
                    payload: { template_type: 'generic', elements },
                },
            },
        });
    }
    async sendToGraph(body) {
        const c = this.config;
        if (!this.isConfigured()) {
            return { success: false, error: 'Facebook not configured — set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN' };
        }
        try {
            const res = await fetch(`${this.baseUrl}?access_token=${encodeURIComponent(c.pageAccessToken)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = (await res.json());
            if (!res.ok || data.error) {
                return {
                    success: false,
                    error: data.error?.message ?? `HTTP ${res.status}`,
                };
            }
            return { success: true, messageId: data.message_id };
        }
        catch (err) {
            this.logger.error('Facebook send failed', err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
    async send(psid, content) {
        const messageType = content.messageType ?? 'text';
        switch (messageType) {
            case 'text':
                return this.sendTextMessage(psid, content.text ?? '');
            case 'image':
                return this.sendImageMessage(psid, content.imageUrl ?? '');
            case 'button': {
                const text = content.text;
                const buttons = content.buttons ?? [];
                return this.sendButtonTemplate(psid, text, buttons);
            }
            case 'generic': {
                const elements = content.elements ?? [];
                return this.sendGenericTemplate(psid, elements);
            }
            default:
                return this.sendTextMessage(psid, JSON.stringify(content));
        }
    }
};
exports.FacebookProvider = FacebookProvider;
exports.FacebookProvider = FacebookProvider = FacebookProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FacebookProvider);
//# sourceMappingURL=facebook.provider.js.map