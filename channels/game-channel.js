const Game = require('^models/Game')
const Player = require('^models/Player')

const trackerRoomKey = gamecode => `game:${gamecode}:tracker`

module.exports = (io, socket) => {
  return {
    joinGameTrackerRoom: async data => {
      const { gamecode } = data
      socket.join(trackerRoomKey(gamecode))
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
        io.to(trackerRoomKey(gamecode)).emit('tracker:playerJoined', { playerID, playerName })
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
