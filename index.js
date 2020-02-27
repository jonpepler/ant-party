const rooty = require('rooty')

rooty()

const App = require('./app')
const TestController = require('./controllers/test-controller')
const localPort = (process.env.NODE_ENV === 'test' ? 3456 : 8000)

const { app } = new App(
  [
    new TestController(),
  ]
)

const server = require('http').Server(app)

const port = process.env.PORT || localPort

server.listen(port, () => {
  console.log(`App listening on port ${port}`); // eslint-disable-line
})

module.exports = {
  app
}
