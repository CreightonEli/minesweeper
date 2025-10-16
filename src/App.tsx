import Header from './components/Header'
import Board from './components/Board'
import Footer from './components/Footer'
import './App.css'

import { useState, useEffect } from "react"

function App() {
  const [difficulty, setDifficulty] = useState<number>(0)
  const [mines, setMines] = useState<number>(10)
  const [flags, setFlags] = useState<number>(0)
  const [time, setTime] = useState<number>(0)

  // game status: 0 = playing, 1 = won, 2 = lost
  const [gameStatus, setGameStatus] = useState<0 | 1 | 2>(0)

  // incrementing this will remount Board to fully reset internal state
  const [resetKey, setResetKey] = useState<number>(0)

  useEffect(() => {
    const mineCounts = [10, 40, 99]
    setMines(mineCounts[difficulty])
    setTime(0)
    setFlags(0) // reset flags when difficulty changes
    setGameStatus(0)
  }, [difficulty])

  const handleReset = () => {
    setFlags(0)
    setTime(0)
    setGameStatus(0)
    setResetKey(k => k + 1)
  }

  return (
    <div className='app'>
      <Header 
        difficulty={difficulty} 
        setDifficulty={setDifficulty}
        mines={mines} 
        flags={flags}
        time={time}
        onReset={handleReset}
        gameStatus={gameStatus}
      />
      <Board 
        key={resetKey}
        difficulty={difficulty}
        mines={mines}
        setFlags={setFlags}
        setTime={setTime}
        setGameStatus={setGameStatus}
        gameStatus={gameStatus}
      />
      <Footer />
    </div>
  )
}

export default App
