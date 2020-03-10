const { redis } = require('./../redis')

const state = ['joining', 'started', 'complete']

const gameKey = gamecode => `game:${gamecode}`
const gamePlayersKey = gamecode => `game:${gamecode}:players`
const gameHostKey = gamecode => `game:${gamecode}:host`

class Game {
  static create () {
    const gamecode = this.generateCode()
    redis.hset(gameKey(gamecode), 'state', 0)
    redis.sadd('games', gamecode)
    return gamecode
  }

  static generateCode () {
    // ensure 6 digit code
    const min = 111111
    const max = 999999
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static async assignHost (gamecode, hostID) {
    const exists = await this.gameExists(gamecode)
    if (exists) {
      redis.set(gameHostKey(gamecode), hostID)
      return { result: true, error: null }
    }
    return {
      result: false,
      error: {
        message: 'No game exists with that code.',
        status: 405
      }
    }
  }

  static async getData (gamecode, key) {
    const res = await redis.hget(gameKey(gamecode), key)
    return res
  }

  static async getState (gamecode) {
    const state = await this.getData(gamecode, 'state')
    return parseInt(state)
  }

  static async getStateString (gamecode) {
    return state[await this.getState(gamecode)]
  }

  static async gameExists (gamecode) {
    const state = await this.getState(gamecode)
    return state !== null
  }

  static async addPlayer (gamecode, playerID) {
    const exists = await this.gameExists(gamecode)
    if (exists) {
      redis.sadd(gamePlayersKey(gamecode), playerID)
      return { result: true, error: null }
    }
    return {
      result: false,
      error: {
        message: 'No game exists with that code.',
        status: 405
      }
    }
  }

  static async getPlayers (gamecode) {
    return redis.smembers(gamePlayersKey(gamecode))
  }

  static async findByPlayerID (playerID) {
    const games = await redis.smembers('games')

    const gamesWithPlayers = await Promise.all(games.map(async (gamecode) => {
      const players = await redis.smembers(gamePlayersKey(gamecode))
      return { gamecode, players }
    }))

    let gamecode = null
    gamesWithPlayers.some(game => {
      if (game.players.includes(playerID)) {
        gamecode = game.gamecode
      }
    })

    return gamecode
  }

  static async joinable (gamecode) {
    const state = await this.getState(gamecode)
    return state === 0
  }
}

module.exports = Game
