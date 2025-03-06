import { SlashCommandBuilder } from 'discord.js'
import prisma from '../prisma.js'

export const data = new SlashCommandBuilder()
  .setName('reset-season')
  .setDescription('Reset the current season and start a new one')

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply('You do not have permission to use this command.')
    return
  }

  try {
    // Desativa a temporada atual
    await prisma.season.updateMany({
      where: { current: true },
      data: { current: false },
    })

    // Cria uma nova temporada
    const newSeasonName = `season${Math.floor(Math.random() * 1000)}`
    await prisma.season.create({
      data: {
        name: newSeasonName,
        current: true,
      },
    })

    // Reseta o MMR e LP de todos os jogadores
    await prisma.player.updateMany({
      data: {
        mmr: 1000, // MMR inicial
        lp: 0, // LP inicial
      },
    })

    await interaction.reply(
      `New season "${newSeasonName}" started! All players have been reset.`
    )
  } catch (err) {
    console.error('Error resetting season:', err)
    await interaction.reply('An error occurred while resetting the season.')
  }
}
