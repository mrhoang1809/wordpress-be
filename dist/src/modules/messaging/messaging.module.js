"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const subscribers_service_1 = require("./subscribers.service");
const campaigns_service_1 = require("./campaigns.service");
const templates_service_1 = require("./templates.service");
const subscribers_controller_1 = require("./subscribers.controller");
const campaigns_controller_1 = require("./campaigns.controller");
const templates_controller_1 = require("./templates.controller");
const zalo_provider_1 = require("./providers/zalo.provider");
const facebook_provider_1 = require("./providers/facebook.provider");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Module)({
        providers: [
            subscribers_service_1.SubscribersService,
            campaigns_service_1.CampaignsService,
            templates_service_1.TemplatesService,
            zalo_provider_1.ZaloProvider,
            facebook_provider_1.FacebookProvider,
        ],
        controllers: [subscribers_controller_1.SubscribersController, campaigns_controller_1.CampaignsController, templates_controller_1.TemplatesController],
        exports: [subscribers_service_1.SubscribersService, campaigns_service_1.CampaignsService, templates_service_1.TemplatesService],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map