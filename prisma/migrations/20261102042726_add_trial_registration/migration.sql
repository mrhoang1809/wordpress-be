-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "trialNotifyEmail" TEXT;

-- CreateTable
CREATE TABLE "trial_registrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "locationId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trial_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trial_registrations_createdAt_idx" ON "trial_registrations"("createdAt");

-- AddForeignKey
ALTER TABLE "trial_registrations" ADD CONSTRAINT "trial_registrations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
