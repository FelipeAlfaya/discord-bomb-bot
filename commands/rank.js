import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js'
import prisma from '../prisma.js'

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Display the current ranking of players')

export async function execute(interaction) {
  try {
    const players = await prisma.player.findMany({
      orderBy: { lp: 'desc' },
    })

    const playersPerPage = 10
    let currentPage = 0

    const generateEmbed = (page) => {
      const start = page * playersPerPage
      const end = start + playersPerPage
      const playersOnPage = players.slice(start, end)

      const embed = new EmbedBuilder()
        .setTitle('Player Rankings')
        .setColor(0x0099ff)
        .setDescription(
          `Top players based on LP (Page ${page + 1}/${Math.ceil(
            players.length / playersPerPage
          )})`
        )

      playersOnPage.forEach((player, index) => {
        embed.addFields({
          name: `${start + index + 1}. ${player.name}`,
          value: `LP: ${player.lp}`,
        })
      })

      return embed
    }

    // Botões de paginação
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
          currentPage >= Math.ceil(players.length / playersPerPage) - 1
        )
    )

    // Envia a primeira página
    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [row],
      fetchReply: true,
    })

    // Coletor de interações para os botões
    const collector = message.createMessageComponentCollector({
      time: 120000,
    })

    collector.on('collect', async (i) => {
      if (i.customId === 'previous') {
        currentPage--
      } else if (i.customId === 'next') {
        currentPage++
      }

      // Atualiza os botões
      row.components[0].setDisabled(currentPage === 0)
      row.components[1].setDisabled(
        currentPage >= Math.ceil(players.length / playersPerPage) - 1
      )

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [row],
      })
    })

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(console.error)
    })
  } catch (err) {
    console.error('Error fetching ranking:', err)
    await interaction.reply('An error occurred while fetching the ranking.')
  }
}
