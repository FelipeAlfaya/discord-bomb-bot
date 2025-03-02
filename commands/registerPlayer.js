import { SlashCommandBuilder } from 'discord.js'
import prisma from '../prisma.js'

export const data = new SlashCommandBuilder()
  .setName('register-player')
  .setDescription('Register a new player')
  .addUserOption((option) =>
    option
      .setName('player')
      .setDescription('Mention the player')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('Full name of the player')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('guild').setDescription('Player guild').setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('nationality')
      .setDescription('Player nationality')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('playstyle')
      .setDescription('Player playstyle')
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('flexibility')
      .setDescription('Flexibility rating')
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('speed').setDescription('Speed rating').setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('aim').setDescription('Aim rating').setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('acc').setDescription('ACC rating').setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('adp').setDescription('ADP rating').setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('ps').setDescription('PS rating').setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('overall').setDescription('Overall rating').setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('keywords')
      .setDescription('Comma-separated list of alternative nicknames')
      .setRequired(false)
  )

export async function execute(interaction) {
  const player = interaction.options.getUser('player')
  const name = interaction.options.getString('name')
  const guild = interaction.options.getString('guild')
  const nationality = interaction.options.getString('nationality')
  const playstyle = interaction.options.getString('playstyle')
  const flexibility = interaction.options.getInteger('flexibility')
  const speed = interaction.options.getInteger('speed')
  const aim = interaction.options.getInteger('aim')
  const acc = interaction.options.getInteger('acc')
  const adp = interaction.options.getInteger('adp')
  const ps = interaction.options.getInteger('ps')
  const overall = interaction.options.getInteger('overall')
  const keywords = interaction.options.getString('keywords') || ''

  try {
    // Verifica se o jogador já está registrado
    const existingPlayer = await prisma.player.findUnique({
      where: { discordId: player.id },
    })

    if (existingPlayer) {
      await interaction.reply(`<@${player.id}> is already registered.`)
      return
    }

    // Registra o jogador
    await prisma.player.create({
      data: {
        discordId: player.id,
        name,
        guild,
        nationality,
        playstyle,
        flexibility,
        speed,
        aim,
        acc,
        adp,
        ps,
        overall,
        keywords: keywords.split(',').map((k) => k.trim()),
      },
    })

    await interaction.reply(`<@${player.id}> has been registered successfully!`)
  } catch (err) {
    console.error('Error registering player:', err)
    await interaction.reply('An error occurred while registering the player.')
  }
}
