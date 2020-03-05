import React from 'react'
import axios from 'axios'

import ErrorMessage from './ErrorMessage'

export default class Game extends React.Component {
  constructor () {
    super()

    this.getGamecode = this.getGamecode.bind(this)

    this.state = {
      gamecode: 'loading...',
      started: false
    }

    this.getGamecode()
  }

  getGamecode () {
    axios.post('/api/v1/game/create')
      .then(response => {
        const { gamecode } = response.data
        this.setState({ gamecode })
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
