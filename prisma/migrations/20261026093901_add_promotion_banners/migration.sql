-- CreateTable
CREATE TABLE "promotion_banners" (
    "id" TEXT NOT NULL,
    "badgeText" TEXT NOT NULL DEFAULT 'Ưu Đãi Đặc Biệt',
    "headline" TEXT NOT NULL,
    "description" TEXT,
    "ctaLabel" TEXT NOT NULL DEFAULT 'Đăng ký ngay',
    "ctaSource" TEXT NOT NULL DEFAULT 'Promotion Banner',
    "countdownLabel" TEXT NOT NULL DEFAULT 'Chương trình kết thúc sau:',
    "endsAt" TIMESTAMP(3) NOT NULL,
    "bgGradientFrom" TEXT NOT NULL DEFAULT 'from-brand-900',
    "bgGradientVia" TEXT NOT NULL DEFAULT 'via-brand-800',
    "bgGradientTo" TEXT NOT NULL DEFAULT 'to-accent-magenta',
    "badgeBg" TEXT NOT NULL DEFAULT 'bg-yellow-400',
    "badgeText2" TEXT NOT NULL DEFAULT 'text-brand-900',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_banners_isActive_idx" ON "promotion_banners"("isActive");
