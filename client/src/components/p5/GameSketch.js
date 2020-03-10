import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Sketch from 'react-p5'

export default class GameSketch extends Component {
  setup = (p5, canvasParentRef) => {
    p5.createCanvas(500, 500).parent(canvasParentRef)
  }

  draw = p5 => {
    p5.background(0)
    p5.ellipse(this.props.x, this.props.y, 70, 70)
  }

  render () {
    return <Sketch setup={this.setup} draw={this.draw} />
  }
}

GameSketch.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number
}
