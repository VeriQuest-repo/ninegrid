// 보드 키보드 탐색과 칸 위치 계산. React와 브라우저 API에 의존하지 않는 순수 함수라
// 단위 테스트(src/keyboard.test.ts)로 동작을 고정한다. (#9)

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

const DELTAS: Record<ArrowKey, [row: number, column: number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

export function isArrowKey(key: string): key is ArrowKey {
  return key in DELTAS
}

// 칸 인덱스(0~80)가 속한 블록(0~8)
export function getBlockIndex(index: number) {
  return Math.floor(Math.floor(index / 9) / 3) * 3 + Math.floor((index % 9) / 3)
}

// 블록 안에서의 위치(0~8, 4가 블록 가운데)
export function getLocalIndex(index: number) {
  return (Math.floor(index / 9) % 3) * 3 + (index % 9) % 3
}

// 블록과 블록 안 위치로 칸 인덱스를 구한다.
export function getCellIndex(blockIndex: number, localIndex: number) {
  const row = Math.floor(blockIndex / 3) * 3 + Math.floor(localIndex / 3)
  const column = (blockIndex % 3) * 3 + (localIndex % 3)
  return row * 9 + column
}

// 블록 가운데를 뺀 8칸에 붙이는 번호(1~8). 블록 가운데 칸이면 null.
// 화면의 왼쪽 위부터 오른쪽 아래 순서다.
export function getCellNumber(index: number): number | null {
  const local = getLocalIndex(index)
  if (local === 4) {
    return null
  }
  return local < 4 ? local + 1 : local
}

// 방향키로 이동할 칸. 보드 끝이면 null.
// focusBlock을 주면(포커스 모드) 그 블록의 3×3 안에서만 움직인다.
export function getNeighborCell(
  index: number,
  key: ArrowKey,
  focusBlock: number | null = null,
): number | null {
  const [rowDelta, columnDelta] = DELTAS[key]
  const row = Math.floor(index / 9) + rowDelta
  const column = (index % 9) + columnDelta
  if (row < 0 || row > 8 || column < 0 || column > 8) {
    return null
  }
  const next = row * 9 + column
  if (focusBlock !== null && getBlockIndex(next) !== focusBlock) {
    return null
  }
  return next
}

// 입력 칸에서 방향키를 눌렀을 때 글자 사이 이동 대신 칸을 옮길지 정한다.
// 커서가 맨 앞일 때 위/왼쪽, 맨 끝일 때 아래/오른쪽으로 옮긴다.
// 위/아래는 브라우저가 첫 줄/마지막 줄에서 커서를 맨 앞/맨 끝으로 보내므로,
// 여러 줄인 칸도 한 번 더 누르면 칸을 옮기게 된다.
export function shouldLeaveCell(
  key: ArrowKey,
  selectionStart: number,
  selectionEnd: number,
  length: number,
) {
  if (selectionStart !== selectionEnd) {
    return false
  }
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return selectionStart === 0
  }
  return selectionEnd === length
}
