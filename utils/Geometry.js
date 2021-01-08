module.exports = {
  Coord: (x, y) => ({ x, y }),

  translateShape: (shape, dx, dy) => shape.map(coord => ({ x: coord.x + dx, y: coord.y + dy }))
}
