import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import prisma from '../prisma.js'

export const data = new SlashCommandBuilder()
  .setName('manage-player')
  .setDescription('Manage player information (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Restrict to admins
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('Add a new player')
      .addStringOption((option) =>
        option.setName('id').setDescription('Player ID').setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('name').setDescription('Player name').setRequired(true)
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
        option
          .setName('overall')
          .setDescription('Overall rating')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('keywords')
          .setDescription('Comma-separated list of alternative nicknames')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('update')
      .setDescription('Update player information')
      .addStringOption((option) =>
        option.setName('id').setDescription('Player ID').setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('field')
          .setDescription('Field to update')
          .setRequired(true)
          .addChoices(
            { name: 'name', value: 'name' },
            { name: 'guild', value: 'guild' },
            { name: 'nationality', value: 'nationality' },
            { name: 'playstyle', value: 'playstyle' },
            { name: 'flexibility', value: 'flexibility' },
            { name: 'speed', value: 'speed' },
            { name: 'aim', value: 'aim' },
            { name: 'acc', value: 'acc' },
            { name: 'adp', value: 'adp' },
            { name: 'ps', value: 'ps' },
            { name: 'overall', value: 'overall' },
            { name: 'keywords', value: 'keywords' }
          )
      )
      .addStringOption((option) =>
        option.setName('value').setDescription('New value').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('Delete a player')
      .addStringOption((option) =>
        option.setName('id').setDescription('Player ID').setRequired(true)
      )
  )

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply('You do not have permission to use this command.')
    return
  }

  const subcommand = interaction.options.getSubcommand()
  const id = interaction.options.getString('id')

  try {
    if (subcommand === 'add') {
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

      await prisma.player.create({
        data: {
          id,
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
          keywords: keywords.split(',').map((keyword) => keyword.trim()),
        },
      })

      await interaction.reply(`Player ${name} added successfully!`)
    } else if (subcommand === 'update') {
      const field = interaction.options.getString('field')
      const value = interaction.options.getString('value')

      await prisma.player.update({
        where: { id },
        data: { [field]: value },
      })

      await interaction.reply(`Player ${id} updated successfully!`)
    } else if (subcommand === 'delete') {
      await prisma.player.delete({
        where: { id },
      })

      await interaction.reply(`Player ${id} deleted successfully!`)
    }
  } catch (err) {
    console.error('Error managing player:', err)
    await interaction.reply('An error occurred while managing the player.')
  }
}
