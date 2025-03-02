import {
  postDuel,
  exportDuels,
  registerPlayer,
  managePlayer,
  profile,
} from '../commands/index.js'

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return

    const { commandName } = interaction

    // Execute the corresponding command
    if (commandName === 'post-duel') {
      await postDuel.execute(interaction)
    } else if (commandName === 'export') {
      await exportDuels.execute(interaction)
    } else if (commandName === 'profile') {
      await profile.execute(interaction)
    } else if (commandName === 'register-player') {
      await registerPlayer.execute(interaction)
    } else if (commandName === 'manage-player') {
      await managePlayer.execute(interaction)
    }
  },
}
