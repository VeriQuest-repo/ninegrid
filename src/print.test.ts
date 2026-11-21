import { describe, expect, it } from 'vitest'
import { CELL_COUNT, CENTER_CELL, applyTextEdit, createInitialCells } from './board'
import {
  PRINT_SMALL_TEXT_LENGTH,
  PRINT_TINY_TEXT_LENGTH,
  buildPrintBlocks,
  getPrintCellKind,
  getPrintTextSize,
} from './print'

// 1번 블록(왼쪽 위)의 첫 칸, 중앙 블록 왼쪽 위 하위 목표 칸, 그 제목 칸
const FIRST_ACTION = 0
const FIRST_SUBGOAL = 30
const FIRST_TITLE = 10

describe('getPrintCellKind', () => {
  it('classifies every cell kind', () => {
    expect(getPrintCellKind(CENTER_CELL)).toBe('hub')
    expect(getPrintCellKind(FIRST_SUBGOAL)).toBe('subgoal')
    expect(getPrintCellKind(FIRST_TITLE)).toBe('title')
    expect(getPrintCellKind(FIRST_ACTION)).toBe('action')
  })

  it('finds 64 action cells, 8 titles, 8 subgoals and 1 hub', () => {
    const kinds = Array.from({ length: CELL_COUNT }, (_, index) => getPrintCellKind(index))
    expect(kinds.filter((kind) => kind === 'action')).toHaveLength(64)
    expect(kinds.filter((kind) => kind === 'title')).toHaveLength(8)
    expect(kinds.filter((kind) => kind === 'subgoal')).toHaveLength(8)
    expect(kinds.filter((kind) => kind === 'hub')).toHaveLength(1)
  })
})

describe('getPrintTextSize', () => {
  it('shrinks long text in steps', () => {
    expect(getPrintTextSize('a'.repeat(PRINT_SMALL_TEXT_LENGTH))).toBe('normal')
    expect(getPrintTextSize('a'.repeat(PRINT_SMALL_TEXT_LENGTH + 1))).toBe('small')
    expect(getPrintTextSize('a'.repeat(PRINT_TINY_TEXT_LENGTH + 1))).toBe('tiny')
  })

  it('counts CJK characters and emoji as one character each', () => {
    expect(getPrintTextSize('가'.repeat(PRINT_SMALL_TEXT_LENGTH))).toBe('normal')
    expect(getPrintTextSize('😀'.repeat(PRINT_SMALL_TEXT_LENGTH))).toBe('normal')
  })

  it('ignores surrounding whitespace', () => {
    expect(getPrintTextSize(`  ${'a'.repeat(PRINT_SMALL_TEXT_LENGTH)}  `)).toBe('normal')
  })
})

describe('buildPrintBlocks', () => {
  it('returns 9 blocks of 9 cells covering every cell once, in screen order', () => {
    const blocks = buildPrintBlocks(createInitialCells(), 'current')
    expect(blocks).toHaveLength(9)
    expect(blocks.every((block) => block.length === 9)).toBe(true)

    const indexes = blocks.flat().map((cell) => cell.index)
    expect(new Set(indexes).size).toBe(CELL_COUNT)
    // 1번 블록 첫 줄은 0, 1, 2번 칸, 5번 블록(가운데)의 가운데 칸은 중심 목표
    expect(blocks[0].slice(0, 3).map((cell) => cell.index)).toEqual([0, 1, 2])
    expect(blocks[4][4].index).toBe(CENTER_CELL)
  })

  it('keeps text and done state in current mode', () => {
    let cells = applyTextEdit(createInitialCells(), FIRST_ACTION, '  매일 걷기  ')
    cells = cells.map((cell, index) => (index === FIRST_ACTION ? { ...cell, done: true } : cell))
    cells = applyTextEdit(cells, FIRST_SUBGOAL, '건강')

    const printed = buildPrintBlocks(cells, 'current').flat()
    const byIndex = (index: number) => printed.find((cell) => cell.index === index)!

    expect(byIndex(FIRST_ACTION)).toMatchObject({ text: '매일 걷기', check: 'done' })
    expect(byIndex(FIRST_SUBGOAL)).toMatchObject({ text: '건강', check: null })
    // 중앙 블록의 하위 목표가 바깥 블록 제목에도 그대로 인쇄된다.
    expect(byIndex(FIRST_TITLE)).toMatchObject({ text: '건강', check: null })
  })

  it('draws an empty box on every action cell that is not done', () => {
    const printed = buildPrintBlocks(createInitialCells(), 'current').flat()
    const actions = printed.filter((cell) => cell.kind === 'action')
    expect(actions.every((cell) => cell.check === 'open')).toBe(true)
  })

  it('never prints a check on an empty cell, even if stored as done', () => {
    const cells = createInitialCells().map((cell, index) =>
      index === FIRST_ACTION ? { ...cell, done: true } : cell,
    )
    const printed = buildPrintBlocks(cells, 'current').flat()
    expect(printed.find((cell) => cell.index === FIRST_ACTION)?.check).toBe('open')
  })

  it('clears all text and checks in blank mode', () => {
    let cells = applyTextEdit(createInitialCells(), FIRST_ACTION, '매일 걷기')
    cells = cells.map((cell, index) => (index === FIRST_ACTION ? { ...cell, done: true } : cell))
    cells = applyTextEdit(cells, CENTER_CELL, '건강한 한 해')

    const printed = buildPrintBlocks(cells, 'blank').flat()
    expect(printed.every((cell) => cell.text === '')).toBe(true)
    expect(printed.filter((cell) => cell.kind === 'action').every((cell) => cell.check === 'open')).toBe(true)
  })
})
