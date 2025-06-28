-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'PROCESSING', 'FAILED', 'SUCCESS');



-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" STRING,
    "imageUrl" STRING,
    "theme" STRING DEFAULT 'system',
    "accentColor" STRING DEFAULT 'blue',
    "fontSize" INT4 DEFAULT 16,
    "defaultZoom" INT4 DEFAULT 100,
    "autoSave" BOOL DEFAULT true,
    "defaultHighlightColor" STRING DEFAULT '#ffeb3b',
    "autoDelete" INT4 DEFAULT 90,
    "emailNotifications" BOOL DEFAULT true,
    "processingAlerts" BOOL DEFAULT true,
    "weeklyDigest" BOOL DEFAULT false,
    "browserNotifications" BOOL DEFAULT true,
    "analyticsOptOut" BOOL DEFAULT false,
    "shareUsageData" BOOL DEFAULT true,
    "publicProfile" BOOL DEFAULT false,
    "stripe_customer_id" STRING,
    "stripe_subscription_id" STRING,
    "stripe_price_id" STRING,
    "stripe_current_period_end" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "url" STRING NOT NULL,
    "key" STRING NOT NULL,
    "iconIndex" INT4 NOT NULL DEFAULT 0,
    "colorIndex" INT4 NOT NULL DEFAULT 0,
    "viewCount" INT4 NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" STRING,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" STRING NOT NULL,
    "text" STRING NOT NULL,
    "isUserMessage" BOOL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" STRING,
    "fileId" STRING,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripe_customer_id_key" ON "User"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripe_subscription_id_key" ON "User"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
