const Player = require('../models/Player')
const { Game, gameKeys } = require('../models/Game')

module.exports = server => {
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    const socketFunctions = {
      disconnect: async () => {
        const playerID = await Player.find(socket.id)
        if (playerID !== null) {
          const gamecode = await Game.findByPlayerID(playerID)

          if (gamecode !== null) {
            io.to(gameKeys.trackerRoomKey(gamecode)).emit('tracker:playerLeft', { playerID })
          }

          Player.delete(socket.id)
        }
        console.log(`Player/Tracker disconnected: ${socket.id}`)
      },

      ...require('./game-channel')(io, socket),
      ...require('./player-channel')(io, socket)
    }

    for (const name in socketFunctions) {
      socket.on(name, socketFunctions[name])
    }
  })
}
