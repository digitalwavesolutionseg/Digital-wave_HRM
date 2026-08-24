-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "inviteExpires" TIMESTAMP(3),
ADD COLUMN     "inviteTokenHash" TEXT,
ADD COLUMN     "loginOtpExpires" TIMESTAMP(3),
ADD COLUMN     "loginOtpHash" TEXT;
