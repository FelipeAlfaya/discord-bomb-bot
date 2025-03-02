import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function scrapeDuels(client) {
  const duelsChannel = client.channels.cache.get(process.env.DUELS_CHANNEL_ID)
  if (!duelsChannel) {
    console.error('Duels channel not found!')
    return
  }

  let allMessages = [] // Armazena todas as mensagens
  let lastMessageId = null // ID da última mensagem buscada (para paginação)

  try {
    while (true) {
      const options = { limit: 100 }
      if (lastMessageId) {
        options.before = lastMessageId // Busca mensagens antes da última mensagem buscada
      }

      const messages = await duelsChannel.messages.fetch(options)

      // Se não houver mais mensagens, interrompe o loop
      if (messages.size === 0) {
        break
      }

      // Adiciona as mensagens ao array
      allMessages = allMessages.concat(Array.from(messages.values()))

      // Atualiza o ID da última mensagem para a próxima iteração
      lastMessageId = messages.last().id

      // Aguarda 1 segundo antes de buscar o próximo lote
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log(`Total messages read: ${allMessages.length}`)

    // Processa cada mensagem
    for (const message of allMessages) {
      await processDuel(message)
    }
  } catch (err) {
    console.error('Error fetching messages:', err)
  } finally {
    await prisma.$disconnect() // Fecha a conexão com o banco de dados
  }
}

// Função para processar um único duelo
async function processDuel(message) {
  if (
    message.channel.id === process.env.DUELS_CHANNEL_ID &&
    !message.author.bot
  ) {
    const content = message.content

    // Regex para capturar múltiplos duelos
    const regex =
      /Participants:\s*(.+) vs (.+)\s*Number of rounds:\s*(.+)\s*Score:\s*(\d+)[x-](\d+)\s*Winner:\s*(.+)/g
    let match

    // Processa cada duelo encontrado na mensagem
    while ((match = regex.exec(content)) !== null) {
      const [, participant1, participant2, rounds, score1, score2, winner] =
        match

      // Verifica se todos os campos foram capturados
      if (
        !participant1 ||
        !participant2 ||
        !rounds ||
        !score1 ||
        !score2 ||
        !winner
      ) {
        console.error('Invalid duel format:', content)
        continue // Pula para o próximo duelo
      }

      // Formata o score para o formato "X - Y"
      const score = `${score1}-${score2}`

      // Extrai o nome/nickname dos participantes (remove menções e espaços extras)
      const participant1Name = extractName(participant1)
      const participant2Name = extractName(participant2)
      const winnerName = extractName(winner)

      // Busca os jogadores no banco de dados
      const player1 = await findPlayerByNameOrNickname(participant1Name)
      const player2 = await findPlayerByNameOrNickname(participant2Name)
      const winnerPlayer = await findPlayerByNameOrNickname(winnerName)

      // Verifica se os jogadores foram encontrados
      if (!player1 || !player2 || !winnerPlayer) {
        console.error('One or more participants not found:', {
          participant1: participant1Name,
          participant2: participant2Name,
          winner: winnerName,
        })
        continue
      }

      // Verifica se o duelo já foi salvo no banco de dados
      const existingDuel = await prisma.duel.findUnique({
        where: {
          messageId: message.id,
        },
      })

      if (!existingDuel) {
        // Se o duelo não foi salvo, insere no banco de dados
        await prisma.duel.create({
          data: {
            messageId: message.id,
            participant1: player1.id, // Usa o ID do jogador 1
            participant2: player2.id, // Usa o ID do jogador 2
            rounds: rounds.trim(),
            score: score.trim(),
            winner: winnerPlayer.id, // Usa o ID do vencedor
          },
        })

        console.log('Duel saved successfully!')
      } else {
        console.log('Duel already exists:', message.id)
      }
    }
  }
}

// Função para extrair o nome/nickname de uma string (remove menções e espaços extras)
function extractName(input) {
  // Remove menções (@usuário) e espaços extras
  return input.replace(/<@!?\d+>/g, '').trim()
}

// Função para buscar um jogador pelo nome ou nickname
async function findPlayerByNameOrNickname(name) {
  return await prisma.player.findFirst({
    where: {
      OR: [
        { name: name }, // Busca pelo nome principal
        { discordId: name }, // Busca pelo ID do Discord
        { keywords: { has: name } }, // Busca pelos apelidos
      ],
    },
  })
}
