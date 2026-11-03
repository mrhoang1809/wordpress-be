-- CreateEnum
CREATE TYPE "MessagePlatform" AS ENUM ('ZALO', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED', 'READ');

-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "zaloUserId" TEXT,
    "facebookPsid" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "MessagePlatform" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "content" JSONB NOT NULL,
    "targetTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_recipients" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "platformMessageId" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "MessagePlatform" NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "content" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_phone_key" ON "subscribers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_zaloUserId_key" ON "subscribers"("zaloUserId");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_facebookPsid_key" ON "subscribers"("facebookPsid");

-- CreateIndex
CREATE INDEX "subscribers_zaloUserId_idx" ON "subscribers"("zaloUserId");

-- CreateIndex
CREATE INDEX "subscribers_facebookPsid_idx" ON "subscribers"("facebookPsid");

-- CreateIndex
CREATE INDEX "subscribers_isActive_idx" ON "subscribers"("isActive");

-- CreateIndex
CREATE INDEX "message_campaigns_status_idx" ON "message_campaigns"("status");

-- CreateIndex
CREATE INDEX "message_campaigns_platform_idx" ON "message_campaigns"("platform");

-- CreateIndex
CREATE INDEX "message_recipients_campaignId_idx" ON "message_recipients"("campaignId");

-- CreateIndex
CREATE INDEX "message_recipients_subscriberId_idx" ON "message_recipients"("subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "message_recipients_campaignId_subscriberId_key" ON "message_recipients"("campaignId", "subscriberId");

-- CreateIndex
CREATE INDEX "message_templates_platform_idx" ON "message_templates"("platform");

-- AddForeignKey
ALTER TABLE "message_campaigns" ADD CONSTRAINT "message_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "message_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
