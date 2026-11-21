// 인쇄용 보드 데이터를 만드는 순수 함수 (#12).
// 화면의 입력창(textarea)은 인쇄에서 글이 잘리므로, 인쇄 전용 보드를 이 데이터로 따로 그린다.
import {
  CENTER_CELL,
  hasText,
  isDetailCell,
  isSyncedTitleCell,
  type BoardCell,
} from './board'

// current: 지금 보드(내용과 체크 상태 포함), blank: 칸만 있는 빈 양식
export type PrintMode = 'current' | 'blank'

export type PrintCellKind = 'hub' | 'subgoal' | 'title' | 'action'

// 글자 수에 따라 줄이는 글자 크기 단계. 칸에는 최대 70자가 들어간다.
export type PrintTextSize = 'normal' | 'small' | 'tiny'

export type PrintCell = {
  index: number
  kind: PrintCellKind
  text: string
  // 실천 칸만 체크 표시가 있다. 빈 실천 칸도 손으로 체크할 수 있게 빈 상자를 그린다.
  check: 'done' | 'open' | null
  textSize: PrintTextSize
}

export const PRINT_SMALL_TEXT_LENGTH = 40
export const PRINT_TINY_TEXT_LENGTH = 58

export function getPrintCellKind(index: number): PrintCellKind {
  if (index === CENTER_CELL) {
    return 'hub'
  }
  if (isSyncedTitleCell(index)) {
    return 'title'
  }
  return isDetailCell(index) ? 'action' : 'subgoal'
}

export function getPrintTextSize(text: string): PrintTextSize {
  // 한·중·일 글자도 1자로 센다. (Array.from으로 서로게이트 쌍을 한 글자로 처리)
  const length = Array.from(text.trim()).length
  if (length > PRINT_TINY_TEXT_LENGTH) {
    return 'tiny'
  }
  return length > PRINT_SMALL_TEXT_LENGTH ? 'small' : 'normal'
}

// 9개 블록을 화면과 같은 순서(왼쪽 위 → 오른쪽 아래)로, 블록마다 9칸씩 돌려준다.
export function buildPrintBlocks(cells: BoardCell[], mode: PrintMode): PrintCell[][] {
  return Array.from({ length: 9 }, (_, blockIndex) => {
    const rowStart = Math.floor(blockIndex / 3) * 3
    const columnStart = (blockIndex % 3) * 3

    return Array.from({ length: 9 }, (_, localIndex) => {
      const row = rowStart + Math.floor(localIndex / 3)
      const column = columnStart + (localIndex % 3)
      const index = row * 9 + column
      const kind = getPrintCellKind(index)
      const cell = cells[index]
      const text = mode === 'blank' ? '' : cell.text.trim()
      const isDone = mode === 'current' && cell.done && hasText(cell)

      return {
        index,
        kind,
        text,
        check: kind === 'action' ? (isDone ? 'done' : 'open') : null,
        textSize: getPrintTextSize(text),
      }
    })
  })
}
