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
        console.log(`${socket.id} joined ${gameKeys.key(gamecode)}. Rooms: ${socket.rooms}`)
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

    gameStart: async data => {
      const { gamecode } = data
      const authorised = await Game.confirmHost(gamecode, socket.id)
      if (authorised) {
        console.log(`${gamecode} started`)
        await Game.setState(gamecode, 'started')
        const mapData = await Game.getData(gamecode, 'data')
        io.to(gameKeys.key(gamecode)).emit('gameStart')
        io.to(gameKeys.trackerRoomKey(gamecode)).emit('gameStart', mapData)
        Game.tick(gamecode, io, Date.now())
      } else {
        socket.emit('gameStart', { result: false, error: { status: 401, message: 'Unauthorised' } })
      }
    },

    antSpawnRequest: async () => {
      const playerID = await Player.find(socket.id)
      const gamecode = await Game.findByPlayerID(playerID)
      Game.newAntRequest(gamecode, playerID)
      console.log('ant requested by', playerID)
    }

  }
}
