-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetOtp" TEXT,
ADD COLUMN     "passwordResetOtpExpires" TIMESTAMP(3);
