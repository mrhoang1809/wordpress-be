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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTrialRegistrationsController = exports.PublicTrialRegistrationsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../common/decorators/require-permissions.decorator");
const trial_registrations_service_1 = require("./trial-registrations.service");
class CreateTrialDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTrialDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ' }),
    __metadata("design:type", String)
], CreateTrialDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrialDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTrialDto.prototype, "source", void 0);
let PublicTrialRegistrationsController = class PublicTrialRegistrationsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(dto) {
        return this.svc.create(dto);
    }
};
exports.PublicTrialRegistrationsController = PublicTrialRegistrationsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a trial registration (public)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTrialDto]),
    __metadata("design:returntype", void 0)
], PublicTrialRegistrationsController.prototype, "create", null);
exports.PublicTrialRegistrationsController = PublicTrialRegistrationsController = __decorate([
    (0, swagger_1.ApiTags)('trial-registrations'),
    (0, common_1.Controller)('public/trial-registrations'),
    __metadata("design:paramtypes", [trial_registrations_service_1.TrialRegistrationsService])
], PublicTrialRegistrationsController);
let AdminTrialRegistrationsController = class AdminTrialRegistrationsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(page, pageSize) {
        return this.svc.findAll({
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 50,
        });
    }
};
exports.AdminTrialRegistrationsController = AdminTrialRegistrationsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List all trial registrations (admin)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminTrialRegistrationsController.prototype, "findAll", null);
exports.AdminTrialRegistrationsController = AdminTrialRegistrationsController = __decorate([
    (0, swagger_1.ApiTags)('trial-registrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('trial-registrations'),
    __metadata("design:paramtypes", [trial_registrations_service_1.TrialRegistrationsService])
], AdminTrialRegistrationsController);
//# sourceMappingURL=trial-registrations.controller.js.map