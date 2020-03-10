const { Game, gameKeys } = require('^models/Game')
const Player = require('^models/Player')

module.exports = (io, socket) => {
  return {
    joinGameTrackerRoom: async data => {
      const { gamecode } = data
      socket.join(gameKeys.trackerRoomKey(gamecode))
      const { result, error } = await Game.assignHost(gamecode, socket.id)
      if (result) {
        socket.emit('joinGameTrackerRoom', { message: 'joined' })
        console.log('new tracker')
      } else {
        console.error(error)
      }
    },

    joinGame: async data => {
      const { gamecode, playerName } = data
      const joinable = await Game.joinable(gamecode)

      let response = {}
      if (joinable) {
        const playerID = await Player.findOrCreate(socket.id, playerName)
        response = await Game.addPlayer(gamecode, playerID)
        socket.join(gameKeys.key(gamecode))
        io.to(gameKeys.trackerRoomKey(gamecode)).emit('tracker:playerJoined', { playerID, playerName })
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

    gameStart: data => {
      const { gamecode } = data
      console.log(`${gamecode} started`)
      Game.setState(gamecode, 'started')
      io.to(gameKeys.key(gamecode)).emit('gameStart')
    }

  }
}
