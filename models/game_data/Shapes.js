const { Coord } = require('../../utils/Geometry')

module.exports = {
  nestShape: [Coord(-15, 15), Coord(15, 15), Coord(15, -15), Coord(-15, -15)],
  nestSpawnPoints: [Coord(-16, 16), Coord(16, 16), Coord(16, -16), Coord(-16, -16)]
}
