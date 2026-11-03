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
exports.SubscribersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../common/decorators/require-permissions.decorator");
const subscribers_service_1 = require("./subscribers.service");
const subscriber_dto_1 = require("./dto/subscriber.dto");
let SubscribersController = class SubscribersController {
    constructor(subscribersService) {
        this.subscribersService = subscribersService;
    }
    findAll(query) {
        return this.subscribersService.findAll(query);
    }
    getTags() {
        return this.subscribersService.getTags();
    }
    findOne(id) {
        return this.subscribersService.findById(id);
    }
    create(dto) {
        return this.subscribersService.create(dto);
    }
    bulkImport(dto) {
        return this.subscribersService.bulkImport(dto.subscribers);
    }
    update(id, dto) {
        return this.subscribersService.update(id, dto);
    }
    delete(id) {
        return this.subscribersService.delete(id);
    }
};
exports.SubscribersController = SubscribersController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:list'),
    (0, swagger_1.ApiOperation)({ summary: 'List subscribers (paginated, filterable)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:list'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all unique subscriber tags' }),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:read'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscriber by ID' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a subscriber' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscriber_dto_1.CreateSubscriberDto]),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk import subscribers (skips duplicates)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscriber_dto_1.ImportSubscribersDto]),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subscriber' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subscriber_dto_1.UpdateSubscriberDto]),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('subscribers:delete'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subscriber' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscribersController.prototype, "delete", null);
exports.SubscribersController = SubscribersController = __decorate([
    (0, swagger_1.ApiTags)('messaging-subscribers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('messaging/subscribers'),
    __metadata("design:paramtypes", [subscribers_service_1.SubscribersService])
], SubscribersController);
//# sourceMappingURL=subscribers.controller.js.map