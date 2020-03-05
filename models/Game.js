const { redis } = require('./../redis')

const state = ['joining', 'started', 'complete']

class Game {
  constructor () {
    this.getData = this.getData.bind(this)
    this.getState = this.getState.bind(this)

    this.code = this.generateCode()
    redis.hset(`game-${this.code}`, 'state', 0)
  }

  generateCode () {
    // ensure 6 digit code
    const min = 111111
    const max = 999999
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async getData (key) {
    const res = await redis.hget(`game-${this.code}`, key)
    return res
  }

  async getState () {
    const state = await this.getData('state')
    return state
  }

  async getStateString () {
    return state[await this.getState()]
  }
}

module.exports = Game
