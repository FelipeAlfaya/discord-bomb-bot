import { Client, GatewayIntentBits, Partials } from 'discord.js'
import 'dotenv/config'
import ready from './events/ready.js'
import interactionCreate from './events/interactionCreate.js'
import {
  name as messageReactionAddName,
  execute as messageReactionAddExecute,
} from './events/messageReactionAdd.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction], // Adicione isso para lidar com reações
})

client.once(ready.name, ready.execute)
client.on(interactionCreate.name, interactionCreate.execute)
client.on(messageReactionAddName, messageReactionAddExecute)

client.login(process.env.DISCORD_TOKEN)
