-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "discordId" TEXT,
    "name" TEXT NOT NULL,
    "guild" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "sector" TEXT,
    "playstyle" TEXT NOT NULL,
    "alignment" TEXT,
    "flexibility" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "aim" INTEGER NOT NULL,
    "acc" INTEGER NOT NULL,
    "adp" INTEGER NOT NULL,
    "ps" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "participant1" TEXT NOT NULL,
    "participant2" TEXT NOT NULL,
    "rounds" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "winner" TEXT NOT NULL,
    "playerId" TEXT,

    CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_discordId_key" ON "Player"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Duel_messageId_key" ON "Duel"("messageId");

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_participant1_fkey" FOREIGN KEY ("participant1") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_participant2_fkey" FOREIGN KEY ("participant2") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
