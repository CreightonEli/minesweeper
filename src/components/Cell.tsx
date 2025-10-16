type CellProps = {
    // Define any props needed for the Cell component here
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
    const handleClick = () => {
        if (!isRevealed && !isFlagged) {
            onLeftClick(row, col)
        }
    }

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isRevealed) onRightClick(row, col)
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