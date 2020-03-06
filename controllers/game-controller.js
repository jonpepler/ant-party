const { Router } = require('express')
const Game = require('^models/Game')
const Player = require('^models/Player')

class GameController {
  constructor () {
    this.router = Router()
    this.router.post('/game/create', this.create)
    this.router.post('/game/join/:gamecode([0-9]{6})', this.join)
  }

  async create (req, res) {
    const gamecode = Game.create()
    res.send({ gamecode })
  }

  async join (req, res) {
    const { gamecode } = req.params
    const joinable = await Game.joinable(gamecode)

    if (joinable) {
      const playerID = await Player.findOrCreate(req.sessionID)
      const { result, error } = await Game.addPlayer(gamecode, playerID)
      if (result) {
        res.send(result)
      } else {
        res.status(error.status).send(error.message)
      }
    } else {
      res.status(405).send({
        error: 'This game is not joinable; has it already started?'
      })
    }
  }
}

module.exports = GameController
