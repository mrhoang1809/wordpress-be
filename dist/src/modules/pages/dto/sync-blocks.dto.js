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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncBlocksDto = exports.BlockItemDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class BlockItemDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, type: { required: true, type: () => Object }, order: { required: true, type: () => Number, minimum: 0 }, data: { required: true, type: () => Object }, schemaVersion: { required: false, type: () => Number, minimum: 1 } };
    }
}
exports.BlockItemDto = BlockItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stable block CUID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BlockItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.BlockType }),
    (0, class_validator_1.IsEnum)(client_1.BlockType),
    __metadata("design:type", String)
], BlockItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Zero-based display order' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BlockItemDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Block configuration data (type-specific)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BlockItemDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BlockItemDto.prototype, "schemaVersion", void 0);
class SyncBlocksDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { version: { required: true, type: () => Number, minimum: 1 }, blocks: { required: true, type: () => [require("./sync-blocks.dto").BlockItemDto] } };
    }
}
exports.SyncBlocksDto = SyncBlocksDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page version (optimistic concurrency)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SyncBlocksDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BlockItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BlockItemDto),
    __metadata("design:type", Array)
], SyncBlocksDto.prototype, "blocks", void 0);
//# sourceMappingURL=sync-blocks.dto.js.map