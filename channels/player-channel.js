const { Game, gameKeys } = require('^models/Game')
const Player = require('^models/Player')

module.exports = (io, socket) => {
  return {
    antFileUpdate: async data => {
      const { antFile, antFileVersion } = data
      const playerID = await Player.find(socket.id)
      const gamecode = await Game.findByPlayerID(playerID)
      console.log(`Received file from ${playerID}:\n${antFile}`)
      io.to(gameKeys.trackerRoomKey(gamecode)).emit('antFileUpdate', { playerID, antFileVersion })
      socket.emit('antFileUpdate', { result: true, liveAntFileVersion: antFileVersion })
    }
  }
}
