import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'

import ErrorMessage from './ErrorMessage'

export default class GameSetup extends React.Component {
  constructor () {
    super()

    this.setSocketFunctions = this.setSocketFunctions.bind(this)
    this.connectTracker = this.connectTracker.bind(this)
    this.getGamecode = this.getGamecode.bind(this)
    this.renderPlayers = this.renderPlayers.bind(this)

    this.state = {
      gamecode: 'loading...',
      started: false,
      players: []
    }

    this.getGamecode()
    this.socket = io()
    this.setSocketFunctions()
  }

  setSocketFunctions () {
    this.socket.on('joinGameTrackerRoom', data => {
      if (data.message === 'joined') console.log('socket: tracking game')
    })
    this.socket.on('tracker:playerJoined', data => {
      const { playerID, playerName } = data
      console.log(`socket player joined: ${playerID}`)
      this.setState(s => {
        return { players: s.players.concat({
          id: playerID,
          name: playerName
        })}
      })
    })

    this.socket.on('tracker:playerLeft', data => {
      const { playerID } = data
      console.log(`socket player left: ${playerID}`)
      this.setState(s => {
        return { players: s.players.filter(player => player.id !== playerID) }
      })
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

  renderPlayers () {
    return (
      <div className="player-list">
        {this.state.players.map(player => (
          <div className="player" key={player.id}>
            {player.name}
          </div>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div className="game-setup">
        {!this.state.started ?
          (
            <React.Fragment>
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
              <React.Fragment>
                {this.renderPlayers()}
              </React.Fragment>
            </React.Fragment>
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
