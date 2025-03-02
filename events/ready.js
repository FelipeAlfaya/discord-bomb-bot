import { scrapeDuels } from '../utils/scrapeDuels.js'

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Bot ${client.user.tag} is online!`)

    // Scrape all duels from the channel
    await scrapeDuels(client)
  },
}
