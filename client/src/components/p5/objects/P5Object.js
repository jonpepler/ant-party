class P5Object {
  constructor (coord) {
    this.x = coord.x
    this.y = coord.y
  }

  resetFill = (p5) => { p5.fill(255) }
}

export default P5Object
