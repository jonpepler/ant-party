const { redis } = require('./../redis')
const { v4: uuidv4 } = require('uuid')

class Player {
  static create (sessionID) {
    this.id = uuidv4()
    redis.hset('PlayerMap', sessionID, this.id)
    return this.id
  }

  static async findOrCreate (sessionID) {
    let id = await redis.hget('PlayerMap', sessionID)
    if (id === null) {
      id = Player.create(sessionID)
    }
    return id
  }
}

module.exports = Player
