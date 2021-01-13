const { redis } = require('./../redis')
const Func = require('./Func')
const GameData = require('./game_data/GameData')
const { pointInPolygon } = require('./../utils/Geometry')

const state = ['joining', 'started', 'complete']

const key = gamecode => `game:${gamecode}`
const playersKey = gamecode => `game:${gamecode}:players`
const antFileKey = (gamecode, playerID) => `antfile:${gamecode}:${playerID}`
const hostKey = gamecode => `game:${gamecode}:host`
const trackerRoomKey = gamecode => `game:${gamecode}:tracker`
const newAntQueueKey = gamecode => `game:${gamecode}:antqueue`

class Game {
  static create () {
    const gamecode = this.generateCode()
    redis.hset(key(gamecode), 'state', 0)
    redis.sadd('games', gamecode)
    return gamecode
  }

  static generateCode () {
    // ensure 6 digit code
    const min = 111111
    const max = 999999
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static async assignHost (gamecode, hostID) {
    const exists = await this.gameExists(gamecode)
    if (exists) {
      redis.set(hostKey(gamecode), hostID)
      return { result: true, error: null }
    }
    return {
      result: false,
      error: {
        message: 'No game exists with that code.',
        status: 405
      }
    }
  }

  static async confirmHost (gamecode, suspiciousID) {
    const exists = await this.gameExists(gamecode)
    if (exists) {
      const hostID = await redis.get(hostKey(gamecode))
      return { result: hostID === suspiciousID, error: null }
    }
    return {
      result: false,
      error: {
        message: 'No game exists with that code.',
        status: 405
      }
    }
  }

  static async getData (gamecode, field) {
    return redis.hget(key(gamecode), field)
  }

  static setData (gamecode, field, value) {
    return redis.hset(key(gamecode), field, value)
  }

  static setMapData (gamecode, mapData) {
    this.setData(gamecode, 'data', JSON.stringify(mapData))
  }

  static async getMapData (gamecode) {
    return JSON.parse(await this.getData(gamecode, 'data'))
  }

  static async updateAntFile (gamecode, playerID, antfile) {
    const newVersion = redis.rpush(antFileKey(gamecode, playerID), antfile) - 1
    return newVersion
  }

  static async getAntFile (gamecode, playerID, version) {
    const file = await redis.lrange(antFileKey(gamecode, playerID), version, version)
    return file ? file[0] : null
  }

  static async getAntFileLatestVersion (gamecode, playerID) {
    return await redis.llen(antFileKey(gamecode, playerID)) - 1
  }

  static async getState (gamecode) {
    const state = await this.getData(gamecode, 'state')
    return parseInt(state)
  }

  static async initialiseGameMapData (gamecode) {
    const template = GameData.newGameTemplate(await this.getPlayers(gamecode))
    this.setMapData(gamecode, template)
  }

  static async setState (gamecode, stateString) {
    const possibleState = state.includes(stateString)
    if (possibleState) {
      if (stateString === 'started') {
        this.initialiseGameMapData(gamecode)
      }
      return this.setData(gamecode, 'state', state.indexOf(stateString))
    }
    return 0
  }

  static async getStateString (gamecode) {
    return state[await this.getState(gamecode)]
  }

  static async gameExists (gamecode) {
    const state = await this.getState(gamecode)
    return state !== null
  }

  static async addPlayer (gamecode, playerID) {
    const exists = await this.gameExists(gamecode)
    const state = await this.getState(gamecode)
    if (exists && state === 0) {
      console.log(`adding player ${playerID} to ${gamecode}`)
      redis.sadd(playersKey(gamecode), playerID)
      return { result: true, error: null }
    }
    return {
      result: false,
      error: {
        message: 'No joinable game exists with that code.',
        status: 405
      }
    }
  }

  static async getPlayers (gamecode) {
    return redis.smembers(playersKey(gamecode))
  }

  static async findByPlayerID (playerID) {
    const games = await redis.smembers('games')

    const gamesWithPlayers = await Promise.all(games.map(async (gamecode) => {
      const players = await redis.smembers(playersKey(gamecode))
      return { gamecode, players }
    }))

    let gamecode = null
    gamesWithPlayers.some(game => {
      if (game.players.includes(playerID)) {
        gamecode = game.gamecode
      }
    })

    return gamecode
  }

  static async joinable (gamecode) {
    const state = await this.getState(gamecode)
    return state === 0
  }

  /* get list of free spawn points around nest
    filter down that list by ants that are around it
    randomly choose one point and return it */
  static randomFreePointSpawnPoint (mapData, nest) {
    const { spawnPoints } = nest
    const freeSpawnPoints = spawnPoints
      .filter(spawnPoint => mapData.ants
        .every(ant => spawnPoint.x !== ant.x || spawnPoint.y !== ant.y))

    return freeSpawnPoints.length
      ? freeSpawnPoints[Math.floor(Math.random() * freeSpawnPoints.length)]
      : null
  }

  static async newAntRequest (gamecode, playerID) {
    // only create a new ant once there's an antFile
    if (await Game.getAntFileLatestVersion(gamecode, playerID) > 0) {
      await redis.lpush(newAntQueueKey(gamecode), playerID)
    }
  }

  static async emptyNewAntQueue (gamecode) {
    let antRequest
    const antRequests = []
    while ((antRequest = await redis.rpop(newAntQueueKey(gamecode)))) {
      antRequests.push(antRequest)
    }
    return antRequests
  }

  static newAnt (x, y, player, antFileVersion) {
    return {
      x,
      y,
      health: 10,
      player,
      antFileVersion
    }
  }

  static coordOccupied (mapData, posX, posY) {
    return mapData.nests.some(nest => pointInPolygon(posX, posY, nest.points.map(point => [point.x, point.y]))) ||
            mapData.ants.some(ant => ant.x === posX && ant.y === posY)
  }

  static translateDirectionToMovement (direction) {
    switch (direction) {
      case 0:
        return { x: 0, y: -1 }
      case 1:
        return { x: 1, y: -1 }
      case 2:
        return { x: 1, y: 0 }
      case 3:
        return { x: 1, y: 1 }
      case 4:
        return { x: 0, y: 1 }
      case 5:
        return { x: -1, y: 1 }
      case 6:
        return { x: -1, y: 0 }
      case 7:
        return { x: -1, y: -1 }
    }
  }

  static async tick (gamecode, io, timestamp) {
    let mapData
    try {
      mapData = await Game.getMapData(gamecode)
    } catch (e) {
      console.error(e)
    }
    const newTimestamp = Date.now()
    const newAnts = (newTimestamp - timestamp > 5000)
    let gameFinished = false
    // could collect antFuncs into array and use Promise.all
    for (const ant of mapData.ants) {
      /// build ant object for ant
      /// pass ant object to ant's antfile version
      /// use result to get an action + pheromone
      /// apply action (if possible) to mapData
      /// release pheromone at location on mapData
      const antObj = {
        senses: Array.from({ length: 8 }),
        health: ant.health
      }
      const antFile = await Game.getAntFile(gamecode, ant.player, ant.antFileVersion)
      const antFunc = new Func(antFile, antObj)
      const actions = await antFunc.run()
      if (actions.move) {
        const movement = Game.translateDirectionToMovement(actions.move)
        // add movement to position
        const newPosX = ant.x + movement.x
        const newPosY = ant.y + movement.y
        if (!Game.coordOccupied(mapData, newPosX, newPosY)) {
          ant.x = newPosX
          ant.y = newPosY
        }
        // else report to player
      }
    }

    for (const nest of mapData.nests) {
      /// resolve nest health
      if (nest.health <= 0) gameFinished = true
    }

    const newAntRequests = await Game.emptyNewAntQueue(gamecode)
    /// spawn new ants based on requests (and food in future)
    for (const playerID of newAntRequests) {
      const nest = mapData.nests.find(nest => nest.player === playerID)
      if (nest.health > 0) {
        const spawnPoint = Game.randomFreePointSpawnPoint(mapData, nest)
        if (spawnPoint) {
          mapData.ants.push(
            Game.newAnt(
              spawnPoint.x,
              spawnPoint.y,
              playerID,
              await Game.getAntFileLatestVersion(gamecode, playerID)
            )
          )
        }
      }
    }

    console.log(Date.now(), mapData.ants)
    // emit mapdata to game trackers
    Game.setMapData(gamecode, mapData)
    io.to(trackerRoomKey(gamecode)).emit('mapData', mapData)
    // setInterval for 60 seconds, record time of schedule? for ants
    if (!gameFinished) setTimeout(Game.tick, 1000, gamecode, io, newAnts ? newTimestamp : timestamp)
  }
}

module.exports.Game = Game
module.exports.gameKeys = {
  key,
  playersKey,
  hostKey,
  trackerRoomKey
}
