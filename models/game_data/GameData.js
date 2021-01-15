const { nestShape, nestSpawnPoints } = require('./Shapes')
const nestPointsList = require('../../utils/NestPoints')
const { translateShape } = require('../../utils/Geometry')

class GameData {
  static newGameTemplate (players) {
    // populate with nest, dirt, objects with (relative) dimensions per player
    return {
      targetSize: { w: 1920, h: 1080 },
      players: players.map(player => ({ id: player })),
      nests: nestPointsList[players.length - 1].map(
        (nestPoint, index) => {
          const points = translateShape(nestShape, nestPoint.x, nestPoint.y)
          const spawnPoints = translateShape(nestSpawnPoints, nestPoint.x, nestPoint.y)
          return {
            player: players[index],
            points,
            spawnPoints,
            health: 100,
            resources: {
              dirt: 0,
              food: 0
            }
          }
        }
      ),
      ants: [],
      pheromones: []
    }
  }
}

module.exports = GameData
