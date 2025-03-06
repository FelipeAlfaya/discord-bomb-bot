import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const playersData = JSON.parse(fs.readFileSync('./players.json', 'utf-8'))

const prisma = new PrismaClient()

async function importPlayers() {
  for (const player of playersData) {
    try {
      await prisma.player.create({
        data: {
          id: player.id,
          name: player.name,
          guild: player.guild,
          nationality: player.nationality,
          playstyle: player.playstyle,
          flexibility: player.flexibility,
          speed: player.speed,
          aim: player.aim,
          acc: player.acc,
          adp: player.adp,
          ps: player.ps,
          overall: player.overall,
          keywords: player.keywords || [], // Adiciona os apelidos, se existirem
        },
      })
      console.log(`Imported player: ${player.name}`)
    } catch (err) {
      console.error('Error importing player:', err)
    }
  }
}

importPlayers()
