/*
  Warnings:

  - You are about to drop the column `playerId` on the `Duel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Duel" DROP CONSTRAINT "Duel_playerId_fkey";

-- AlterTable
ALTER TABLE "Duel" DROP COLUMN "playerId";
