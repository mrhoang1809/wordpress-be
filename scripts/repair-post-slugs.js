/**
 * repair-post-slugs.js
 *
 * Re-generates slugs for posts where the slug is clearly wrong
 * (contains only stripped ASCII from a Vietnamese title, or is malformed).
 *
 * Uses the same transliteration library as posts.service.ts.
 *
 * Run: node scripts/repair-post-slugs.js [--dry-run]
 */

const { PrismaClient } = require('@prisma/client');
const { slugify } = require('transliteration');

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

function makeSlug(text) {
  return slugify(text, { lowercase: true, separator: '-', trim: true })
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 500);
}

async function main() {
  console.log(isDryRun ? '🔍 DRY RUN — no changes will be saved\n' : '⚠️  LIVE RUN — changes will be saved\n');

  const posts = await prisma.post.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${posts.length} posts total.\n`);

  const toFix = [];

  for (const post of posts) {
    const expected = makeSlug(post.title);

    // Check if slug looks wrong:
    // 1. Title contains Vietnamese chars but slug has no recognisable transliteration
    // 2. Slug ends with random letters like "miy" (partial strip artefact)
    const titleHasVietnamese = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(post.title);
    const slugIsStripped = titleHasVietnamese && post.slug !== expected;

    // Also flag posts with ? in title (corrupted — we can't fix title, only note)
    const titleCorrupted = post.title.includes('?') || post.title.includes('\uFFFD');

    if (titleCorrupted) {
      console.log(`⚠️  CORRUPTED title (cannot auto-fix):`);
      console.log(`   ID:    ${post.id}`);
      console.log(`   title: ${post.title}  ← contains replacement char`);
      console.log(`   slug:  ${post.slug}`);
      console.log(`   → Please manually update via admin panel\n`);
    } else if (slugIsStripped) {
      toFix.push({ id: post.id, title: post.title, oldSlug: post.slug, newSlug: expected });
    }
  }

  if (toFix.length === 0) {
    console.log('✅ No slug repairs needed.');
    return;
  }

  console.log(`\n🔧 ${toFix.length} slugs to repair:\n`);

  for (const item of toFix) {
    console.log(`  ${item.title}`);
    console.log(`    old slug: ${item.oldSlug}`);
    console.log(`    new slug: ${item.newSlug}`);

    if (!isDryRun) {
      // Check if new slug already exists (avoid unique constraint violation)
      const existing = await prisma.post.findFirst({
        where: { slug: item.newSlug, id: { not: item.id } },
        select: { id: true },
      });

      if (existing) {
        // Append a suffix to make it unique
        const suffixed = `${item.newSlug}-${item.id.slice(-6)}`;
        console.log(`    ⚠️  slug conflict → using: ${suffixed}`);
        await prisma.post.update({ where: { id: item.id }, data: { slug: suffixed } });
      } else {
        await prisma.post.update({ where: { id: item.id }, data: { slug: item.newSlug } });
      }
      console.log(`    ✅ updated`);
    } else {
      console.log(`    (skipped — dry run)`);
    }
    console.log('');
  }

  if (!isDryRun) {
    console.log(`\n✅ Done. ${toFix.length} slugs repaired.`);
  } else {
    console.log(`\nRun without --dry-run to apply changes.`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
