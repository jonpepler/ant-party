module.exports = server => {
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    console.log(`new player/tracker: ${socket}`)

    const socketFunctions = {
      joinGameTrackerRoom: data => {
        const { gamecode } = data
        socket.join(`game:${gamecode}`)
        socket.emit('joinGameTrackerRoom', { message: 'joined' })
      },

      disconnect: () => { console.log('Player/Tracker disconnected.') }
    }

    for (const name in socketFunctions) {
      socket.on(name, socketFunctions[name])
    }
  })
}
