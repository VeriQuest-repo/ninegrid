import { describe, expect, it } from 'vitest'
import {
  getBlockIndex,
  getCellIndex,
  getCellNumber,
  getLocalIndex,
  getNeighborCell,
  shouldLeaveCell,
} from './keyboard'
import { CENTER_CELL } from './board'

describe('cell position', () => {
  it('maps board indexes to blocks and local positions', () => {
    expect(getBlockIndex(0)).toBe(0)
    expect(getBlockIndex(8)).toBe(2)
    expect(getBlockIndex(CENTER_CELL)).toBe(4)
    expect(getBlockIndex(80)).toBe(8)
    expect(getLocalIndex(CENTER_CELL)).toBe(4)
    expect(getLocalIndex(10)).toBe(4)
    expect(getLocalIndex(20)).toBe(8)
  })

  it('round-trips block and local index', () => {
    for (let index = 0; index < 81; index += 1) {
      expect(getCellIndex(getBlockIndex(index), getLocalIndex(index))).toBe(index)
    }
  })

  it('numbers the 8 cells around each block center from 1 to 8', () => {
    const numbers = Array.from({ length: 9 }, (_, local) =>
      getCellNumber(getCellIndex(2, local)),
    )
    expect(numbers).toEqual([1, 2, 3, 4, null, 5, 6, 7, 8])
  })
})

describe('getNeighborCell', () => {
  it('moves across block borders on the full board', () => {
    expect(getNeighborCell(2, 'ArrowRight')).toBe(3)
    expect(getNeighborCell(18, 'ArrowDown')).toBe(27)
    expect(getNeighborCell(CENTER_CELL, 'ArrowUp')).toBe(31)
  })

  it('stops at the board edges', () => {
    expect(getNeighborCell(0, 'ArrowUp')).toBeNull()
    expect(getNeighborCell(0, 'ArrowLeft')).toBeNull()
    expect(getNeighborCell(80, 'ArrowRight')).toBeNull()
    expect(getNeighborCell(80, 'ArrowDown')).toBeNull()
    expect(getNeighborCell(9, 'ArrowLeft')).toBeNull()
  })

  it('stays inside the selected block in focus mode', () => {
    expect(getNeighborCell(2, 'ArrowRight', 0)).toBeNull()
    expect(getNeighborCell(1, 'ArrowRight', 0)).toBe(2)
    expect(getNeighborCell(30, 'ArrowUp', 4)).toBeNull()
    expect(getNeighborCell(30, 'ArrowDown', 4)).toBe(39)
  })
})

describe('shouldLeaveCell', () => {
  it('leaves an empty cell in any direction', () => {
    expect(shouldLeaveCell('ArrowUp', 0, 0, 0)).toBe(true)
    expect(shouldLeaveCell('ArrowRight', 0, 0, 0)).toBe(true)
  })

  it('leaves only at the matching edge of the text', () => {
    expect(shouldLeaveCell('ArrowLeft', 0, 0, 5)).toBe(true)
    expect(shouldLeaveCell('ArrowRight', 0, 0, 5)).toBe(false)
    expect(shouldLeaveCell('ArrowDown', 5, 5, 5)).toBe(true)
    expect(shouldLeaveCell('ArrowUp', 5, 5, 5)).toBe(false)
  })

  it('keeps the caret in the cell while text is selected', () => {
    expect(shouldLeaveCell('ArrowRight', 0, 5, 5)).toBe(false)
  })
})
