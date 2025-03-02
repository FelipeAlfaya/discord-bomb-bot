import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import prisma from '../prisma.js'

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Display the profile of a player')
  .addStringOption((option) =>
    option
      .setName('player')
      .setDescription('Name or mention of the player')
      .setRequired(true)
  )

export async function execute(interaction) {
  const playerNameOrMention = interaction.options.getString('player')

  try {
    const player = await prisma.player.findFirst({
      where: {
        OR: [
          { name: playerNameOrMention },
          { discordId: playerNameOrMention },
          { keywords: { has: playerNameOrMention } },
        ],
      },
      include: {
        duelsAsPlayer1: true,
        duelsAsPlayer2: true,
      },
    })

    if (!player) {
      await interaction.reply(`Player "${playerNameOrMention}" not found.`)
      return
    }

    const duels = [...player.duelsAsPlayer1, ...player.duelsAsPlayer2]

    let wins = 0
    let losses = 0

    duels.forEach((duel) => {
      if (duel.winner === player.id) {
        wins++
      } else {
        losses++
      }
    })

    const totalDuels = wins + losses
    const winRate = totalDuels > 0 ? ((wins / totalDuels) * 100).toFixed(2) : 0

    const embed = new EmbedBuilder()
      .setTitle(`Profile of ${player.name}`)
      .setColor(0x0099ff)
      .addFields(
        { name: 'Guild', value: player.guild, inline: true },
        { name: 'Nationality', value: player.nationality, inline: true },
        { name: 'Playstyle', value: player.playstyle, inline: true },
        {
          name: 'Flexibility',
          value: player.flexibility.toString(),
          inline: true,
        },
        { name: 'Speed', value: player.speed.toString(), inline: true },
        { name: 'Aim', value: player.aim.toString(), inline: true },
        { name: 'ACC', value: player.acc.toString(), inline: true },
        { name: 'ADP', value: player.adp.toString(), inline: true },
        { name: 'PS', value: player.ps.toString(), inline: true },
        { name: 'Overall', value: player.overall.toString(), inline: true },
        { name: 'Win Rate', value: `${winRate}%`, inline: true },
        { name: 'Wins', value: wins.toString(), inline: true },
        { name: 'Losses', value: losses.toString(), inline: true }
      )

    if (player.discordId) {
      const discordUser = await interaction.client.users.fetch(player.discordId)
      embed.setThumbnail(discordUser.displayAvatarURL())
    }

    await interaction.reply({ embeds: [embed] })
  } catch (err) {
    console.error('Error fetching profile:', err)
    await interaction.reply('An error occurred while fetching the profile.')
  }
}
