const { Router } = require('express')
const Game = require('^models/Game')

class GameController {
  constructor () {
    this.router = Router()
    this.router.post('/game/create', this.create)
  }

  async create (req, res) {
    const game = new Game()
    res.send({ gamecode: game.code })
  }
}

module.exports = GameController
