import React from 'react'

import ErrorMessage from './ErrorMessage'
import Game from './Game'
import { createHostGame, generateGamecode } from '../../../host/hostGame.js'
import { createTrysteroTransport } from '../host/trysteroTransport'
import { createBrowserAntRunner } from '../host/browserAntRunner'

// This page IS the authoritative browser host. On mount it generates a
// gamecode, joins a WebRTC room as the host peer (via Trystero), and runs the
// simulation itself. Player peers (the CLI) connect over the gamecode; the
// player list and all map data come from the orchestrator's onUpdate snapshot.
export default class GameSetup extends React.Component {
  constructor (props) {
    super(props)

    this.renderPlayers = this.renderPlayers.bind(this)
    this.renderStartButton = this.renderStartButton.bind(this)
    this.handleClickStart = this.handleClickStart.bind(this)

    this.state = {
      gamecode: 'loading...',
      started: false,
      finished: false,
      players: [],
      mapData: null,
      error: undefined
    }

    this.host = null
  }

  componentDidMount () {
    try {
      const gamecode = generateGamecode()
      const transport = createTrysteroTransport(gamecode)
      const antRunner = createBrowserAntRunner()
      this.host = createHostGame({
        transport,
        antRunner,
        gamecode,
        onUpdate: snapshot => this.setState({
          gamecode: snapshot.gamecode,
          started: snapshot.started,
          finished: snapshot.finished,
          players: snapshot.players,
          mapData: snapshot.mapData
        })
      })
      // Show the generated gamecode immediately, before any peer joins.
      this.setState({ gamecode: this.host.gamecode })
    } catch (error) {
      this.setState({ error: error.message })
    }
  }

  componentWillUnmount () {
    if (this.host) this.host.stop()
  }

  handleClickStart () {
    if (this.host) this.host.start()
  }

  renderPlayers () {
    return (
      <div className='player-list'>
        {this.state.players.map(player => (
          <div className='player' key={player.id}>
            {player.name}
          </div>
        ))}
      </div>
    )
  }

  renderStartButton () {
    if (this.state.players.length > 0) {
      return (
        <div className='button-container fixed-bottom fixed-bottom--animated'>
          <button onClick={this.handleClickStart}>
            {`Start Game${this.state.players.length > 1 ? '' : ' (solo)'}`}
          </button>
        </div>
      )
    }
    return undefined
  }

  render () {
    return (
      <>
        {!this.state.started
          ? (
            <>
              <div className='game-setup'>
                <div className='game-instructions'>
                  <p>To start: In your terminal, run <code>npx ant-party</code></p>
                  <div>
                    <p className='inline'>When prompted, enter gamecode </p>
                    <div className='gamecode gamecode--inline'>
                      {this.state.gamecode}
                    </div>
                  </div>
                  {this.state.error ? (<ErrorMessage message={this.state.error} />) : undefined}
                </div>
                {this.renderPlayers()}
              </div>
              {this.renderStartButton()}
            </>
          )
          : (
            <Game mapData={this.state.mapData} />
          )}
      </>
    )
  }
}
