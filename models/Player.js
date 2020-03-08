const { redis } = require('./../redis')
const { v4: uuidv4 } = require('uuid')

const key = sessionID => `player:${sessionID}`

class Player {
  static create (sessionID, name) {
    this.id = uuidv4()
    redis.hset(key(sessionID), 'id', this.id, 'name', name)
    return this.id
  }

  static async findOrCreate (sessionID, name) {
    let id = await this.find(sessionID)
    if (id === null) {
      id = Player.create(sessionID, name)
    }
    return id
  }

  static async find (sessionID) {
    return redis.hget(key(sessionID), 'id')
  }

  static async delete (sessionID) {
    return redis.del(key(sessionID))
  }
}

module.exports = Player
