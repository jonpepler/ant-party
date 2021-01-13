const inside = require('point-in-polygon')

module.exports = {
  Coord: (x, y) => ({ x, y }),

  translateShape: (shape, dx, dy) => shape.map(coord => ({ x: coord.x + dx, y: coord.y + dy })),

  pointInPolygon: (pointX, pointY, shapePoints) => {
    return inside([pointX, pointY], shapePoints)
  }
}
