/*
  Warnings:

  - Added the required column `season` to the `Duel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Duel" ADD COLUMN     "season" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "lp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mmr" INTEGER NOT NULL DEFAULT 1000;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");
