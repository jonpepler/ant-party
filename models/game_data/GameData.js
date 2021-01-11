const { nestShape } = require('./Shapes')
const nestPointsList = require('../../utils/NestPoints')
const { translateShape, Coord } = require('../../utils/Geometry')

class GameData {
  static newGameTemplate (players) {
    // populate with nest, dirt, objects with (relative) dimensions per player
    return {
      targetSize: { w: 1920, h: 1080 },
      players: players.map(player => ({ id: player })),
      nests: nestPointsList[players.length - 1].map(
        (nestPoint, index) => {
          const nestPoints = translateShape(nestShape, nestPoint.x, nestPoint.y)
          return {
            player: players[index],
            points: nestPoints,
            spawnPoints: nestPoints,
            health: 100,
            resources: {
              dirt: 0,
              food: 0
            }
          }
        }
      ),
      ants: []
    }
  }
}

module.exports = GameData
