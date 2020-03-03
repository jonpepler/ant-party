import React, { useState } from 'react'
import '@csstools/normalize.css';
import './App.scss'

import Game from './Game.js'
import APITest from './APITest.js'

function App () {
  const [gameStarted, startGame] = useState(false)
  return (
    <div className='app'>
      <main className='main-content'>
        {gameStarted ?
          (<Game/>)
          : 
          (
            <React.Fragment>
              <header className='app-header'>
                <h1>Ant Party</h1>
              </header>
              <nav>
                <button onClick={startGame}>
                  Start a Game
                </button>
              </nav>
            </React.Fragment>
          )}
          
      </main>
      <footer>
        <APITest />
      </footer>
    </div>
  )
}

export default App
