import React, { Component } from 'react'
import Sketch from 'react-p5'

import Coord from './util/Coord'
import Ant from './objects/Ant'
import Dirt from './objects/Dirt'

export default class GameSketch extends Component {
  targetSize = {
    w: 1920,
    h: 1080
  }

  getWidth = () => document.querySelector('.main-content').offsetWidth
  getHeight = () => document.querySelector('.main-content').offsetHeight
  getRelativeWidth = p5 => this.getWidth() / this.targetSize.w
  getRelativeHeight = p5 => this.getHeight() / this.targetSize.h
  getRelativeSize = p5 => ({ relativeWidth: this.getRelativeWidth(p5), relativeHeight: this.getRelativeHeight(p5) })

  setup = (p5, canvasParentRef) => {
    p5.createCanvas(this.targetSize.w, this.targetSize.h).parent(canvasParentRef)
    this.windowResized(p5)
  }

  drawables = [
    new Ant(new Coord(20, 20)),
    new Ant(new Coord(1900, 1060)),
    new Dirt(new Coord(990, 540)),
    new Ant(new Coord(20, 1060)),
    new Ant(new Coord(1900, 20))
  ]

  draw = p5 => {
    this.setScale(p5)
    p5.background(63, 67, 79)
    p5.fill(255)
    this.drawables.forEach(drawable => { drawable.draw(p5) })
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
