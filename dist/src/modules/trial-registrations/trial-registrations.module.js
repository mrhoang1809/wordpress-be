"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialRegistrationsModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const settings_module_1 = require("../settings/settings.module");
const trial_registrations_controller_1 = require("./trial-registrations.controller");
const trial_registrations_service_1 = require("./trial-registrations.service");
let TrialRegistrationsModule = class TrialRegistrationsModule {
};
exports.TrialRegistrationsModule = TrialRegistrationsModule;
exports.TrialRegistrationsModule = TrialRegistrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, settings_module_1.SettingsModule],
        controllers: [trial_registrations_controller_1.PublicTrialRegistrationsController, trial_registrations_controller_1.AdminTrialRegistrationsController],
        providers: [trial_registrations_service_1.TrialRegistrationsService],
    })
], TrialRegistrationsModule);
//# sourceMappingURL=trial-registrations.module.js.map