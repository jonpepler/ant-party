const express = require('express')
const bodyParser = require('body-parser')
const { resolve } = require('path')
const history = require('connect-history-api-fallback')
const cors = require('cors')
const publicPath = resolve(__dirname, 'client/build')
const staticConf = { maxAge: '1y', etag: false }

const session = require('express-session')
const redis = require('redis')
const redisClient = redis.createClient(process.env.REDIS_URL)
const RedisStore = require('connect-redis')(session)

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
    redisClient.on('error', (err) => {
      console.log('Redis error: ', err)
    })

    // Start a session; we use Redis for the session store.
    // "secret" will be used to create the session ID hash (the cookie id and the redis key value)
    // "name" will show up as your cookie name in the browser
    // "cookie" is provided by default; you can add it to add additional personalized options
    // The "store" ttl is the expiration time for each Redis session ID, in seconds
    this.app.use(session({
      secret: process.env.SECRET,
      name: '_redis',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
      store: new RedisStore({ client: redisClient, ttl: 86400 })
    }))

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
