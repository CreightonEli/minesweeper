import React, { useEffect, useState } from 'react'

function Footer() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('soundEnabled')
      return v === null ? true : v === 'true'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('soundEnabled', soundEnabled ? 'true' : 'false')
    } catch {
      // ignore
    }
  }, [soundEnabled])

  const toggleSound = () => setSoundEnabled(s => !s)

  return (
    <div className="footer">
      {/* Footer content will go here */}
      <p>
        &#91;left click to reveal&#93; &#91;right click to flag&#93;
      </p>
      <button onClick={toggleSound} title={soundEnabled ? 'SFX on' : 'SFX off'} aria-pressed={soundEnabled}>
        {soundEnabled ? '🕪' : '🕨'}
      </button>
      ·
      <a href="https://creightoneli.github.io" target="_blank" rel="noreferrer">
        😁︎
      </a>
    </div>
  )
}
export default Footer
