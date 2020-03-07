const Game = require('^models/Game')
const Player = require('^models/Player')

module.exports = (io, socket) => {
  return {
    joinGame: async data => {
      const { gamecode } = data
      const joinable = await Game.joinable(gamecode)

      let response = {}
      if (joinable) {
        const playerID = await Player.findOrCreate(socket.id)
        response = await Game.addPlayer(gamecode, playerID)
      } else {
        response = {
          result: false,
          error: {
            status: 405,
            message: 'This game is not joinable; has it already started?'
          }
        }
      }
      console.log('new player')
      socket.emit('joinGame', response)
    },

    joinGameRoom: data => {
      const { gamecode } = data
      socket.join(`game:${gamecode}`)
      socket.emit('joinGameRoom', { message: 'joined' })
    }
  }
}
