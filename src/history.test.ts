import { describe, expect, it } from 'vitest'
import {
  CENTER_CELL,
  applyTextEdit,
  cellsEqual,
  createInitialCells,
  normalizeCells,
  toggleCellDone,
  type BoardCell,
} from './board'
import {
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  createHistory,
  dropUnchangedEntry,
  pushHistory,
  redoHistory,
  undoHistory,
  type History,
} from './history'

const cellAt = (row: number, column: number) => row * 9 + column

describe('history stack', () => {
  it('starts empty with nothing to undo or redo', () => {
    const history = createHistory<number>()
    expect(canUndo(history)).toBe(false)
    expect(canRedo(history)).toBe(false)
    expect(undoHistory(history, 0)).toBeNull()
    expect(redoHistory(history, 0)).toBeNull()
  })

  it('undoes to the previous state and redoes back', () => {
    // 상태 0 → 1 → 2
    let history = pushHistory(createHistory<number>(), 0)
    history = pushHistory(history, 1)
    let current = 2

    const undone = undoHistory(history, current)!
    expect(undone.value).toBe(1)
    history = undone.history
    current = undone.value

    const undoneAgain = undoHistory(history, current)!
    expect(undoneAgain.value).toBe(0)
    history = undoneAgain.history
    current = undoneAgain.value
    expect(canUndo(history)).toBe(false)
    expect(history.future).toEqual([2, 1])

    const redone = redoHistory(history, current)!
    expect(redone.value).toBe(1)
    const redoneAgain = redoHistory(redone.history, redone.value)!
    expect(redoneAgain.value).toBe(2)
    expect(canRedo(redoneAgain.history)).toBe(false)
    expect(redoneAgain.history.past).toEqual([0, 1])
  })

  it('clears redo entries when a new change is pushed', () => {
    let history = pushHistory(createHistory<number>(), 0)
    history = undoHistory(history, 1)!.history
    expect(canRedo(history)).toBe(true)

    history = pushHistory(history, 0)
    expect(canRedo(history)).toBe(false)
  })

  it(`keeps at most ${HISTORY_LIMIT} entries, dropping the oldest`, () => {
    let history = createHistory<number>()
    for (let value = 0; value < HISTORY_LIMIT + 10; value += 1) {
      history = pushHistory(history, value)
    }
    expect(history.past).toHaveLength(HISTORY_LIMIT)
    expect(history.past[0]).toBe(10)
    expect(history.past[HISTORY_LIMIT - 1]).toBe(HISTORY_LIMIT + 9)
  })

  it('accepts a custom limit', () => {
    let history = createHistory<number>()
    for (let value = 0; value < 5; value += 1) {
      history = pushHistory(history, value, 3)
    }
    expect(history.past).toEqual([2, 3, 4])
  })

  it('does not mutate the given history', () => {
    const history: History<number> = { past: [0], future: [5] }
    pushHistory(history, 1)
    undoHistory(history, 1)
    redoHistory(history, 1)
    expect(history).toEqual({ past: [0], future: [5] })
  })

  it('drops the last entry when nothing actually changed', () => {
    const history = pushHistory(createHistory<number>(), 3)
    const equal = (a: number, b: number) => a === b
    expect(dropUnchangedEntry(history, 3, equal).past).toEqual([])
    expect(dropUnchangedEntry(history, 4, equal)).toBe(history)
    expect(dropUnchangedEntry(createHistory<number>(), 4, equal).past).toEqual([])
  })
})

describe('board undo/redo', () => {
  it('restores the linked outer title together with a center sub-goal', () => {
    const subgoal = cellAt(3, 3)
    const title = cellAt(1, 1)
    const before = applyTextEdit(createInitialCells(), subgoal, '건강')
    const after = applyTextEdit(before, subgoal, '운동')
    expect(after[title].text).toBe('운동')

    const history = pushHistory(createHistory<BoardCell[]>(), before)
    const undone = undoHistory(history, after)!
    expect(undone.value[subgoal].text).toBe('건강')
    expect(undone.value[title].text).toBe('건강')
  })

  it('restores a check that was cleared by deleting the text, and clears it again on redo', () => {
    const action = cellAt(0, 0)
    const written = applyTextEdit(createInitialCells(), action, '매일 걷기')
    const checked = toggleCellDone(written, action)!
    const erased = applyTextEdit(checked, action, '')
    expect(erased[action].done).toBe(false)

    const history = pushHistory(createHistory<BoardCell[]>(), checked)
    const undone = undoHistory(history, erased)!
    const restored = normalizeCells(undone.value)
    expect(restored[action]).toEqual({ text: '매일 걷기', done: true })

    const redone = redoHistory(undone.history, restored)!
    const redoneCells = normalizeCells(redone.value)
    expect(redoneCells[action]).toEqual({ text: '', done: false })
  })

  it('never leaves an empty cell checked after normalizing a restored snapshot', () => {
    const action = cellAt(0, 0)
    const broken = createInitialCells()
    broken[action] = { text: '', done: true }
    const history = pushHistory(createHistory<BoardCell[]>(), broken)
    const undone = undoHistory(history, createInitialCells())!
    expect(normalizeCells(undone.value)[action].done).toBe(false)
  })

  it('can undo a full board reset', () => {
    const board = applyTextEdit(createInitialCells(), CENTER_CELL, '올해 목표')
    const history = pushHistory(createHistory<BoardCell[]>(), board)
    const undone = undoHistory(history, createInitialCells())!
    expect(cellsEqual(undone.value, board)).toBe(true)
  })
})

describe('cellsEqual', () => {
  it('compares text and done state', () => {
    const a = createInitialCells()
    const b = createInitialCells()
    expect(cellsEqual(a, b)).toBe(true)
    b[0] = { text: 'x', done: false }
    expect(cellsEqual(a, b)).toBe(false)
    expect(cellsEqual(a, a.slice(1))).toBe(false)
  })
})
