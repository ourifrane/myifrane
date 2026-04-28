-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "completionImageUrl" TEXT,
ADD COLUMN     "rewardPoints" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "workerNotes" TEXT;
