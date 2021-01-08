import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Sketch from 'react-p5'

import Nest from './objects/Nest'
import Ant from './objects/Ant'

export default class GameSketch extends Component {
  targetSize = {
    w: 1920,
    h: 1080
  }

  defaultFill = 255

  getWidth = () => document.querySelector('.main-content').offsetWidth
  getHeight = () => document.querySelector('.main-content').offsetHeight
  getRelativeWidth = () => this.getWidth() / this.targetSize.w
  getRelativeHeight = () => this.getHeight() / this.targetSize.h
  getRelativeSize = p5 => ({ relativeWidth: this.getRelativeWidth(), relativeHeight: this.getRelativeHeight() })

  setup = (p5, canvasParentRef) => {
    p5.createCanvas(this.targetSize.w, this.targetSize.h).parent(canvasParentRef)
    this.windowResized(p5)
  }

  resetFill = p5 => p5.fill(this.defaultFill)

  draw = p5 => {
    const { mapData } = this.props
    const drawables = [
      ...mapData.nests.map(nest => new Nest(nest.health, nest.points)),
      ...mapData.ants.map(ant => new Ant(ant.x, ant.y))
    ]
    this.setScale(p5)
    p5.background(63, 67, 79)
    drawables.forEach(drawable => {
      this.resetFill(p5)
      drawable.draw(p5)
    })
  }

  getScale = (p5, returnSizes) => {
    const { relativeWidth, relativeHeight } = this.getRelativeSize(p5)
    const normalise = n => n < 1 ? 1 - n : n - 1
    const widthBigger = normalise(relativeWidth) > normalise(relativeHeight)
    const scale = widthBigger ? relativeWidth : relativeHeight
    if (!returnSizes) return scale
    let canvasSize
    if (widthBigger) {
      canvasSize = [this.getWidth(), this.targetSize.h * scale]
    } else {
      canvasSize = [this.targetSize.w * scale, this.getHeight()]
    }
    return { scale, canvasSize }
  }

  setScale = p5 => p5.scale(this.getScale(p5))

  windowResized = p5 => {
    const { canvasSize } = this.getScale(p5, true)
    p5.resizeCanvas(...canvasSize)
  }

  render () {
    return (
      <Sketch
        setup={this.setup}
        draw={this.draw}
        windowResized={this.windowResized}
      />
    )
  }
}

GameSketch.propTypes = {
  increment: PropTypes.number,
  mapData: PropTypes.shape({
    ants: PropTypes.array,
    nests: PropTypes.array,
    players: PropTypes.array,
    targetSize: PropTypes.object
  })
}
