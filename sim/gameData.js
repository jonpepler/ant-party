// Initial map data, ported from models/game_data/GameData.js.
import { nestShape, nestSpawnPoints, nestPointsList } from './shapes.js'
import { translateShape } from './geometry.js'

export const newGameTemplate = players => ({
  targetSize: { w: 1920, h: 1080 },
  players: players.map(player => ({ id: player })),
  nests: nestPointsList[players.length - 1].map((nestPoint, index) => ({
    player: players[index],
    points: translateShape(nestShape, nestPoint.x, nestPoint.y),
    spawnPoints: translateShape(nestSpawnPoints, nestPoint.x, nestPoint.y),
    health: 100,
    resources: { dirt: 0, food: 0 }
  })),
  ants: [],
  pheromones: []
})
