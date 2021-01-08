import P5Object from './P5Object'

class ColourObject extends P5Object {
  constructor (coords, colour) {
    super(coords)
    this.colour = colour
  }
}

export default ColourObject
