const { redis } = require('./../redis')

const state = ['joining', 'started', 'complete']

class Game {
  static create () {
    const gamecode = this.generateCode()
    redis.hset(`game:${gamecode}`, 'state', 0)
    return gamecode
  }

  static generateCode () {
    // ensure 6 digit code
    const min = 111111
    const max = 999999
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static async getData (gamecode, key) {
    const res = await redis.hget(`game:${gamecode}`, key)
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

  static addPlayer (gamecode, playerID) {
    const exists = this.gameExists(gamecode)
    if (exists) {
      redis.sadd(`game:players:${gamecode}`, playerID)
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
    return redis.smembers(`game:players:${gamecode}`)
  }

  static async joinable (gamecode) {
    const state = await this.getState(gamecode)
    return state === 0
  }
}

module.exports = Game
