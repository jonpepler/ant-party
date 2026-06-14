// Nest shapes, ported from models/game_data/Shapes.js.
import { Coord } from './geometry.js'

export const nestShape = [Coord(-15, 15), Coord(15, 15), Coord(15, -15), Coord(-15, -15)]
export const nestSpawnPoints = [Coord(-16, 16), Coord(16, 16), Coord(16, -16), Coord(-16, -16)]

// Nest positions per player count, ported from utils/NestPoints.js.
// Index = playerCount - 1.
export const nestPointsList = [
  [Coord(960, 540)],
  [Coord(80, 540), Coord(1840, 540)],
  [Coord(80, 80), Coord(1840, 80), Coord(80, 1000)],
  [Coord(80, 80), Coord(1840, 80), Coord(80, 1000), Coord(1840, 1000)]
]
