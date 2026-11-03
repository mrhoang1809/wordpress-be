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
exports.UpdatePromotionBannerDto = exports.CreatePromotionBannerDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePromotionBannerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { badgeText: { required: true, type: () => String, minLength: 1, maxLength: 100 }, headline: { required: true, type: () => String, minLength: 1, maxLength: 500 }, description: { required: false, type: () => String, maxLength: 1000 }, ctaLabel: { required: false, type: () => String, maxLength: 100 }, ctaSource: { required: false, type: () => String, maxLength: 100 }, countdownLabel: { required: false, type: () => String, maxLength: 200 }, endsAt: { required: true, type: () => String }, bgGradientFrom: { required: false, type: () => String }, bgGradientVia: { required: false, type: () => String }, bgGradientTo: { required: false, type: () => String }, badgeBg: { required: false, type: () => String }, badgeText2: { required: false, type: () => String }, isActive: { required: false, type: () => Boolean }, sortOrder: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.CreatePromotionBannerDto = CreatePromotionBannerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ưu Đãi Tháng 10' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "badgeText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tặng 01 Buổi Phân Tích InBody & 3 Ngày Tập Thử Miễn Phí' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "headline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Nhận ngay gói trải nghiệm toàn bộ máy kháng thủy lực...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Đăng ký ngay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "ctaLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Promotion Banner' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "ctaSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Chương trình kết thúc sau:' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "countdownLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ISO 8601 datetime — when the countdown reaches zero', example: '2026-11-01T23:59:59.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "endsAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'from-brand-900' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "bgGradientFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'via-brand-800' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "bgGradientVia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'to-accent-magenta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "bgGradientTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'bg-yellow-400' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "badgeBg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'text-brand-900' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionBannerDto.prototype, "badgeText2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePromotionBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePromotionBannerDto.prototype, "sortOrder", void 0);
class UpdatePromotionBannerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { badgeText: { required: false, type: () => String, maxLength: 100 }, headline: { required: false, type: () => String, maxLength: 500 }, description: { required: false, type: () => String, maxLength: 1000 }, ctaLabel: { required: false, type: () => String, maxLength: 100 }, ctaSource: { required: false, type: () => String, maxLength: 100 }, countdownLabel: { required: false, type: () => String, maxLength: 200 }, endsAt: { required: false, type: () => String }, bgGradientFrom: { required: false, type: () => String }, bgGradientVia: { required: false, type: () => String }, bgGradientTo: { required: false, type: () => String }, badgeBg: { required: false, type: () => String }, badgeText2: { required: false, type: () => String }, isActive: { required: false, type: () => Boolean }, sortOrder: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.UpdatePromotionBannerDto = UpdatePromotionBannerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "badgeText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "headline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "ctaLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "ctaSource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "countdownLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "endsAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "bgGradientFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "bgGradientVia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "bgGradientTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "badgeBg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionBannerDto.prototype, "badgeText2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePromotionBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePromotionBannerDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=promotion.dto.js.map