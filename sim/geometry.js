// Pure geometry helpers, ported from utils/Geometry.js (no dependencies).
export const Coord = (x, y) => ({ x, y })

export const translateShape = (shape, dx, dy) =>
  shape.map(coord => ({ x: coord.x + dx, y: coord.y + dy }))

// Note: this is an axis-aligned bounding-box test, not a true polygon test.
// Faithful to the original; fine for the rectangular nests in use.
export const pointInPolygon = (pointX, pointY, shapePoints) => {
  const minX = Math.min(...shapePoints.map(sp => sp[0]))
  const minY = Math.min(...shapePoints.map(sp => sp[1]))
  const maxX = Math.max(...shapePoints.map(sp => sp[0]))
  const maxY = Math.max(...shapePoints.map(sp => sp[1]))
  return pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY
}
