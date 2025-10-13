import { useState } from "react"

function Header() {
  const [difficulty, setDifficulty] = useState(0)
  console.log(difficulty)

  return (
    <div className="header">
      {/* Header content will go here */}
      <h1 className="title">MINESWEEPER</h1>
      <div className="settings">
        <p>&#62; DIFFICULTY:</p>
        <button className="active" onClick={() => setDifficulty(0)}>&#91;EASY&#93;</button>
        <button onClick={() => setDifficulty(1)}>&#91;MEDIUM&#93;</button>
        <button onClick={() => setDifficulty(2)}>&#91;HARD&#93;</button>
      </div>
    </div>
  )
}
export default Header