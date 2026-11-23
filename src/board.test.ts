import { describe, expect, it } from 'vitest'
import {
  CELL_COUNT,
  CENTER_CELL,
  applyTextEdit,
  createInitialCells,
  getProgress,
  getSyncTarget,
  isDetailCell,
  isPersistedState,
  isSyncedTitleCell,
  moveCell,
  normalizeCells,
  parseBackup,
  toggleCellDone,
  type BoardCell,
} from './board'

// 칸 인덱스 = 행 * 9 + 열 (0부터)
const cellAt = (row: number, column: number) => row * 9 + column

// 중앙 블록의 하위 목표 8칸과, 각각이 연동되는 바깥 블록 제목 칸
const SUBGOAL_TO_TITLE: Array<[number, number]> = [
  [cellAt(3, 3), cellAt(1, 1)],
  [cellAt(3, 4), cellAt(1, 4)],
  [cellAt(3, 5), cellAt(1, 7)],
  [cellAt(4, 3), cellAt(4, 1)],
  [cellAt(4, 5), cellAt(4, 7)],
  [cellAt(5, 3), cellAt(7, 1)],
  [cellAt(5, 4), cellAt(7, 4)],
  [cellAt(5, 5), cellAt(7, 7)],
]

// 블록 01(왼쪽 위)의 실천 칸 하나
const ACTION_CELL = cellAt(0, 0)

function withCells(entries: Record<number, Partial<BoardCell>>) {
  const cells = createInitialCells()
  for (const [index, cell] of Object.entries(entries)) {
    cells[Number(index)] = { ...cells[Number(index)], ...cell }
  }
  return cells
}

describe('칸 종류', () => {
  it('실천 칸은 64개, 연동 제목 칸은 8개다', () => {
    const indexes = Array.from({ length: CELL_COUNT }, (_, index) => index)
    expect(indexes.filter(isDetailCell)).toHaveLength(64)
    expect(indexes.filter(isSyncedTitleCell)).toHaveLength(8)
  })

  it('중앙 블록과 바깥 블록 제목 칸은 실천 칸이 아니다', () => {
    expect(isDetailCell(CENTER_CELL)).toBe(false)
    for (const [subgoal, title] of SUBGOAL_TO_TITLE) {
      expect(isDetailCell(subgoal)).toBe(false)
      expect(isDetailCell(title)).toBe(false)
    }
  })
})

describe('중앙 목표 → 바깥 블록 제목 연동', () => {
  it('중앙 블록의 하위 목표 8칸은 각 바깥 블록 제목 칸에 연결된다', () => {
    for (const [subgoal, title] of SUBGOAL_TO_TITLE) {
      expect(getSyncTarget(subgoal)).toBe(title)
    }
  })

  it('가운데 핵심 목표와 바깥 블록 칸은 연동 대상이 없다', () => {
    expect(getSyncTarget(CENTER_CELL)).toBeNull()
    expect(getSyncTarget(ACTION_CELL)).toBeNull()
    expect(getSyncTarget(cellAt(1, 1))).toBeNull()
  })

  it('하위 목표를 수정하면 바깥 블록 제목도 같이 바뀐다', () => {
    const [subgoal, title] = SUBGOAL_TO_TITLE[0]
    const next = applyTextEdit(createInitialCells(), subgoal, '건강')
    expect(next[subgoal].text).toBe('건강')
    expect(next[title].text).toBe('건강')
  })

  it('실천 칸을 수정하면 다른 칸은 바뀌지 않는다', () => {
    const before = createInitialCells()
    const next = applyTextEdit(before, ACTION_CELL, '매일 걷기')
    expect(next[ACTION_CELL].text).toBe('매일 걷기')
    expect(next.filter((cell) => cell.text !== '')).toHaveLength(1)
    // 원본 보드는 바뀌지 않는다
    expect(before[ACTION_CELL].text).toBe('')
  })

  it('불러온 보드의 어긋난 제목 칸을 하위 목표 기준으로 다시 맞춘다', () => {
    const [subgoal, title] = SUBGOAL_TO_TITLE[3]
    const cells = withCells({
      [subgoal]: { text: '공부' },
      [title]: { text: '예전 제목' },
    })
    expect(normalizeCells(cells)[title].text).toBe('공부')
  })
})

