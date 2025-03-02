import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'
import db from '../database.js'

export const data = new SlashCommandBuilder()
  .setName('export')
  .setDescription('Export all duels to a CSV file')

export async function execute(interaction) {
  db.all('SELECT * FROM duels', [], (err, rows) => {
    if (err) {
      console.error('Error fetching duels:', err)
      interaction.reply('An error occurred while fetching duels.')
      return
    }

    if (rows.length === 0) {
      interaction.reply('No duels found to export.')
      return
    }

    const csvWriter = createCsvWriter({
      path: 'duels.csv',
      header: [
        { id: 'participant1', title: 'Participant 1' },
        { id: 'participant2', title: 'Participant 2' },
        { id: 'rounds', title: 'Rounds' },
        { id: 'score', title: 'Score' },
        { id: 'winner', title: 'Winner' },
      ],
    })

    csvWriter
      .writeRecords(rows)
      .then(() => {
        const attachment = new AttachmentBuilder('duels.csv')
        interaction.reply({ files: [attachment] })
      })
      .catch((err) => {
        console.error('Error generating CSV:', err)
        interaction.reply('An error occurred while generating the CSV file.')
      })
  })
}
