// 블록별 달성률과 날짜별 진척 기록(#11)을 다루는 순수 함수 모음.
// React와 브라우저 API에 의존하지 않으므로 src/progress.test.ts로 동작을 고정한다.
//
// 진척 기록은 보드마다 하루 1건(사용자 기기의 로컬 날짜 기준)만 남기고, 같은 날 다시 바뀌면 마지막 값으로 덮어쓴다.
// 칸 텍스트는 저장하지 않고 개수만 저장한다. 실행 취소(Undo) 기록과는 별개이며 되돌리기 대상이 아니다.
import { getProgress, hasText, isDetailCell, isRecord, type BoardCell } from './board'

// 바깥 8개 블록의 번호(0~8 중 가운데 4 제외)
export const OUTER_BLOCKS = [0, 1, 2, 3, 5, 6, 7, 8] as const

// 보관 상한: 최근 약 1년
export const MAX_SNAPSHOTS = 365

export type BlockProgress = {
  blockIndex: number
  writtenCount: number
  completedCount: number
  // 작성한 실천이 없으면 null ("0%"와 구분한다)
  progress: number | null
}

export type ProgressSnapshot = {
  // YYYY-MM-DD (로컬 날짜)
  date: string
  progress: number
  completedCount: number
  writtenCount: number
  // OUTER_BLOCKS 순서의 블록별 완료 개수 (8개)
  blockCompleted: number[]
}

export function blockOfCell(index: number) {
  const row = Math.floor(index / 9)
  const column = index % 9
  return Math.floor(row / 3) * 3 + Math.floor(column / 3)
}

// 블록 하나의 실천 칸 달성률. 전체 달성률(getProgress)과 같은 기준: 완료 ÷ 작성한 칸
export function getBlockProgress(cells: BoardCell[], blockIndex: number): BlockProgress {
  let writtenCount = 0
  let completedCount = 0

  cells.forEach((cell, index) => {
    if (blockOfCell(index) !== blockIndex || !isDetailCell(index) || !hasText(cell)) {
      return
    }
    writtenCount += 1
    if (cell.done) {
      completedCount += 1
    }
  })

  return {
    blockIndex,
    writtenCount,
    completedCount,
    progress: writtenCount === 0 ? null : Math.round((completedCount / writtenCount) * 100),
  }
}

export function getAllBlockProgress(cells: BoardCell[]) {
  return OUTER_BLOCKS.map((blockIndex) => getBlockProgress(cells, blockIndex))
}

// 사용자 기기의 로컬 날짜 (YYYY-MM-DD). UTC로 바꾸지 않는다.
export function localDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

