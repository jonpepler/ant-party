import P5Object from './P5Object'

class Nest extends P5Object {
  static wallSize = 10

  draw = p5 => {
    p5.square(this.x, this.y, Nest.size)
  }
}

export default Nest
