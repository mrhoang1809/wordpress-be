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
exports.PublicMenusController = exports.MenusController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../common/decorators/require-permissions.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const menus_service_1 = require("./menus.service");
const create_menu_dto_1 = require("./dto/create-menu.dto");
let MenusController = class MenusController {
    constructor(menusService) {
        this.menusService = menusService;
    }
    findAll() {
        return this.menusService.findAll();
    }
    findOne(id) {
        return this.menusService.findById(id);
    }
    create(dto) {
        return this.menusService.create(dto);
    }
    update(id, dto) {
        return this.menusService.update(id, dto);
    }
    delete(id) {
        return this.menusService.delete(id);
    }
    syncItems(id, dto) {
        return this.menusService.syncItems(id, dto);
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:list'),
    (0, swagger_1.ApiOperation)({ summary: 'List all menus' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:read'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu with nested items' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new menu' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Update menu metadata' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:delete'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a menu' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/items'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk sync menu items (transactional)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_menu_dto_1.SyncMenuItemsDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "syncItems", null);
exports.MenusController = MenusController = __decorate([
    (0, swagger_1.ApiTags)('menus'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], MenusController);
let PublicMenusController = class PublicMenusController {
    constructor(menusService) {
        this.menusService = menusService;
    }
    findPublic(location) {
        return this.menusService.findPublicByLocation(location);
    }
};
exports.PublicMenusController = PublicMenusController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':location'),
    (0, swagger_1.ApiParam)({ name: 'location', enum: client_1.MenuLocation }),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu by location (public)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicMenusController.prototype, "findPublic", null);
exports.PublicMenusController = PublicMenusController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('public/menus'),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], PublicMenusController);
//# sourceMappingURL=menus.controller.js.map