const rooty = require('rooty')

rooty()

// Load envvars from .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const App = require('./app')
const TestController = require('./controllers/test-controller')
const FuncController = require('./controllers/func-controller')
const GameController = require('./controllers/game-controller')
const localPort = (process.env.NODE_ENV === 'test' ? 3456 : 8000)

const { app } = new App(
  [
    new TestController(),
    new FuncController(),
    new GameController()
  ]
)

const server = require('http').Server(app)

require('./channels/socket')(server)

const port = process.env.PORT || localPort

server.listen(port, () => {
  console.log(`App listening on port ${port}`); // eslint-disable-line
})

module.exports = {
  app
}
