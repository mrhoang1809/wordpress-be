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
exports.SendCampaignDto = exports.UpdateCampaignDto = exports.CreateCampaignDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateCampaignDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String, minLength: 1 }, platform: { required: true, type: () => Object }, messageType: { required: false, type: () => String }, content: { required: true, type: () => Object }, targetTags: { required: false, type: () => [String] }, scheduledAt: { required: false, type: () => String } };
    }
}
exports.CreateCampaignDto = CreateCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MessagePlatform }),
    (0, class_validator_1.IsEnum)(client_1.MessagePlatform),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'text', description: 'text | image | list | template' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message content — validated per platform and type',
        example: { text: 'Hello from CMS!' },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCampaignDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Filter subscribers by tags' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCampaignDto.prototype, "targetTags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ISO date string for scheduled send' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "scheduledAt", void 0);
class UpdateCampaignDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: false, type: () => String }, platform: { required: false, type: () => Object }, messageType: { required: false, type: () => String }, content: { required: false, type: () => Object }, targetTags: { required: false, type: () => [String] }, scheduledAt: { required: false, type: () => String } };
    }
}
exports.UpdateCampaignDto = UpdateCampaignDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.MessagePlatform }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MessagePlatform),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateCampaignDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCampaignDto.prototype, "targetTags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "scheduledAt", void 0);
class SendCampaignDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { targetTags: { required: false, type: () => [String] }, batchSize: { required: false, type: () => Number, minimum: 1 } };
    }
}
exports.SendCampaignDto = SendCampaignDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Override target tags for this send' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SendCampaignDto.prototype, "targetTags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, description: 'Batch size for rate-limited sends' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SendCampaignDto.prototype, "batchSize", void 0);
//# sourceMappingURL=campaign.dto.js.map