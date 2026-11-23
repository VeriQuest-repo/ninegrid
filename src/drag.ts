// 실천 칸 드래그 이동(#13)에 쓰는 계산. React와 브라우저 API에 의존하지 않는 순수 함수라
// 단위 테스트(src/drag.test.ts)로 동작을 고정한다.
import { isDetailCell } from './board'
import { getCellIndex } from './keyboard'

// 손잡이를 누른 뒤 이만큼(px) 움직여야 드래그를 시작한다. 그보다 적게 움직이고 떼면 탭(클릭)으로 보고 이동 창을 연다.
export const DRAG_START_DISTANCE = 6
// 화면 위·아래 가장자리에서 이 거리(px) 안으로 끌면 자동으로 스크롤한다.
export const AUTO_SCROLL_EDGE = 56
// 한 프레임에 스크롤하는 최대 거리(px)
export const AUTO_SCROLL_MAX_STEP = 14

export function hasMovedEnough(startX: number, startY: number, x: number, y: number) {
  return Math.hypot(x - startX, y - startY) >= DRAG_START_DISTANCE
}

// 드래그 중 포인터의 세로 위치(y)에 따라 이번 프레임에 스크롤할 거리. 가장자리에 가까울수록 빠르다.
// 위쪽이면 음수, 아래쪽이면 양수, 가장자리가 아니면 0
export function getAutoScrollDelta(
  y: number,
  viewportHeight: number,
  edge = AUTO_SCROLL_EDGE,
  maxStep = AUTO_SCROLL_MAX_STEP,
) {
  if (y < edge) {
    return -Math.ceil(((edge - Math.max(y, 0)) / edge) * maxStep)
  }
  if (y > viewportHeight - edge) {
    return Math.ceil(((Math.min(y, viewportHeight) - (viewportHeight - edge)) / edge) * maxStep)
  }
  return 0
}

// 블록의 실천 칸 8개(블록 가운데 제목 칸 제외). 가운데 블록에는 실천 칸이 없다.
export function getActionCells(blockIndex: number) {
  return Array.from({ length: 9 }, (_, local) => getCellIndex(blockIndex, local)).filter(
    isDetailCell,
  )
}

// 실천 칸이 있는 바깥 블록 8개
export const OUTER_BLOCKS = [0, 1, 2, 3, 5, 6, 7, 8]
