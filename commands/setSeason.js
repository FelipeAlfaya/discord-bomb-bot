import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import prisma from '../prisma.js'

export const data = new SlashCommandBuilder()
  .setName('set-season')
  .setDescription('Set the current season')
  .addStringOption((option) =>
    option
      .setName('season')
      .setDescription('Name of the season to set as current')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Restringe o comando a administradores

export async function execute(interaction) {
  // Verifica se o usuário tem permissão de administrador
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply('You do not have permission to use this command.')
    return
  }

  const seasonName = interaction.options.getString('season')

  try {
    console.log(`Setting season "${seasonName}" as current...`)

    // Desativa todas as seasons atuais
    await prisma.season.updateMany({
      where: { current: true },
      data: { current: false },
    })

    console.log('All current seasons deactivated.')

    // Define a nova season como atual (cria se não existir)
    const updatedSeason = await prisma.season.upsert({
      where: { name: seasonName },
      update: { current: true }, // Atualiza se a season já existir
      create: { name: seasonName, current: true }, // Cria a season se não existir
    })

    console.log(`Season "${seasonName}" set as current.`)

    await interaction.reply(`Season "${seasonName}" is now the current season.`)
  } catch (err) {
    console.error('Error setting season:', err)

    // Responde ao usuário com uma mensagem de erro
    await interaction.reply(
      'An error occurred while setting the season. Please check the logs.'
    )
  }
}
