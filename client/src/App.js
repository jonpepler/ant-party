import React, { useState } from 'react'
import '@csstools/normalize.css'
import './App.scss'

import GameSetup from './components/GameSetup'
import APITest from './APITest.js'
import GameSketch from './components/p5/GameSketch'

function App () {
  const [gameStarted, startGame] = useState(false)
  return (
    <div className='app'>
      <main className='main-content'>
        {/* <GameSketch /> */}
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
      <footer>
        <APITest />
      </footer>
    </div>
  )
}

export default App
