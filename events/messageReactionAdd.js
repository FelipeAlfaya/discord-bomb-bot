import { PermissionsBitField, EmbedBuilder } from 'discord.js'
import prisma from '../prisma.js'

export const pendingDuels = new Map()

export const name = 'messageReactionAdd'

// Função para calcular a mudança de MMR
function calculateMMRChange(
  winnerMMR,
  loserMMR,
  overallDifference,
  scoreDifference
) {
  const baseMMRChange = 30 // Base de mudança de MMR
  const mmrDifference = winnerMMR - loserMMR

  // Ajusta a mudança de MMR com base na diferença de MMR
  let mmrChange = baseMMRChange * (1 - mmrDifference / 1000)

  // Ajusta a mudança de MMR com base na diferença de overall
  if (overallDifference > 6) {
    mmrChange *= 0.5 // Reduz a mudança de MMR se a diferença de overall for grande
  } else if (overallDifference < -6) {
    mmrChange *= 1.5 // Aumenta a mudança de MMR se o vencedor tiver overall menor
  } else if (overallDifference < 8) {
    mmrChange *= 0.3 // Reduz a mudança de MMR se a diferença de overall for grande
  } else if (overallDifference < 10) {
    mmrChange *= 0.1 // Reduz a mudança de MMR se a diferença de overall for imensa
  }

  // Ajusta a mudança de MMR com base na diferença de score
  if (scoreDifference >= 5) {
    mmrChange *= 0.7 // Reduz a mudança de MMR se o score for muito desequilibrado
  } else if (scoreDifference <= 2) {
    mmrChange *= 1.3 // Aumenta a mudança de MMR se o score for muito disputado
  }

  return Math.round(mmrChange)
}

// Função para calcular a mudança de LP
function calculateLPChange(
  winnerMMR,
  loserMMR,
  overallDifference,
  scoreDifference
) {
  const baseLPChange = 30 // Base de mudança de LP
  const mmrDifference = winnerMMR - loserMMR

  // Ajusta a mudança de LP com base na diferença de MMR
  let lpChange = baseLPChange * (1 - mmrDifference / 1000)

  // Ajusta a mudança de LP com base na diferença de overall
  if (overallDifference > 6) {
    lpChange *= 0.5 // Reduz a mudança de LP se a diferença de overall for grande
  } else if (overallDifference < -6) {
    lpChange *= 1.5 // Aumenta a mudança de LP se o vencedor tiver overall menor
  } else if (overallDifference < -8) {
    lpChange *= 0.8
  } else if (overallDifference < -10) {
    lpChange *= 0.3
  }

  // Ajusta a mudança de LP com base na diferença de score
  if (scoreDifference >= 5) {
    lpChange *= 0.7 // Reduz a mudança de LP se o score for muito desequilibrado
  } else if (scoreDifference <= 2) {
    lpChange *= 1.3 // Aumenta a mudança de LP se o score for muito disputado
  }

  return Math.round(lpChange)
}