describe('빈 칸 체크 규칙', () => {
  it('내용이 있는 실천 칸은 체크하고 해제할 수 있다', () => {
    const cells = withCells({ [ACTION_CELL]: { text: '매일 걷기' } })
    const checked = toggleCellDone(cells, ACTION_CELL)
    expect(checked?.[ACTION_CELL].done).toBe(true)
    expect(toggleCellDone(checked!, ACTION_CELL)?.[ACTION_CELL].done).toBe(false)
  })

  it('빈 실천 칸과 공백만 있는 칸은 체크할 수 없다', () => {
    expect(toggleCellDone(createInitialCells(), ACTION_CELL)).toBeNull()
    const blank = withCells({ [ACTION_CELL]: { text: '   ' } })
    expect(toggleCellDone(blank, ACTION_CELL)).toBeNull()
  })

  it('실천 칸이 아니면 체크할 수 없다', () => {
    const [subgoal] = SUBGOAL_TO_TITLE[0]
    const cells = withCells({ [subgoal]: { text: '건강' }, [CENTER_CELL]: { text: '목표' } })
    expect(toggleCellDone(cells, subgoal)).toBeNull()
    expect(toggleCellDone(cells, CENTER_CELL)).toBeNull()
  })

  it('체크된 칸의 내용을 모두 지우면 체크도 해제된다', () => {
    const cells = withCells({ [ACTION_CELL]: { text: '매일 걷기', done: true } })
    expect(applyTextEdit(cells, ACTION_CELL, '')[ACTION_CELL].done).toBe(false)
    expect(applyTextEdit(cells, ACTION_CELL, '  ')[ACTION_CELL].done).toBe(false)
    expect(applyTextEdit(cells, ACTION_CELL, '매일 뛰기')[ACTION_CELL].done).toBe(true)
  })

  it('이전 버전에 저장된 "빈 칸인데 체크됨" 상태를 불러올 때 해제한다', () => {
    const cells = withCells({ [ACTION_CELL]: { text: '', done: true } })
    expect(normalizeCells(cells)[ACTION_CELL].done).toBe(false)
  })
})

describe('실천 칸 이동 (#13)', () => {
  const from = cellAt(0, 0) // 1번 블록, 실천 1
  const emptyTarget = cellAt(0, 2) // 1번 블록, 실천 3
  const otherBlock = cellAt(8, 8) // 9번 블록, 실천 8

  function boardWith(entries: Array<[number, BoardCell]>) {
    const cells = createInitialCells()
    entries.forEach(([index, cell]) => {
      cells[index] = cell
    })
    return cells
  }

  const texts = (cells: BoardCell[]) =>
    cells.map((cell) => cell.text).filter(Boolean).sort()

  it('빈 칸으로 옮기면 텍스트와 체크가 함께 가고 원래 칸은 빈다', () => {
    const cells = boardWith([[from, { text: '스트레칭', done: true }]])
    const next = moveCell(cells, from, emptyTarget)

    expect(next?.[emptyTarget]).toEqual({ text: '스트레칭', done: true })
    expect(next?.[from]).toEqual({ text: '', done: false })
  })

  it('내용이 있는 칸으로 옮기면 두 칸이 자리를 바꾼다 (다른 블록 포함)', () => {
    const cells = boardWith([
      [from, { text: '스트레칭', done: true }],
      [otherBlock, { text: '영어 단어', done: false }],
    ])
    const next = moveCell(cells, from, otherBlock)

    expect(next?.[otherBlock]).toEqual({ text: '스트레칭', done: true })
    expect(next?.[from]).toEqual({ text: '영어 단어', done: false })
  })

  it('옮겨도 칸 내용이 사라지거나 겹치지 않고, 원래 보드는 바꾸지 않는다', () => {
    const cells = boardWith([
      [from, { text: 'A', done: true }],
      [emptyTarget, { text: 'B', done: false }],
      [otherBlock, { text: 'C', done: true }],
    ])
    const before = structuredClone(cells)
    const next = moveCell(cells, from, otherBlock)!

    expect(texts(next)).toEqual(texts(cells))
    expect(getProgress(next)).toEqual(getProgress(cells))
    expect(cells).toEqual(before)
  })

  it('다시 옮기면 원래대로 돌아온다', () => {
    const cells = boardWith([
      [from, { text: 'A', done: true }],
      [otherBlock, { text: 'C', done: false }],
    ])
    expect(moveCell(moveCell(cells, from, otherBlock)!, otherBlock, from)).toEqual(cells)
  })

  it('중심 목표·세부 목표·연동 제목 칸은 옮길 수 없고, 그 칸으로 옮길 수도 없다', () => {
    const cells = boardWith([[from, { text: 'A', done: false }]])
    const [subgoal, title] = SUBGOAL_TO_TITLE[0]

    expect(moveCell(cells, from, title)).toBeNull()
    expect(moveCell(cells, title, from)).toBeNull()
    expect(moveCell(cells, from, subgoal)).toBeNull()
    expect(moveCell(cells, CENTER_CELL, from)).toBeNull()
  })

  it('같은 칸으로는 옮기지 않는다', () => {
    const cells = boardWith([[from, { text: 'A', done: false }]])
    expect(moveCell(cells, from, from)).toBeNull()
  })
})

