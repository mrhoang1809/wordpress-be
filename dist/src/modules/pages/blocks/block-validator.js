"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlockData = validateBlockData;
exports.isValidBlockType = isValidBlockType;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const urlSchema = zod_1.z
    .string()
    .refine((val) => /^(https?:\/\/|\/)/.test(val), {
    message: 'URL must be a relative path or start with https://',
});
const buttonSchema = zod_1.z
    .object({
    label: zod_1.z.string().min(1).max(200),
    url: urlSchema,
    openInNewTab: zod_1.z.boolean().optional(),
    variant: zod_1.z.enum(['primary', 'secondary', 'outline', 'ghost']).optional(),
})
    .optional();
const spacingSchema = zod_1.z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional();
const alignmentSchema = zod_1.z.enum(['left', 'center', 'right']).optional();
const widthSchema = zod_1.z.enum(['narrow', 'normal', 'wide', 'full']).optional();
const heroSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    eyebrow: zod_1.z.string().max(200).optional(),
    title: zod_1.z.string().min(1).max(500),
    subtitle: zod_1.z.string().max(500).optional(),
    description: zod_1.z.string().max(2000).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    imageMediaId: zod_1.z.string().optional(),
    imageAlt: zod_1.z.string().max(500).optional(),
    primaryButton: buttonSchema,
    secondaryButton: buttonSchema,
    layout: zod_1.z.enum(['image-right', 'image-left', 'image-top', 'image-background']).optional(),
    alignment: alignmentSchema,
    theme: zod_1.z.enum(['light', 'dark']).optional(),
    backgroundColor: zod_1.z
        .string()
        .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
        .optional(),
    spacing: spacingSchema,
});
const bannerSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().max(2000).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    imageMediaId: zod_1.z.string().optional(),
    imageAlt: zod_1.z.string().max(500).optional(),
    backgroundType: zod_1.z.enum(['color', 'image']).optional(),
    backgroundColor: zod_1.z
        .string()
        .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
        .optional(),
    textColor: zod_1.z
        .string()
        .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
        .optional(),
    cta: buttonSchema,
    alignment: alignmentSchema,
    overlayOpacity: zod_1.z.number().min(0).max(100).optional(),
    spacing: spacingSchema,
});
const richTextSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    content: zod_1.z.record(zod_1.z.unknown()).refine((val) => val.type === 'doc', { message: 'content must be a Tiptap JSON document with type "doc"' }).optional(),
    _html: zod_1.z.string().optional(),
    alignment: alignmentSchema,
    width: widthSchema,
    spacing: spacingSchema,
}).refine((val) => val.content !== undefined || val._html !== undefined, { message: 'RICH_TEXT block must have either content (Tiptap JSON) or _html (raw HTML)' });
const imageBlockSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    imageUrl: zod_1.z.string().url(),
    imageMediaId: zod_1.z.string().optional(),
    alt: zod_1.z.string().min(1).max(500),
    caption: zod_1.z.string().max(500).optional(),
    link: urlSchema.optional(),
    aspectRatio: zod_1.z.enum(['1/1', '4/3', '16/9', '3/2', 'auto']).optional(),
    objectFit: zod_1.z.enum(['cover', 'contain', 'fill']).optional(),
    alignment: alignmentSchema,
    width: widthSchema,
    spacing: spacingSchema,
});
const ctaSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().max(2000).optional(),
    primaryButton: buttonSchema,
    secondaryButton: buttonSchema,
    layout: zod_1.z.enum(['stacked', 'inline']).optional(),
    theme: zod_1.z.enum(['light', 'dark', 'brand']).optional(),
    backgroundColor: zod_1.z
        .string()
        .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
        .optional(),
    spacing: spacingSchema,
});
const faqItemSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    question: zod_1.z.string().min(1).max(1000),
    answer: zod_1.z.string().min(1).max(5000),
});
const faqSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    title: zod_1.z.string().max(500).optional(),
    description: zod_1.z.string().max(2000).optional(),
    items: zod_1.z.array(faqItemSchema).min(1, { message: 'FAQ must have at least one item' }),
    displayStyle: zod_1.z.enum(['accordion', 'list']).optional(),
    allowMultipleOpen: zod_1.z.boolean().optional(),
    spacing: spacingSchema,
});
const BLOCK_SCHEMAS = {
    HERO: heroSchema,
    BANNER: bannerSchema,
    RICH_TEXT: richTextSchema,
    IMAGE: imageBlockSchema,
    CTA: ctaSchema,
    FAQ: faqSchema,
};
function validateBlockData(type, data) {
    const schema = BLOCK_SCHEMAS[type];
    if (!schema) {
        throw new common_1.BadRequestException(`Unknown block type: ${type}`);
    }
    const result = schema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
        }));
        throw new common_1.BadRequestException({ message: 'Block data validation failed', details: issues });
    }
}
function isValidBlockType(type) {
    return Object.values(client_1.BlockType).includes(type);
}
//# sourceMappingURL=block-validator.js.map