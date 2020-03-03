import React from 'react'
import axios from 'axios'

import ErrorMessage from './ErrorMessage'

export default class Game extends React.Component {
  constructor () {
    super()

    this.getRoomCode = this.getRoomCode.bind(this)

    this.state = {
      roomCode: 'loading...',
      started: false
    }

    this.getRoomCode()
  }

  getRoomCode () {
    axios.get('/room/create')
      .then(data => {
        const roomCode = data.roomCode
        this.setState({ roomCode })
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
                <p className="inline">When prompted, enter room code </p>
                <div className="room-code room-code--inline">
                  {this.state.roomCode}
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
