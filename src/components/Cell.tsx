import React from 'react';

type CellProps = {
    row: number
    col: number
    isMine: boolean
    adjacentMines: number
    isRevealed: boolean
    isFlagged: boolean
    onLeftClick: (row: number, col: number) => void
    onRightClick: (row: number, col: number) => void
}

function Cell({ row, col, isMine, adjacentMines, isRevealed, isFlagged, onLeftClick, onRightClick }: CellProps) {
    const isSoundEnabled = () => {
        try {
            const v = localStorage.getItem('soundEnabled')
            return v === null ? true : v === 'true'
        } catch {
            return true
        }
    }

    const playClickSound = () => {
        if (!isSoundEnabled()) return
        try {
            const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
            if (!AudioCtx) return
            const ctx = new AudioCtx()
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            o.type = 'sine'
            const baseFreq = 700
            // randomize pitch by ±10%
            const pitch = baseFreq * (1 + (Math.random() - 0.5) * 0.2)
            o.frequency.setValueAtTime(pitch, ctx.currentTime)
            o.connect(g)
            g.connect(ctx.destination)
            g.gain.setValueAtTime(0.001, ctx.currentTime)
            g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01)
            o.start()
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
            o.stop(ctx.currentTime + 0.13)
            setTimeout(() => ctx.close(), 200)
        } catch {
            // ignore audio errors
        }
    }

    const handleClick = () => {
        if (!isRevealed && !isFlagged) {
            playClickSound()
            onLeftClick(row, col)
        }
    }

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isRevealed) {
            playClickSound()
            onRightClick(row, col)
        }
    }

    const classes = ['cell']
    if (isRevealed) classes.push('revealed')
    if (isFlagged) classes.push('flagged')
    if (isRevealed && isMine) classes.push('mine')
    
    return (
        <div className={classes.join(' ')} onClick={handleClick} onContextMenu={handleRightClick}>
            {isRevealed ? (isMine ? '☠' : (adjacentMines > 0 ? adjacentMines : '')) : (isFlagged ? '⚐' : '')}
        </div>
    )
}

export default Cell