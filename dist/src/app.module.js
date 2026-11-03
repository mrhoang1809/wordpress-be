"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = require("./config/configuration");
const database_module_1 = require("./database/database.module");
const revalidation_module_1 = require("./modules/revalidation/revalidation.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const pages_module_1 = require("./modules/pages/pages.module");
const categories_module_1 = require("./modules/categories/categories.module");
const menus_module_1 = require("./modules/menus/menus.module");
const posts_module_1 = require("./modules/posts/posts.module");
const media_module_1 = require("./modules/media/media.module");
const settings_module_1 = require("./modules/settings/settings.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const promotions_module_1 = require("./modules/promotions/promotions.module");
const locations_module_1 = require("./modules/locations/locations.module");
const trial_registrations_module_1 = require("./modules/trial-registrations/trial-registrations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.configuration],
                validationSchema: configuration_1.validationSchema,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            database_module_1.DatabaseModule,
            revalidation_module_1.RevalidationModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            pages_module_1.PagesModule,
            categories_module_1.CategoriesModule,
            menus_module_1.MenusModule,
            posts_module_1.PostsModule,
            media_module_1.MediaModule,
            settings_module_1.SettingsModule,
            messaging_module_1.MessagingModule,
            promotions_module_1.PromotionsModule,
            locations_module_1.LocationsModule,
            trial_registrations_module_1.TrialRegistrationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map