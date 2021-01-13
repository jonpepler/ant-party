/* eslint-disable no-unused-expressions */

// Import the dependencies for testing
import { expect } from 'chai'
import { Coord, translateShape, pointInPolygon } from '../../utils/Geometry'

describe('Coord', () => {
  it('stores x and y values', async () => {
    const [x, y] = [1, 5]
    const result = Coord(x, y)
    expect(result.x).to.equal(x)
    expect(result.y).to.equal(y)
  })
})

describe('translateShape', () => {
  it('shifts a shape by x and y', async () => {
    const [xShift, yShift] = [1, 5]
    const shape = [Coord(0, 0), Coord(1, 0), Coord(1, 1), Coord(0, 1)]
    const expectedShape = [Coord(1, 5), Coord(2, 5), Coord(2, 6), Coord(1, 6)]
    const result = translateShape(shape, xShift, yShift)
    expect(result).to.eql(expectedShape)
  })
})

describe('pointInPolygon', () => {
  it('returns true when a point is inside a square', async () => {
    const pointX = 5
    const pointY = 7
    const shape = [[0, 0], [0, 10], [10, 10], [10, 0]]
    const result = pointInPolygon(pointX, pointY, shape)
    expect(result).to.be.true
  })

  it('returns false when a point is outside a square', async () => {
    const pointX = 12
    const pointY = 7
    const shape = [[0, 0], [0, 10], [10, 10], [10, 0]]
    const result = pointInPolygon(pointX, pointY, shape)
    expect(result).to.be.false
  })
})
