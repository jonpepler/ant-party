import ColourObject from './ColourObject'

class Nest extends ColourObject {
  constructor (health, coords) {
    const healthToColour = health => {
      if (health === 100) return 'green'
      if (health > 20 && health < 100) return 'yellow'
      if (health < 20) return 'red'
    }
    super(coords, healthToColour(health))
  }

  draw = p5 => {
    p5.fill(this.colour)
    p5.beginShape()
    this.coords.forEach(coord => {
      p5.vertex(coord.x, coord.y)
    })
    p5.endShape(p5.CLOSE)
  }
}

export default Nest
