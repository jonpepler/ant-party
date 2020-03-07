import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'

import ErrorMessage from './ErrorMessage'

export default class Game extends React.Component {
  constructor () {
    super()

    this.setSocketFunctions = this.setSocketFunctions.bind(this)
    this.connectTracker = this.connectTracker.bind(this)
    this.getGamecode = this.getGamecode.bind(this)

    this.state = {
      gamecode: 'loading...',
      started: false
    }

    this.getGamecode()
    this.socket = io()
    this.setSocketFunctions()
  }

  setSocketFunctions () {
    this.socket.on('joinGameTrackerRoom', (data) => {
      if (data.message === 'joined') console.log('socket: tracking game')
    })
  }

  connectTracker () {
    const { gamecode } = this.state
    this.socket.emit('joinGameTrackerRoom', { gamecode })
  }

  getGamecode () {
    axios.post('/api/v1/game/create')
      .then(response => {
        const { gamecode } = response.data
        // set gamecode and then use it to connect tracker
        this.setState({ gamecode }, this.connectTracker)
      })
      .catch(error => {
        this.setState({ error: error.message })
      })
  }

  render () {
    return (
      <div className="game">
        {!this.state.started ?
          (
            <div className="game-instructions">
              <p>To start: In your terminal, run <code>npx ant-party</code></p>
              <div>
                <p className="inline">When prompted, enter gamecode </p>
                <div className="room-code room-code--inline">
                  {this.state.gamecode}
                </div>
              </div>
              {this.state.error ? (<ErrorMessage message={this.state.error}/>) : undefined}
            </div>
          )
          :
          (
            <div>Game!</div>
          )
        }
      </div>
    )
  }
}
