class Ant {
  static size = 5
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  draw = p5 => {
    p5.square(this.x, this.y, Ant.size)
  }
}

export default Ant
