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
exports.PublicPostsController = exports.PostsController = void 0;
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
const posts_service_1 = require("./posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const sync_blocks_dto_1 = require("../pages/dto/sync-blocks.dto");
class PostQueryDto extends pagination_dto_1.PaginationQueryDto {
}
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ enum: client_1.ContentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContentStatus),
    __metadata("design:type", String)
], PostQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Filter by category slug' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostQueryDto.prototype, "categorySlug", void 0);
class CreatePublicCommentDto {
}
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'Nguyễn An' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePublicCommentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'Bài viết rất hữu ích.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreatePublicCommentDto.prototype, "text", void 0);
let PostsController = class PostsController {
    constructor(postsService) {
        this.postsService = postsService;
    }
    findAll(query) {
        return this.postsService.findAll(query);
    }
    findOne(id) {
        return this.postsService.findById(id);
    }
    create(dto, user) {
        return this.postsService.create(dto, user);
    }
    update(id, dto, user) {
        return this.postsService.update(id, dto, user);
    }
    delete(id, user) {
        return this.postsService.delete(id, user);
    }
    publish(id) {
        return this.postsService.publish(id);
    }
    unpublish(id) {
        return this.postsService.unpublish(id);
    }
    getBlocks(id) {
        return this.postsService.getBlocks(id);
    }
    syncBlocks(id, dto, user) {
        return this.postsService.syncBlocks(id, dto, user);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:list'),
    (0, swagger_1.ApiOperation)({ summary: 'List posts' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostQueryDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:read'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:create'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_post_dto_1.CreatePostDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:delete'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:publish'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:publish'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Get)(':id/blocks'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:read'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getBlocks", null);
__decorate([
    (0, common_1.Put)(':id/blocks'),
    (0, require_permissions_decorator_1.RequirePermissions)('posts:update'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sync_blocks_dto_1.SyncBlocksDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "syncBlocks", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('posts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
let PublicPostsController = class PublicPostsController {
    constructor(postsService) {
        this.postsService = postsService;
    }
    listPublic(page, pageSize, categorySlug, search) {
        return this.postsService.listPublicPosts({
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 12,
            categorySlug: categorySlug || undefined,
            search: search || undefined,
        });
    }
    getEngagement(slug) {
        return this.postsService.getPublicEngagement(slug);
    }
    recordView(slug) {
        return this.postsService.recordPublicView(slug);
    }
    recordLike(slug) {
        return this.postsService.recordPublicLike(slug);
    }
    createComment(slug, dto) {
        return this.postsService.createPublicComment(slug, dto);
    }
    findPublic(slug) {
        return this.postsService.findPublicBySlug(slug);
    }
};
exports.PublicPostsController = PublicPostsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List published posts (public) — supports ?page, ?pageSize, ?categorySlug, ?search' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('categorySlug')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PublicPostsController.prototype, "listPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug/engagement'),
    (0, swagger_1.ApiParam)({ name: 'slug' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get public post views, likes and comments' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPostsController.prototype, "getEngagement", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':slug/views'),
    (0, swagger_1.ApiParam)({ name: 'slug' }),
    (0, swagger_1.ApiOperation)({ summary: 'Record a public post view' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPostsController.prototype, "recordView", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':slug/likes'),
    (0, swagger_1.ApiParam)({ name: 'slug' }),
    (0, swagger_1.ApiOperation)({ summary: 'Record a public post like' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPostsController.prototype, "recordLike", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':slug/comments'),
    (0, swagger_1.ApiParam)({ name: 'slug' }),
    (0, swagger_1.ApiOperation)({ summary: 'Add a public comment to a post' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreatePublicCommentDto]),
    __metadata("design:returntype", void 0)
], PublicPostsController.prototype, "createComment", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiParam)({ name: 'slug' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get a published post by slug (public)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPostsController.prototype, "findPublic", null);
exports.PublicPostsController = PublicPostsController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('public/posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PublicPostsController);
//# sourceMappingURL=posts.controller.js.map