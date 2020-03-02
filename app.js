const express = require('express')
const bodyParser = require('body-parser')
const { resolve } = require('path')
const history = require('connect-history-api-fallback')
const cors = require('cors')
const publicPath = resolve(__dirname, 'client/build')
const staticConf = { maxAge: '1y', etag: false }

class App {
  constructor (controllers) {
    this.app = express()

    this.initializeMiddlewares()
    this.initializeControllers(controllers)
    this.initializeFrontEndMiddleware()
  }

  setupCors () {
  // These settings need to come from the environment
    const whitelist = [
      'http://localhost', // Local
      'http://localhost:8000', // Backend
      'http://localhost:3000', // Client (standard)
      'https://ant-party.herokuapp.com', // Demo
      'http://ant-party.herokuapp.com' // Demo
    ]
    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin || (origin && whitelist.indexOf(origin) !== -1)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    }
    return cors(corsOptions)
  }

  initializeMiddlewares () {
    this.app.use(bodyParser.json())
    this.app.use((req, res, next) => {
      req.params.id = req.params.id ? Number(req.params.id) : undefined
      next()
    })
    this.app.use(this.setupCors())
  }

  initializeFrontEndMiddleware () {
    this.app.use('/', history()) // The history middleware enables the front-end to be served correctly by the back-end
    this.app.use(express.static(publicPath, staticConf))
    this.app.use('/', history()) // This has to be initialised twice for reloading of front-end routes to be handled correctly
  }

  initializeControllers (controllers) {
    controllers.forEach((controller) => {
      this.app.use('/api/v1/', controller.router)
    })
  }
}

module.exports = App
