-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "cardMedia" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "cardPosterUrl" TEXT;
