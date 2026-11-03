import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { BlockType } from '@prisma/client';

// ─── Shared sub-schemas ────────────────────────────────────────────────────────

const urlSchema = z
  .string()
  .refine((val) => /^(https?:\/\/|\/)/.test(val), {
    message: 'URL must be a relative path or start with https://',
  });

const buttonSchema = z
  .object({
    label: z.string().min(1).max(200),
    url: urlSchema,
    openInNewTab: z.boolean().optional(),
    variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).optional(),
  })
  .optional();

const spacingSchema = z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional();
const alignmentSchema = z.enum(['left', 'center', 'right']).optional();
const widthSchema = z.enum(['narrow', 'normal', 'wide', 'full']).optional();

// ─── Block schemas ─────────────────────────────────────────────────────────────

const heroSchema = z.object({
  schemaVersion: z.literal(1),
  eyebrow: z.string().max(200).optional(),
  title: z.string().min(1).max(500),
  subtitle: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  imageMediaId: z.string().optional(),
  imageAlt: z.string().max(500).optional(),
  primaryButton: buttonSchema,
  secondaryButton: buttonSchema,
  layout: z.enum(['image-right', 'image-left', 'image-top', 'image-background']).optional(),
  alignment: alignmentSchema,
  theme: z.enum(['light', 'dark']).optional(),
  backgroundColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
  spacing: spacingSchema,
});

const bannerSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  imageMediaId: z.string().optional(),
  imageAlt: z.string().max(500).optional(),
  backgroundType: z.enum(['color', 'image']).optional(),
  backgroundColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
  textColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
  cta: buttonSchema,
  alignment: alignmentSchema,
  overlayOpacity: z.number().min(0).max(100).optional(),
  spacing: spacingSchema,
});

const richTextSchema = z.object({
  schemaVersion: z.literal(1),
  // Accept either a full Tiptap JSON doc or a raw HTML string (_html)
  content: z.record(z.unknown()).refine(
    (val) => val.type === 'doc',
    { message: 'content must be a Tiptap JSON document with type "doc"' },
  ).optional(),
  _html: z.string().optional(),
  alignment: alignmentSchema,
  width: widthSchema,
  spacing: spacingSchema,
}).refine(
  (val) => val.content !== undefined || val._html !== undefined,
  { message: 'RICH_TEXT block must have either content (Tiptap JSON) or _html (raw HTML)' },
);

const imageBlockSchema = z.object({
  schemaVersion: z.literal(1),
  imageUrl: z.string().url(),
  imageMediaId: z.string().optional(),
  alt: z.string().min(1).max(500),
  caption: z.string().max(500).optional(),
  link: urlSchema.optional(),
  aspectRatio: z.enum(['1/1', '4/3', '16/9', '3/2', 'auto']).optional(),
  objectFit: z.enum(['cover', 'contain', 'fill']).optional(),
  alignment: alignmentSchema,
  width: widthSchema,
  spacing: spacingSchema,
});

const ctaSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  primaryButton: buttonSchema,
  secondaryButton: buttonSchema,
  layout: z.enum(['stacked', 'inline']).optional(),
  theme: z.enum(['light', 'dark', 'brand']).optional(),
  backgroundColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
  spacing: spacingSchema,
});

const faqItemSchema = z.object({
  id: z.string().cuid(),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(5000),
});

const faqSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  items: z.array(faqItemSchema).min(1, { message: 'FAQ must have at least one item' }),
  displayStyle: z.enum(['accordion', 'list']).optional(),
  allowMultipleOpen: z.boolean().optional(),
  spacing: spacingSchema,
});

// ─── Validator map ─────────────────────────────────────────────────────────────

const BLOCK_SCHEMAS: Record<BlockType, z.ZodTypeAny> = {
  HERO: heroSchema,
  BANNER: bannerSchema,
  RICH_TEXT: richTextSchema,
  IMAGE: imageBlockSchema,
  CTA: ctaSchema,
  FAQ: faqSchema,
};

export function validateBlockData(type: BlockType, data: unknown): void {
  const schema = BLOCK_SCHEMAS[type];
  if (!schema) {
    throw new BadRequestException(`Unknown block type: ${type}`);
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    throw new BadRequestException({ message: 'Block data validation failed', details: issues });
  }
}

export function isValidBlockType(type: string): type is BlockType {
  return Object.values(BlockType).includes(type as BlockType);
}
