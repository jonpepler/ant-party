module.exports = server => {
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    const socketFunctions = {
      disconnect: () => { console.log('Player/Tracker disconnected.') },

      ...require('./game-channel')(io, socket)
    }

    for (const name in socketFunctions) {
      socket.on(name, socketFunctions[name])
    }
  })
}