describe('달성률 계산', () => {
  it('빈 보드는 0%다', () => {
    expect(getProgress(createInitialCells())).toEqual({
      writtenCount: 0,
      completedCount: 0,
      progress: 0,
    })
  })

  it('작성된 실천 칸 중 완료한 칸의 비율을 반올림한다', () => {
    const cells = withCells({
      [cellAt(0, 0)]: { text: 'a', done: true },
      [cellAt(0, 1)]: { text: 'b' },
      [cellAt(0, 2)]: { text: 'c' },
    })
    expect(getProgress(cells)).toEqual({
      writtenCount: 3,
      completedCount: 1,
      progress: 33,
    })
  })

  it('중앙 블록과 제목 칸, 빈 칸은 계산에서 빠진다', () => {
    const [subgoal, title] = SUBGOAL_TO_TITLE[0]
    const cells = withCells({
      [CENTER_CELL]: { text: '목표', done: true },
      [subgoal]: { text: '건강', done: true },
      [title]: { text: '건강', done: true },
      [cellAt(0, 1)]: { text: '', done: true },
      [ACTION_CELL]: { text: '매일 걷기', done: true },
    })
    expect(getProgress(cells)).toEqual({
      writtenCount: 1,
      completedCount: 1,
      progress: 100,
    })
  })
})

describe('백업 JSON 복원', () => {
  const validBackup = () => ({
    format: 'ninegrid-backup',
    version: 1,
    exportedAt: '2026-11-20T00:00:00.000Z',
    cells: createInitialCells(),
    theme: 'dark',
    language: 'ja',
  })

  it('올바른 백업 파일을 읽는다', () => {
    const backup = parseBackup(validBackup())
    expect(backup).not.toBeNull()
    expect(backup?.theme).toBe('dark')
    expect(backup?.language).toBe('ja')
    expect(backup?.cells).toHaveLength(CELL_COUNT)
  })

  it('언어가 없는 예전 백업도 읽는다', () => {
    const { language: _language, ...withoutLanguage } = validBackup()
    const backup = parseBackup(withoutLanguage)
    expect(backup).not.toBeNull()
    expect(backup?.language).toBeUndefined()
  })

  it('복원할 때 연동 제목과 빈 칸 체크를 정리한다', () => {
    const [subgoal, title] = SUBGOAL_TO_TITLE[0]
    const cells = withCells({
      [subgoal]: { text: '건강' },
      [ACTION_CELL]: { text: '', done: true },
    })
    const backup = parseBackup({ ...validBackup(), cells })
    expect(backup?.cells[title].text).toBe('건강')
    expect(backup?.cells[ACTION_CELL].done).toBe(false)
  })

  it.each([
    ['객체가 아님', null],
    ['배열', []],
    ['format이 다름', { ...validBackup(), format: 'other' }],
    ['version이 다름', { ...validBackup(), version: 2 }],
    ['cells 누락', { ...validBackup(), cells: undefined }],
    ['칸 개수가 다름', { ...validBackup(), cells: createInitialCells().slice(1) }],
    [
      '칸 형식이 다름',
      { ...validBackup(), cells: createInitialCells().map(() => ({ text: 1, done: false })) },
    ],
    ['theme가 잘못됨', { ...validBackup(), theme: 'blue' }],
    ['language가 잘못됨', { ...validBackup(), language: 'fr' }],
  ])('잘못된 파일은 거부한다: %s', (_label, value) => {
    expect(parseBackup(value)).toBeNull()
  })
})

describe('localStorage 저장 데이터 검증', () => {
  it('저장된 보드 형식을 확인한다', () => {
    const state = { cells: createInitialCells(), theme: 'light', language: 'ko' }
    expect(isPersistedState(state)).toBe(true)
    expect(isPersistedState({ cells: state.cells, theme: 'light' })).toBe(true)
    expect(isPersistedState({ ...state, theme: 'blue' })).toBe(false)
    expect(isPersistedState({ ...state, language: 'fr' })).toBe(false)
    expect(isPersistedState({ ...state, cells: [] })).toBe(false)
  })
})
