type HeaderProps = {
  difficulty: number,
  setDifficulty: (difficulty: number) => void
  mines?: number,
  flags?: number,
  time?: number,
  onReset?: () => void,
  // numeric game status: 0 = playing, 1 = won, 2 = lost
  gameStatus?: 0 | 1 | 2
}

function Header({difficulty, setDifficulty, mines, flags, time, onReset, gameStatus}: HeaderProps) {
  const displayTime = String(Math.max(0, Math.min(999, time ?? 0))).padStart(3, '0')

  return (
    <div className="header">
      <h1 className="title">MINESWEEPER</h1>

      <div className="settings">
        <p>&#62; DIFFICULTY:</p>
        <button className={difficulty === 0 ? 'active' : ''} onClick={() => setDifficulty(0)}>&#91;EASY&#93;</button>
        <button className={difficulty === 1 ? 'active' : ''} onClick={() => setDifficulty(1)}>&#91;MEDIUM&#93;</button>
        <button className={difficulty === 2 ? 'active' : ''} onClick={() => setDifficulty(2)}>&#91;HARD&#93;</button>
      </div>

      <div className="status">
        <p>MINES: <span id="mineNum">{mines}</span></p>
        <p>FLAGS: <span id="flagNum">{flags}</span></p>
        <button onClick={() => onReset && onReset()}><span className="icon">⟲</span><span className="text">&#91;RESET&#93;</span></button>
        <p>TIME: <span id="gameTime">{displayTime}</span></p>
      </div>

      <div className={gameStatus === 1 ? 'win-box show' : 'win-box'}>
        <p>&#62;&#62; MISSION ACCOMPLISHED! ALL MINES CLEARED &#60;&#60;</p>
      </div>
      <div className={gameStatus === 2 ? 'lose-box show' : 'lose-box'}>
        <p>&#62;&#62; DETONATION DETECTED! MISSION FAILED &#60;&#60;</p>
      </div>
    </div>
  )
}
export default Header