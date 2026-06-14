import React, { useState } from 'react'
import '@csstools/normalize.css'
import './App.scss'

import GameSetup from './components/GameSetup'

function App () {
  const [gameStarted, startGame] = useState(false)
  return (
    <div className='app'>
      <main className='main-content'>
        {gameStarted
          ? (<GameSetup />)
          : (
            <>
              <header className='app-header'>
                <h1>Ant Party</h1>
              </header>
              <nav>
                <button onClick={startGame}>
                  Start a Game
                </button>
              </nav>
            </>
          )}

      </main>
      <footer />
    </div>
  )
}

export default App
