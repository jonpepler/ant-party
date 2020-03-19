import P5Object from './P5Object'

class Ant extends P5Object {
  static size = 5

  draw = p5 => {
    p5.square(this.x, this.y, Ant.size)
    this.resetFill(p5)
  }
}

export default Ant
