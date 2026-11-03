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
exports.PublicPagesController = exports.PagesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../common/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const pages_service_1 = require("./pages.service");
const blocks_service_1 = require("./blocks/blocks.service");
const create_page_dto_1 = require("./dto/create-page.dto");
const update_page_dto_1 = require("./dto/update-page.dto");
const sync_blocks_dto_1 = require("./dto/sync-blocks.dto");
class PageQueryDto extends pagination_dto_1.PaginationQueryDto {
}
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ enum: client_1.ContentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContentStatus),
    __metadata("design:type", String)
], PageQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'updatedAt' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PageQueryDto.prototype, "sortBy", void 0);
let PagesController = class PagesController {
    constructor(pagesService, blocksService) {
        this.pagesService = pagesService;
        this.blocksService = blocksService;
    }
    findAll(query) {
        return this.pagesService.findAll(query);
    }
    findOne(id) {
        return this.pagesService.findById(id);
    }
    create(dto, user) {
        return this.pagesService.create(dto, user);
    }
    update(id, dto, user) {
        return this.pagesService.update(id, dto, user);
    }
    delete(id, user) {
        return this.pagesService.delete(id, user);
    }
    publish(id, user) {
        return this.pagesService.publish(id, user);
    }
    unpublish(id, user) {
        return this.pagesService.unpublish(id, user);
    }
    duplicate(id, user) {
        return this.pagesService.duplicate(id, user);
    }
    getBlocks(id) {
        return this.blocksService.getBlocks(id);
    }
    syncBlocks(id, dto, user) {
        return this.blocksService.syncBlocks(id, dto, user);
    }
};
exports.PagesController = PagesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:list'),
    (0, swagger_1.ApiOperation)({ summary: 'List pages (admin)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PageQueryDto]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:read'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get page by ID (admin)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new page' }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Update page metadata' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_page_dto_1.UpdatePageDto, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:delete'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a page' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:publish'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a page' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:publish'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Unpublish a page (back to DRAFT)' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:create'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate a page as DRAFT' }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Get)(':id/blocks'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:read'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get all blocks for a page (admin)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "getBlocks", null);
__decorate([
    (0, common_1.Put)(':id/blocks'),
    (0, require_permissions_decorator_1.RequirePermissions)('pages:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk sync blocks for a page (transactional)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sync_blocks_dto_1.SyncBlocksDto, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "syncBlocks", null);
exports.PagesController = PagesController = __decorate([
    (0, swagger_1.ApiTags)('pages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('pages'),
    __metadata("design:paramtypes", [pages_service_1.PagesService,
        blocks_service_1.BlocksService])
], PagesController);
let PublicPagesController = class PublicPagesController {
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
    findPublic(slug) {
        return this.pagesService.findPublicBySlug(slug);
    }
};
exports.PublicPagesController = PublicPagesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiParam)({ name: 'slug' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get a published page by slug (public)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPagesController.prototype, "findPublic", null);
exports.PublicPagesController = PublicPagesController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('public/pages'),
    __metadata("design:paramtypes", [pages_service_1.PagesService])
], PublicPagesController);
//# sourceMappingURL=pages.controller.js.map