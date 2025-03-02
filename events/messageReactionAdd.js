import { PermissionsBitField } from 'discord.js'
import prisma from '../prisma.js'

export const name = 'messageReactionAdd'

export async function execute(reaction, user) {
  console.log('Reaction detected:', reaction.emoji.name) // Log 1: Reação detectada

  // Verifica se a reação foi adicionada no canal de aprovação
  if (reaction.message.channel.id === process.env.APPROVAL_CHANNEL_ID) {
    console.log('Reaction is in the approval channel') // Log 2: Reação no canal de aprovação

    // Verifica se a reação é ✅
    if (reaction.emoji.name === '✅') {
      console.log('Reaction is ✅') // Log 3: Reação é ✅

      // Verifica se o usuário que reagiu tem permissão de administrador
      const member = reaction.message.guild.members.cache.get(user.id)
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        console.log('User is an administrator') // Log 4: Usuário é administrador

        // Verifica se a mensagem contém o Duel ID
        const duelIdMatch = reaction.message.content.match(/Duel ID: (\w+)/)
        if (!duelIdMatch) {
          console.error('Duel ID not found in message content') // Log 5: Duel ID não encontrado
          return
        }

        const duelId = duelIdMatch[1]
        console.log('Duel ID extracted:', duelId) // Log 6: ID do duelo extraído

        // Busca o duelo no banco de dados
        const duel = await prisma.duel.findUnique({
          where: { id: duelId },
          include: {
            player1: true,
            player2: true,
          },
        })

        if (!duel) {
          console.error('Duel not found:', duelId) // Log 7: Duelo não encontrado
          return
        }

        console.log('Duel found:', duel) // Log 8: Duelo encontrado

        // Envia o duelo para o canal de resultados
        const resultsChannel = reaction.client.channels.cache.get(
          process.env.DUELS_CHANNEL_ID
        )

        if (!resultsChannel) {
          console.error('Results channel not found') // Log 9: Canal de resultados não encontrado
          return
        }

        console.log('Results channel found:', resultsChannel.name) // Log 10: Canal de resultados encontrado

        // Mensagem personalizada para o duelo aprovado
        const approvedDuelMessage =
          `Duel Approved!\n` +
          `Participants: <@${duel.player1.discordId}> vs <@${duel.player2.discordId}>\n` +
          `Score: ${duel.score}\n` +
          `Rounds: ${duel.rounds}\n` +
          `Winner: <@${
            duel.winner === duel.player1.id
              ? duel.player1.discordId
              : duel.player2.discordId
          }>\n` +
          `Approved by: <@${user.id}>`

        await resultsChannel.send(approvedDuelMessage)
        console.log('Duel posted in results channel') // Log 11: Duelo postado no canal de resultados

        // Remove a mensagem de aprovação do canal de aprovação
        await reaction.message.delete()
        console.log('Approval message deleted') // Log 12: Mensagem de aprovação deletada

        // Envia uma mensagem de confirmação no canal de aprovação (opcional)
        const approvalChannel = reaction.message.channel
        await approvalChannel.send(
          `Duel **${duelId}** was approved by <@${user.id}> and posted in the results channel.`
        )
        console.log('Confirmation message sent in approval channel') // Log 13: Mensagem de confirmação enviada
      } else {
        console.log('User is not an administrator') // Log 14: Usuário não é administrador
      }
    } else {
      console.log('Reaction is not ✅') // Log 15: Reação não é ✅
    }
  } else {
    console.log('Reaction is not in the approval channel') // Log 16: Reação não está no canal de aprovação
  }
}
