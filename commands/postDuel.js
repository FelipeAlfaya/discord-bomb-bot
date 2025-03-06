import { SlashCommandBuilder } from 'discord.js'
import prisma from '../prisma.js'
import { pendingDuels } from '../events/messageReactionAdd.js'

export const data = new SlashCommandBuilder()
  .setName('post-duel')
  .setDescription('Post a duel')
  .addUserOption((option) =>
    option
      .setName('participant1')
      .setDescription('Mention Participant 1 or enter their name')
      .setRequired(true)
  )
  .addUserOption((option) =>
    option
      .setName('participant2')
      .setDescription('Mention Participant 2 or enter their name')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('score')
      .setDescription('Score of the duel (e.g., "20 - 18")')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('rounds')
      .setDescription('Number of rounds (e.g., "ft20", "ft10"...)')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('winner')
      .setDescription('Winner of the duel')
      .setRequired(true)
      .addChoices(
        { name: 'Participant 1', value: 'participant1' },
        { name: 'Participant 2', value: 'participant2' }
      )
  )

export async function execute(interaction) {
  const participant1Option = interaction.options.getUser('participant1')
  const participant2Option = interaction.options.getUser('participant2')
  const score = interaction.options.getString('score')
  const rounds = interaction.options.getString('rounds')
  const winnerChoice = interaction.options.getString('winner')

  try {
    const participant1Name = participant1Option.username
    const participant2Name = participant2Option.username

    const participant1 = await prisma.player.findFirst({
      where: {
        OR: [
          { name: participant1Name },
          { discordId: participant1Option.id },
          { keywords: { has: participant1Name } },
        ],
      },
    })
    const participant2 = await prisma.player.findFirst({
      where: {
        OR: [
          { name: participant2Name },
          { discordId: participant2Option.id },
          { keywords: { has: participant2Name } },
        ],
      },
    })

    if (!participant1 || !participant2) {
      await interaction.reply('One or both participants are not registered.')
      return
    }

    if (!/^\d+\s*-\s*\d+$/.test(score)) {
      await interaction.reply(
        'Invalid score format. Use the format: "X - Y" (e.g., "20 - 18").'
      )
      return
    }

    const winner =
      winnerChoice === 'participant1' ? participant1.id : participant2.id

    const pendingDuel = {
      participant1: participant1.id,
      participant2: participant2.id,
      score,
      rounds,
      winner,
      season: process.env.SEASON,
      messageId: interaction.id,
    }

    pendingDuels.set(interaction.id, pendingDuel)

    const approvalChannel = interaction.client.channels.cache.get(
      process.env.APPROVAL_CHANNEL_ID
    )

    if (!approvalChannel) {
      await interaction.reply('Approval channel not found.')
      return
    }

    const duelMessage =
      `**Duel Pending Approval**\n` +
      `Participants: <@${participant1Option.id}> vs <@${participant2Option.id}>\n` +
      `Score: ${score}\n` +
      `Rounds: ${rounds}\n` +
      `Winner: <@${
        winner === participant1.id
          ? participant1Option.id
          : participant2Option.id
      }>\n` +
      `Duel ID: ${interaction.id}\n` +
      `React with ✅ to approve.`

    const approvalMessage = await approvalChannel.send(duelMessage)
    await approvalMessage.react('✅')

    await interaction.reply(
      `Duel between ${participant1Name} and ${participant2Name} submitted for approval.`
    )
  } catch (err) {
    console.error('Error posting duel:', err)
    await interaction.reply('An error occurred while posting the duel.')
  }
}
