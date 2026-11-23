// 보드 규칙을 담은 순수 함수 모음. React와 브라우저 API에 의존하지 않으므로
// 단위 테스트(src/board.test.ts)로 동작을 고정한다. (#8)
import { isLanguage, type Language } from './i18n'

export const CELL_COUNT = 81
export const CENTER_CELL = 40

export type BoardCell = {
  text: string
  done: boolean
}

export type Theme = 'light' | 'dark'

export type PersistedState = {
  cells: BoardCell[]
  theme: Theme
  language: Language
}

export type BackupFile = {
  cells: BoardCell[]
  theme: Theme
  language?: Language
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isBoardCellArray(value: unknown): value is BoardCell[] {
  return (
    Array.isArray(value) &&
    value.length === CELL_COUNT &&
    value.every(
      (cell) =>
        isRecord(cell) &&
        typeof cell.text === 'string' &&
        typeof cell.done === 'boolean',
    )
  )
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function hasText(cell: BoardCell) {
  return cell.text.trim() !== ''
}

export function createInitialCells(): BoardCell[] {
  return Array.from({ length: CELL_COUNT }, () => ({
    text: '',
    done: false,
  }))
}

// 중앙 블록의 하위 목표 칸이면, 그 내용이 연동될 바깥 블록 제목 칸의 인덱스를 돌려준다.
export function getSyncTarget(index: number): number | null {
  const row = Math.floor(index / 9)
  const column = index % 9
  const blockRow = Math.floor(row / 3)
  const blockColumn = Math.floor(column / 3)

  if (blockRow !== 1 || blockColumn !== 1 || index === CENTER_CELL) {
    return null
  }

  const localRow = row % 3
  const localColumn = column % 3
  const targetRow = localRow * 3 + 1
  const targetColumn = localColumn * 3 + 1

  return targetRow * 9 + targetColumn
}

export function isSyncedTitleCell(index: number) {
  const row = Math.floor(index / 9)
  const column = index % 9
  const blockIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3)

  return blockIndex !== 4 && row % 3 === 1 && column % 3 === 1
}

// 64개 실천 칸(바깥 블록에서 제목 칸을 뺀 칸)인지
export function isDetailCell(index: number) {
  const row = Math.floor(index / 9)
  const column = index % 9
  const blockIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3)

  return blockIndex !== 4 && !isSyncedTitleCell(index)
}

// 불러온 보드를 현재 규칙에 맞게 정리한다.
// - 중앙 블록의 하위 목표를 바깥 블록 제목에 다시 동기화한다.
// - 이전 버전에서 저장된 "빈 칸인데 체크됨" 상태를 해제한다. (#3)
export function normalizeCells(cells: BoardCell[]) {
  const nextCells = cells.map((cell) => ({ ...cell }))

  for (let index = 0; index < CELL_COUNT; index += 1) {
    const target = getSyncTarget(index)
    if (target !== null) {
      nextCells[target] = { ...nextCells[target], text: nextCells[index].text }
    }
  }

  return nextCells.map((cell) =>
    cell.done && !hasText(cell) ? { ...cell, done: false } : cell,
  )
}

// 칸 텍스트를 바꾼 새 보드를 돌려준다.
// - 텍스트를 모두 지우면 완료 표시도 함께 해제한다.
// - 중앙 블록의 하위 목표를 바꾸면 바깥 블록 제목도 함께 바뀐다.
export function applyTextEdit(cells: BoardCell[], index: number, text: string) {
  const next = cells.map((cell) => ({ ...cell }))
  next[index] = {
    ...next[index],
    text,
    done: text.trim() === '' ? false : next[index].done,
  }

  const target = getSyncTarget(index)
  if (target !== null) {
    next[target] = { ...next[target], text }
  }

  return next
}

// 실천 칸의 완료 상태를 뒤집은 새 보드를 돌려준다.
// 실천 칸이 아니거나 빈 칸이면 null (체크할 수 없음)
export function toggleCellDone(cells: BoardCell[], index: number) {
  if (!isDetailCell(index) || !hasText(cells[index])) {
    return null
  }

  return cells.map((cell, cellIndex) =>
    cellIndex === index ? { ...cell, done: !cell.done } : cell,
  )
}

export function boardHasContent(cells: BoardCell[]) {
  return cells.some(hasText)
}

// 달성률: 작성된 실천 칸 중 완료한 칸의 비율 (반올림한 %)
export function getProgress(cells: BoardCell[]) {
  let writtenCount = 0
  let completedCount = 0

  cells.forEach((cell, index) => {
    if (!isDetailCell(index) || !hasText(cell)) {
      return
    }
    writtenCount += 1
    if (cell.done) {
      completedCount += 1
    }
  })

  const progress =
    writtenCount === 0 ? 0 : Math.round((completedCount / writtenCount) * 100)

  return { writtenCount, completedCount, progress }
}

export function isPersistedState(value: unknown): value is PersistedState {
  return (
    isRecord(value) &&
    isBoardCellArray(value.cells) &&
    isTheme(value.theme) &&
    (!('language' in value) || isLanguage(value.language))
  )
}

// 백업 JSON 파일 내용을 검증한다. 형식이 맞지 않으면 null
export function parseBackup(value: unknown): BackupFile | null {
  if (
    !isRecord(value) ||
    value.format !== 'ninegrid-backup' ||
    value.version !== 1 ||
    !isBoardCellArray(value.cells) ||
    !isTheme(value.theme) ||
    ('language' in value && !isLanguage(value.language))
  ) {
    return null
  }

  return {
    cells: normalizeCells(value.cells),
    theme: value.theme,
    language: isLanguage(value.language) ? value.language : undefined,
  }
}

// 두 보드의 내용(텍스트와 완료 상태)이 같은지
export function cellsEqual(a: BoardCell[], b: BoardCell[]) {
  return (
    a.length === b.length &&
    a.every((cell, index) => cell.text === b[index].text && cell.done === b[index].done)
  )
}

// 실천 칸 하나를 다른 실천 칸으로 옮긴다. (#13)
// - 대상 칸이 비어 있으면 그 자리로 옮기고, 내용이 있으면 두 칸의 자리를 서로 바꾼다. (덮어써서 사라지는 내용이 없다)
// - 텍스트와 완료 상태가 칸과 함께 이동한다.
// - 실천 칸이 아니거나(중심 목표·세부 목표·연동 제목 칸) 같은 칸이면 null (옮길 수 없음)
export function moveCell(cells: BoardCell[], from: number, to: number) {
  if (from === to || !isDetailCell(from) || !isDetailCell(to)) {
    return null
  }

  const next = cells.map((cell) => ({ ...cell }))
  next[from] = { ...cells[to] }
  next[to] = { ...cells[from] }
  return next
}
