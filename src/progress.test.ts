import { describe, expect, it } from 'vitest'
import { CENTER_CELL, createInitialCells, type BoardCell } from './board'
import {
  MAX_SNAPSHOTS,
  addDays,
  createSnapshot,
  getAllBlockProgress,
  getBlockProgress,
  getChartPoints,
  localDateKey,
  parseHistory,
  recordSnapshot,
  type ProgressSnapshot,
} from './progress'

const cellAt = (row: number, column: number) => row * 9 + column

function cellsWith(entries: Record<number, Partial<BoardCell>>) {
  const cells = createInitialCells()
  for (const [index, cell] of Object.entries(entries)) {
    cells[Number(index)] = { ...cells[Number(index)], ...cell }
  }
  return cells
}

// 블록 01: 실천 3칸(2칸 완료), 블록 09: 실천 1칸(미완료), 블록 01의 제목 칸은 실천이 아니다.
const board = cellsWith({
  [cellAt(0, 0)]: { text: '걷기', done: true },
  [cellAt(0, 1)]: { text: '계단', done: true },
  [cellAt(2, 2)]: { text: '스트레칭' },
  [cellAt(1, 1)]: { text: '운동' },
  [cellAt(8, 8)]: { text: '산책' },
  [CENTER_CELL]: { text: '건강' },
})

function snapshot(date: string, completedCount: number, writtenCount = 10): ProgressSnapshot {
  return {
    date,
    progress: Math.round((completedCount / writtenCount) * 100),
    completedCount,
    writtenCount,
    blockCompleted: [completedCount, 0, 0, 0, 0, 0, 0, 0],
  }
}

describe('블록별 달성률', () => {
  it('블록마다 작성한 실천 칸 중 완료한 칸을 센다 (제목 칸 제외)', () => {
    expect(getBlockProgress(board, 0)).toEqual({
      blockIndex: 0,
      writtenCount: 3,
      completedCount: 2,
      progress: 67,
    })
    expect(getBlockProgress(board, 8)).toMatchObject({ writtenCount: 1, completedCount: 0, progress: 0 })
  })

  it('작성한 실천이 없는 블록은 0%가 아니라 null이다', () => {
    expect(getBlockProgress(board, 1).progress).toBeNull()
  })

  it('가운데 블록을 뺀 8개 블록을 순서대로 돌려준다', () => {
    expect(getAllBlockProgress(board).map((block) => block.blockIndex)).toEqual([0, 1, 2, 3, 5, 6, 7, 8])
  })

  it('스냅샷에는 개수만 저장하고 칸 텍스트는 저장하지 않는다', () => {
    const value = createSnapshot(board, '2026-11-23')
    expect(value).toEqual({
      date: '2026-11-23',
      progress: 50,
      completedCount: 2,
      writtenCount: 4,
      blockCompleted: [2, 0, 0, 0, 0, 0, 0, 0],
    })
    expect(JSON.stringify(value)).not.toContain('걷기')
  })
})

describe('날짜', () => {
  it('UTC가 아닌 기기의 로컬 날짜를 쓴다', () => {
    expect(localDateKey(new Date(2026, 10, 24, 0, 30))).toBe('2026-11-24')
  })

  it('월과 해가 바뀌어도 하루씩 움직인다', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })
})

describe('진척 기록', () => {
  it('같은 날 여러 번 바꿔도 하루 1건, 마지막 값으로 덮어쓴다', () => {
    let history = recordSnapshot([], board, '2026-11-23')
    history = recordSnapshot(history, cellsWith({ [cellAt(0, 0)]: { text: '걷기', done: true } }), '2026-11-23')
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({ completedCount: 1, writtenCount: 1, progress: 100 })
  })

  it('날짜가 바뀌면 새 기록을 쌓는다', () => {
    const history = recordSnapshot([snapshot('2026-11-22', 1)], board, '2026-11-23')
    expect(history.map((item) => item.date)).toEqual(['2026-11-22', '2026-11-23'])
  })

  it('달성률이 내려가도 그대로 기록한다', () => {
    const history = recordSnapshot([snapshot('2026-11-22', 9)], board, '2026-11-23')
    expect(history.at(-1)?.progress).toBe(50)
  })

  it('값이 같으면 같은 배열을 돌려준다', () => {
    const history = recordSnapshot([], board, '2026-11-23')
    expect(recordSnapshot(history, board, '2026-11-23')).toBe(history)
  })

  it('아무것도 작성하지 않은 빈 보드의 첫 기록은 남기지 않는다', () => {
    expect(recordSnapshot([], createInitialCells(), '2026-11-23')).toEqual([])
  })

  it('보관 상한을 넘으면 오래된 기록부터 지운다', () => {
    const full = Array.from({ length: MAX_SNAPSHOTS }, (_, index) =>
      snapshot(addDays('2025-01-01', index), 1),
    )
    const next = recordSnapshot(full, board, '2026-11-23')
    expect(next).toHaveLength(MAX_SNAPSHOTS)
    expect(next[0].date).toBe('2025-01-02')
    expect(next.at(-1)?.date).toBe('2026-11-23')
  })

  it('저장된 기록을 읽을 때 깨진 항목은 건너뛰고 날짜순·하루 1건으로 정리한다', () => {
    const parsed = parseHistory([
      snapshot('2026-11-23', 3),
      { date: '2026-02-30', progress: 0, completedCount: 0, writtenCount: 0, blockCompleted: [0, 0, 0, 0, 0, 0, 0, 0] },
      { date: '2026-11-21', progress: 10 },
      'x',
      snapshot('2026-11-20', 1),
      snapshot('2026-11-23', 4),
    ])
    expect(parsed.map((item) => [item.date, item.completedCount])).toEqual([
      ['2026-11-20', 1],
      ['2026-11-23', 4],
    ])
  })

  it('기록이 없는 이전 데이터는 빈 기록으로 읽는다', () => {
    expect(parseHistory(undefined)).toEqual([])
    expect(parseHistory({})).toEqual([])
  })
})

describe('추이 그래프 데이터', () => {
  const current = snapshot('2026-11-23', 5)

  it('기록이 없는 날은 앞 기록 값을 이어 쓰고, 오늘은 지금 값을 쓴다', () => {
    const points = getChartPoints([snapshot('2026-11-20', 1), snapshot('2026-11-22', 3)], current, '4w')
    expect(points.map((point) => [point.date, point.completedCount])).toEqual([
      ['2026-11-20', 1],
      ['2026-11-21', 1],
      ['2026-11-22', 3],
      ['2026-11-23', 5],
    ])
  })

  it('최근 4주는 오늘을 포함한 28일만 보여 주고, 그 전 기록 값에서 시작한다', () => {
    const points = getChartPoints([snapshot('2026-09-01', 2)], current, '4w')
    expect(points).toHaveLength(28)
    expect(points[0]).toMatchObject({ date: '2026-10-27', completedCount: 2 })
  })

  it('전체는 첫 기록 날짜부터 보여 준다', () => {
    const points = getChartPoints([snapshot('2026-09-01', 2)], current, 'all')
    expect(points[0].date).toBe('2026-09-01')
    expect(points.at(-1)?.date).toBe('2026-11-23')
  })

  it('작성한 것도 기록도 없으면 빈 배열', () => {
    expect(getChartPoints([], createSnapshot(createInitialCells(), '2026-11-23'), 'all')).toEqual([])
  })
})