// YYYY-MM-DD를 로컬 자정의 Date로. 형식이 틀리거나 없는 날짜면 null
export function parseDateKey(key: string) {
  const match = DATE_PATTERN.exec(key)
  if (match === null) {
    return null
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return localDateKey(date) === key ? date : null
}

// key에서 days일 뒤(음수면 앞)의 날짜 키. 로컬 날짜로 계산하므로 서머타임에도 하루씩 움직인다.
export function addDays(key: string, days: number) {
  const date = parseDateKey(key)
  if (date === null) {
    return key
  }
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

export function createSnapshot(cells: BoardCell[], date: string): ProgressSnapshot {
  const { progress, completedCount, writtenCount } = getProgress(cells)
  return {
    date,
    progress,
    completedCount,
    writtenCount,
    blockCompleted: getAllBlockProgress(cells).map((block) => block.completedCount),
  }
}

function sameValues(a: ProgressSnapshot, b: ProgressSnapshot) {
  return (
    a.progress === b.progress &&
    a.completedCount === b.completedCount &&
    a.writtenCount === b.writtenCount &&
    a.blockCompleted.every((value, index) => value === b.blockCompleted[index])
  )
}

// 오늘 기록을 넣거나(하루 1건) 덮어쓴 새 기록. 바뀐 것이 없으면 같은 배열을 그대로 돌려준다.
// - 달성률이 내려가도 그대로 기록한다. (최고치로 고정하지 않음)
// - 아직 아무것도 작성하지 않은 빈 보드의 첫 기록은 남기지 않는다.
// - 상한(MAX_SNAPSHOTS)을 넘으면 오래된 기록부터 지운다.
export function recordSnapshot(
  history: ProgressSnapshot[],
  cells: BoardCell[],
  date: string,
): ProgressSnapshot[] {
  const snapshot = createSnapshot(cells, date)
  const last = history.at(-1)

  if (last === undefined && snapshot.writtenCount === 0) {
    return history
  }
  if (last !== undefined && last.date === date) {
    return sameValues(last, snapshot) ? history : [...history.slice(0, -1), snapshot]
  }
  // 기기 시계가 뒤로 간 경우 등: 그 날짜 기록을 대신하고 날짜순을 유지한다.
  const kept = history.filter((item) => item.date < date)
  const next = [...kept, snapshot]
  return next.length > MAX_SNAPSHOTS ? next.slice(next.length - MAX_SNAPSHOTS) : next
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 64
}

function parseSnapshot(value: unknown): ProgressSnapshot | null {
  if (
    !isRecord(value) ||
    typeof value.date !== 'string' ||
    parseDateKey(value.date) === null ||
    typeof value.progress !== 'number' ||
    !Number.isFinite(value.progress) ||
    value.progress < 0 ||
    value.progress > 100 ||
    !isCount(value.completedCount) ||
    !isCount(value.writtenCount) ||
    value.completedCount > value.writtenCount ||
    !Array.isArray(value.blockCompleted) ||
    value.blockCompleted.length !== OUTER_BLOCKS.length ||
    !value.blockCompleted.every(isCount)
  ) {
    return null
  }
  return {
    date: value.date,
    progress: Math.round(value.progress),
    completedCount: value.completedCount,
    writtenCount: value.writtenCount,
    blockCompleted: [...value.blockCompleted] as number[],
  }
}

// 저장된 값이나 백업 파일의 기록을 읽는다. 기록이 없거나(이전 버전) 깨진 항목은 건너뛴다.
// 날짜순으로 정렬하고, 같은 날짜가 여러 개면 마지막 것을 남기며, 상한을 넘으면 최근 것만 남긴다.
export function parseHistory(value: unknown): ProgressSnapshot[] {
  if (!Array.isArray(value)) {
    return []
  }
  const byDate = new Map<string, ProgressSnapshot>()
  value.forEach((item) => {
    const snapshot = parseSnapshot(item)
    if (snapshot !== null) {
      byDate.set(snapshot.date, snapshot)
    }
  })
  const sorted = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1))
  return sorted.slice(Math.max(0, sorted.length - MAX_SNAPSHOTS))
}

export type ChartRange = '4w' | 'all'

export type ChartPoint = {
  date: string
  progress: number
  completedCount: number
  writtenCount: number
}

// 그래프에 그릴 날짜별 값. 기록이 없는 날은 직전 기록 값을 이어 쓴다.
// 오늘 값은 지금 보드에서 계산해 마지막에 둔다. 범위 안에 그릴 기록이 없으면 빈 배열
export function getChartPoints(
  history: ProgressSnapshot[],
  current: ProgressSnapshot,
  range: ChartRange,
): ChartPoint[] {
  const today = current.date
  const records = [...history.filter((item) => item.date < today), current]
  if (records.length === 1 && current.writtenCount === 0) {
    return []
  }

  const firstRecord = records[0].date
  const start =
    range === '4w'
      ? (() => {
          const fourWeeksAgo = addDays(today, -27)
          return firstRecord > fourWeeksAgo ? firstRecord : fourWeeksAgo
        })()
      : firstRecord

  const points: ChartPoint[] = []
  let recordIndex = 0
  let carried: ProgressSnapshot | null = null
  // 범위 시작 전의 마지막 기록을 이어 쓸 값으로 둔다.
  while (recordIndex < records.length && records[recordIndex].date < start) {
    carried = records[recordIndex]
    recordIndex += 1
  }

  for (let date = start; date <= today; date = addDays(date, 1)) {
    if (recordIndex < records.length && records[recordIndex].date === date) {
      carried = records[recordIndex]
      recordIndex += 1
    }
    if (carried !== null) {
      points.push({
        date,
        progress: carried.progress,
        completedCount: carried.completedCount,
        writtenCount: carried.writtenCount,
      })
    }
    if (date === addDays(date, 1)) {
      break
    }
  }
  return points
}
