import { data as postDuelData, execute as postDuelExecute } from './postDuel.js'
import {
  data as exportDuelsData,
  execute as exportDuelsExecute,
} from './exportDuels.js'
import {
  data as registerPlayerData,
  execute as registerPlayerExecute,
} from './registerPlayer.js'
import {
  data as managePlayerData,
  execute as managePlayerExecute,
} from './managePlayer.js'
import { data as profileData, execute as profileExecute } from './profile.js'

export const profile = {
  data: profileData,
  execute: profileExecute,
}

export const postDuel = {
  data: postDuelData,
  execute: postDuelExecute,
}

export const exportDuels = {
  data: exportDuelsData,
  execute: exportDuelsExecute,
}

export const registerPlayer = {
  data: registerPlayerData,
  execute: registerPlayerExecute,
}

export const managePlayer = {
  data: managePlayerData,
  execute: managePlayerExecute,
}
