const { Router } = require('express')
const Game = require('^models/Game')

class GameController {
  constructor () {
    this.router = Router()
    this.router.post('/game/create', this.create)
  }

  async create (req, res) {
    const gamecode = Game.create()
    res.send({ gamecode })
  }
}

module.exports = GameController