export async function execute(reaction, user) {
  console.log('Reaction detected:', reaction.emoji.name)

  if (reaction.message.channel.id === process.env.APPROVAL_CHANNEL_ID) {
    console.log('Reaction is in the approval channel')

    if (reaction.emoji.name === '✅') {
      console.log('Reaction is ✅')

      const member = reaction.message.guild.members.cache.get(user.id)
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        console.log('User is an administrator')

        const duelIdMatch = reaction.message.content.match(/Duel ID: (\w+)/)
        if (!duelIdMatch) {
          console.error('Duel ID not found in message content')
          return
        }

        const duelId = duelIdMatch[1]
        console.log('Duel ID extracted:', duelId)

        const pendingDuel = pendingDuels.get(duelId)
        if (!pendingDuel) {
          console.error('Pending duel not found:', duelId)
          return
        }

        const duel = await prisma.duel.create({
          data: {
            participant1: pendingDuel.participant1,
            participant2: pendingDuel.participant2,
            score: pendingDuel.score,
            rounds: pendingDuel.rounds,
            winner: pendingDuel.winner,
            messageId: pendingDuel.messageId,
            season: pendingDuel.season,
          },
          include: {
            player1: true,
            player2: true,
          },
        })

        console.log('Duel saved to database:', duel)

        pendingDuels.delete(duelId)

        const winner =
          duel.winner === duel.player1.id ? duel.player1 : duel.player2
        const loser =
          duel.winner === duel.player1.id ? duel.player2 : duel.player1

        const overallDifference = Math.abs(winner.overall - loser.overall)
        const scoreParts = duel.score.split('-')
        const score1 = parseInt(scoreParts[0].trim(), 10)
        const score2 = parseInt(scoreParts[1].trim(), 10)
        const scoreDifference = Math.abs(score1 - score2)

        const mmrChange = calculateMMRChange(
          winner.mmr,
          loser.mmr,
          overallDifference,
          scoreDifference
        )
        const lpChange = calculateLPChange(
          winner.mmr,
          loser.mmr,
          overallDifference,
          scoreDifference
        )

        await prisma.player.update({
          where: { id: winner.id },
          data: {
            mmr: winner.mmr + mmrChange,
            lp: winner.lp + lpChange,
          },
        })

        await prisma.player.update({
          where: { id: loser.id },
          data: {
            mmr: loser.mmr - mmrChange,
            lp: loser.lp - lpChange,
          },
        })

        console.log('LP updated:', {
          winner: winner.id,
          loser: loser.id,
          mmrChange,
          lpChange,
        })

        const resultsChannel = reaction.client.channels.cache.get(
          process.env.DUELS_CHANNEL_ID
        )

        if (!resultsChannel) {
          console.error('Results channel not found')
          return
        }

        console.log('Results channel found:', resultsChannel.name)

        // Verifica se os jogadores foram incluídos corretamente
        if (!duel.player1 || !duel.player2) {
          console.error('Player data not found in duel:', duel)
          return
        }

        // Busca o usuário do Discord do vencedor para obter a foto de perfil
        const winnerUser = await reaction.client.users.fetch(
          duel.winner === duel.player1.id
            ? duel.player1.discordId
            : duel.player2.discordId
        )

        // Cria o embed
        const embed = new EmbedBuilder()
          .setTitle('**A New Duel Was Approved!**')
          .setColor(0x0099ff) // Cor do embed
          .setDescription('A new duel was approved and registered!')
          .addFields(
            {
              name: 'Participants',
              value: `<@${duel.player1.discordId}> vs <@${duel.player2.discordId}>`,
              inline: true,
            },
            { name: 'Score', value: duel.score, inline: true },
            { name: 'Rounds', value: duel.rounds, inline: true },
            {
              name: 'Winner',
              value: `<@${
                duel.winner === duel.player1.id
                  ? duel.player1.discordId
                  : duel.player2.discordId
              }>`,
              inline: true,
            }
          )
          .setThumbnail(winnerUser.displayAvatarURL()) // Foto do vencedor
          .setFooter({
            text: `✅ Approved by ${user.username}`,
            iconURL: user.displayAvatarURL(),
          })
          .setTimestamp()

        // Envia o embed no canal de resultados
        await resultsChannel.send({ embeds: [embed] })
        console.log('Duel posted in results channel as an embed')

        // Remove a mensagem de aprovação do canal de aprovação
        await reaction.message.delete()
        console.log('Approval message deleted')

        // Envia uma mensagem de confirmação no canal de aprovação (opcional)
        const approvalChannel = reaction.message.channel
        await approvalChannel.send(
          `Duel **${duelId}** was approved by <@${user.id}> and posted in the results channel.`
        )
        console.log('Confirmation message sent in approval channel')
      } else {
        console.log('User is not an administrator')
      }
    } else {
      console.log('Reaction is not ✅')
    }
  } else {
    console.log('Reaction is not in the approval channel')
  }
}
