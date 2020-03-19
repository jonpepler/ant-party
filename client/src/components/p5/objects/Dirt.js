import P5Object from './P5Object'

class Dirt extends P5Object {
  static size = 10

  draw = p5 => {
    p5.square(this.x, this.y, Dirt.size)
  }
}

export default Dirt
