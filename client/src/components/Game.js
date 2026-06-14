import React from 'react'
import PropTypes from 'prop-types'
import GameSketch from './p5/GameSketch'

// The host already runs the simulation loop and feeds fresh mapData down as a
// prop, so Game is now just a thin wrapper around the renderer.
export default class Game extends React.Component {
  render () {
    if (!this.props.mapData) return null
    return <GameSketch mapData={this.props.mapData} />
  }
}

Game.propTypes = {
  mapData: PropTypes.shape({
    ants: PropTypes.array,
    nests: PropTypes.array,
    players: PropTypes.array,
    pheromones: PropTypes.array,
    targetSize: PropTypes.object
  })
}
