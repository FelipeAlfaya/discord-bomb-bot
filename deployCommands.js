import { REST, Routes } from 'discord.js'
import {
  postDuel,
  exportDuels,
  registerPlayer,
  managePlayer,
  profile,
} from './commands/index.js'
import 'dotenv/config'

const commands = [
  postDuel.data,
  exportDuels.data,
  registerPlayer.data,
  managePlayer.data,
  profile.data,
].map((command) => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

;(async () => {
  try {
    console.log('Registering slash commands...')
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    )
    console.log('Slash commands registered successfully!')
  } catch (error) {
    console.error('Error registering slash commands:', error)
  }
})()
