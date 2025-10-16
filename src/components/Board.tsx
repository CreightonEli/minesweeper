import { useEffect, useState, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import Cell from "./Cell"

type CellState = {
  isMine: boolean
  adjacentMines: number
  isRevealed: boolean
  isFlagged: boolean
}

type BoardProps = {
  difficulty?: number
  mines?: number
  flags?: number
  setFlags?: Dispatch<SetStateAction<number>>
  setTime?: Dispatch<SetStateAction<number>>
  // numeric game status setter
  setGameStatus?: Dispatch<SetStateAction<0 | 1 | 2>>
  gameStatus?: 0 | 1 | 2
}

const sizeMap = [
  { rows: 8, cols: 10 },   // Easy (80 cells / 10 mines)
  { rows: 14, cols: 18 },  // Medium (252 cells / 40 mines)
  { rows: 16, cols: 30 }   // Hard (480 cells / 99 mines)
]

function Board({
  difficulty = 0,
  mines = 10,
  setFlags,
  setTime,
  setGameStatus,
  gameStatus = 0, // default to playing
}: BoardProps) {
  const { rows, cols } = sizeMap[difficulty]

  // Create an empty grid (no mines, zero adjacents)
  const createEmptyGrid = (rCount: number, cCount: number): CellState[][] =>
    Array.from({ length: rCount }, () =>
      Array.from({ length: cCount }, () => ({
        isMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
      }))
    )

  // initialize grid for current difficulty
  const [grid, setGrid] = useState<CellState[][]>(() => createEmptyGrid(rows, cols))
  const [firstClick, setFirstClick] = useState(true)
  const timerRef = useRef<number | null>(null)

  // Place mines excluding a set of forbidden positions (1D indices)
  const placeMines = (baseGrid: CellState[][], mineCount: number, forbidden: Set<number>) => {
    const rCount = baseGrid.length
    const cCount = baseGrid[0].length
    const total = rCount * cCount
    const available = total - forbidden.size
    const actualMines = Math.min(mineCount, Math.max(0, available))
    const minePositions = new Set<number>()
    while (minePositions.size < actualMines) {
      const pos = Math.floor(Math.random() * total)
      if (forbidden.has(pos)) continue
      minePositions.add(pos)
    }
    minePositions.forEach(pos => {
      const r = Math.floor(pos / cCount)
      const c = pos % cCount
      baseGrid[r][c].isMine = true
    })
    // compute adjacent counts
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ]
    for (let r = 0; r < rCount; r++) {
      for (let c = 0; c < cCount; c++) {
        if (baseGrid[r][c].isMine) continue
        let count = 0
        directions.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < rCount && nc >= 0 && nc < cCount && baseGrid[nr][nc].isMine) {
            count++
          }
        })
        baseGrid[r][c].adjacentMines = count
      }
    }
  }

  useEffect(() => {
    // Initialize empty grid; actual mines are placed after the first click
    setGrid(createEmptyGrid(rows, cols))
    setFirstClick(true)

    // clear any running timer when board resets (difficulty change / new board)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (setTime) setTime(0)
    if (setGameStatus) setGameStatus(0)
  }, [mines, rows, cols, setTime, setGameStatus])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // Flood reveal BFS starting from (row, col)
  const floodReveal = (newGrid: CellState[][], startR: number, startC: number) => {
    if (newGrid.length === 0) return
    const rCount = newGrid.length
    const cCount = newGrid[0].length
    const visited = Array.from({ length: rCount }, () => Array(cCount).fill(false))
    const queue: [number, number][] = [[startR, startC]]
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ]

    while (queue.length) {
      const [r, c] = queue.shift()!
      if (r < 0 || r >= rCount || c < 0 || c >= cCount) continue
      if (visited[r][c]) continue
      visited[r][c] = true
      if (newGrid[r][c].isFlagged) continue
      newGrid[r][c].isRevealed = true
      if (newGrid[r][c].adjacentMines === 0 && !newGrid[r][c].isMine) {
        directions.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < rCount && nc >= 0 && nc < cCount && !visited[nr][nc]) {
            queue.push([nr, nc])
          }
        })
      }
    }
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const checkWin = (currentGrid: CellState[][]) => {
    if (!currentGrid || currentGrid.length === 0) return false
    for (let r = 0; r < currentGrid.length; r++) {
      for (let c = 0; c < currentGrid[0].length; c++) {
        if (!currentGrid[r][c].isMine && !currentGrid[r][c].isRevealed) return false
      }
    }
    return true
  }

  const handleLeftClick = (row: number, col: number) => {
    // Prevent interaction when game is not playing
    if (gameStatus !== 0) return

    let workingGrid = grid.map(r => r.map(c => ({ ...c })))
    if (firstClick) {
      // build forbidden set: clicked cell + its 8 neighbors
      const forbidden = new Set<number>()
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr, nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            forbidden.add(nr * cols + nc)
          }
        }
      }
      workingGrid = createEmptyGrid(rows, cols)
      placeMines(workingGrid, mines, forbidden)
      setFirstClick(false)

      // start timer (if provided) on first click
      if (setTime && timerRef.current == null) {
        setTime(0)
        timerRef.current = window.setInterval(() => {
          setTime(prev => {
            if (prev >= 999) {
              stopTimer()
              return 999
            }
            return prev + 1
          })
        }, 1000)
      }
    }

    if (workingGrid[row][col].isRevealed || workingGrid[row][col].isFlagged) {
      setGrid(workingGrid)
      return
    }

    // If clicked a mine -> game over
    if (workingGrid[row][col].isMine) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (workingGrid[r][c].isMine) workingGrid[r][c].isRevealed = true
          // optionally reveal incorrect flags
          if (workingGrid[r][c].isFlagged && !workingGrid[r][c].isMine) {
            workingGrid[r][c].isRevealed = true
          }
        }
      }
      stopTimer()
      if (setGameStatus) setGameStatus(2) // 2 = lost
      setGrid(workingGrid)
      return
    }

    // normal reveal
    workingGrid[row][col].isRevealed = true
    if (workingGrid[row][col].adjacentMines === 0 && !workingGrid[row][col].isMine) {
      floodReveal(workingGrid, row, col)
    }

    // check win
    if (checkWin(workingGrid)) {
      // reveal all mines (optional) and stop timer
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (workingGrid[r][c].isMine) workingGrid[r][c].isRevealed = true
        }
      }
      stopTimer()
      if (setGameStatus) setGameStatus(1) // 1 = won
    }

    setGrid(workingGrid)
  }

  const handleRightClick = (row: number, col: number) => {
    if (gameStatus !== 0) return
    if (firstClick) return // cannot flag before first click
    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    if (newGrid[row][col].isRevealed) return
    const willBeFlagged = !newGrid[row][col].isFlagged
    newGrid[row][col].isFlagged = willBeFlagged
    // update flags count if setter provided (clamp to >= 0)
    if (setFlags) {
      setFlags(prev => Math.max(0, prev + (willBeFlagged ? 1 : -1)))
    }
    setGrid(newGrid)
    // optional: check win by revealed cells
    if (checkWin(newGrid)) {
      stopTimer()
      if (setGameStatus) setGameStatus(1)
    }
  }

  return (
    <div className={`board difficulty-${difficulty}`}>
      {grid.map((row, rIdx) => (
        <div key={rIdx} className="board-row">
          {row.map((cell, cIdx) => (
            <Cell
              key={cIdx}
              row={rIdx}
              col={cIdx}
              isMine={cell.isMine}
              adjacentMines={cell.adjacentMines}
              isRevealed={cell.isRevealed}
              isFlagged={cell.isFlagged}
              onLeftClick={handleLeftClick}
              onRightClick={handleRightClick}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
export default Board