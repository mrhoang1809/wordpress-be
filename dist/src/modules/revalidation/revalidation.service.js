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
var RevalidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevalidationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RevalidationService = RevalidationService_1 = class RevalidationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RevalidationService_1.name);
    }
    async revalidate(type, slug) {
        const { secret, url } = this.configService.get('revalidation', { infer: true });
        if (!secret || !url) {
            this.logger.warn('Revalidation not configured — skipping cache revalidation');
            return;
        }
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-revalidation-secret': secret,
                },
                body: JSON.stringify({ type, slug }),
            });
            if (!res.ok) {
                this.logger.error(`Revalidation failed for ${type}:${slug} — ${res.status}`);
            }
            else {
                this.logger.log(`Revalidated ${type}:${slug}`);
            }
        }
        catch (err) {
            this.logger.error(`Revalidation request error for ${type}:${slug}`, err);
        }
    }
};
exports.RevalidationService = RevalidationService;
exports.RevalidationService = RevalidationService = RevalidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RevalidationService);
//# sourceMappingURL=revalidation.service.js.map