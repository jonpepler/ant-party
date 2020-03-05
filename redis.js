const session = require('express-session')
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)
const RedisStore = require('connect-redis')(session)

module.exports = { session, redis, RedisStore }
