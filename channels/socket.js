module.exports = server => {
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    const socketFunctions = {
      joinGameTrackerRoom: data => {
        const { gamecode } = data
        socket.join(`game:${gamecode}:tracker`)
        socket.emit('joinGameTrackerRoom', { message: 'joined' })
        console.log('new tracker')
      },

      disconnect: () => { console.log('Player/Tracker disconnected.') },

      ...require('./game-channel')(io, socket)
    }

    for (const name in socketFunctions) {
      socket.on(name, socketFunctions[name])
    }
  })
}
