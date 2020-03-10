import React from 'react'
import PropTypes from 'prop-types'
import GameSketch from './p5/GameSketch'

export default class Game extends React.Component {
  constructor (props) {
    super(props)

    this.setSocketFunctions = this.setSocketFunctions.bind(this)
    this.reportGameStart = this.reportGameStart.bind(this)

    this.setSocketFunctions()
    this.reportGameStart()
  }

  state = { x: 10, y: 10 }

  setSocketFunctions = () => {
    this.props.socket.on('test', data => {
      console.log('pass', data)
    })
  }

  reportGameStart = () => {
    this.props.socket.emit('gameStart', { gamecode: this.props.gamecode })
  }

  handleMove = () => {
    this.setState(s => {
      return { x: s.x + 10, y: s.y + 10 }
    })
  }

  render () {
    return (
      <>
        <button onClick={this.handleMove}>Move</button>
        <GameSketch x={this.state.x} y={this.state.y} />
      </>
    )
  }
}

Game.propTypes = {
  gamecode: PropTypes.number,
  socket: PropTypes.object
}
