module.exports = {
  Coord: (x, y) => ({ x, y }),

  translateShape: (shape, dx, dy) => shape.map(coord => ({ x: coord.x + dx, y: coord.y + dy })),

  pointInPolygon: (pointX, pointY, shapePoints) => {
    const minX = Math.min(...shapePoints.map(sp => sp[0]))
    const minY = Math.min(...shapePoints.map(sp => sp[1]))
    const maxX = Math.max(...shapePoints.map(sp => sp[0]))
    const maxY = Math.max(...shapePoints.map(sp => sp[1]))
    return pointX >= minX &&
          pointX <= maxX &&
          pointY >= minY &&
          pointY <= maxY
  }
}
