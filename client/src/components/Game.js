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

  setSocketFunctions = () => {
    this.props.socket.on('test', data => {
      console.log('pass', data)
    })
  }

  reportGameStart = () => {
    this.props.socket.emit('gameStart', { gamecode: this.props.gamecode })
  }

  render () {
    return <GameSketch />
  }
}

Game.propTypes = {
  gamecode: PropTypes.number,
  socket: PropTypes.object
}
