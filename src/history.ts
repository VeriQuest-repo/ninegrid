// 실행 취소(Undo)/다시 실행(Redo) 히스토리를 다루는 순수 함수 모음. (#5)
// React와 브라우저 API에 의존하지 않으므로 src/history.test.ts로 동작을 고정한다.
// 히스토리는 메모리에만 두고 localStorage에는 저장하지 않는다. (새로고침 시 초기화)

export const HISTORY_LIMIT = 50

export type History<T> = {
  // 오래된 순서. 마지막 항목이 가장 최근에 되돌릴 상태
  past: T[]
  // 다시 실행할 상태. 마지막 항목이 가장 먼저 다시 실행할 상태
  future: T[]
}

export function createHistory<T>(): History<T> {
  return { past: [], future: [] }
}

export function canUndo<T>(history: History<T>) {
  return history.past.length > 0
}

export function canRedo<T>(history: History<T>) {
  return history.future.length > 0
}

// 변경 직전 상태를 기록한다. 새 작업이므로 Redo 기록은 비운다.
// 개수가 limit을 넘으면 가장 오래된 기록부터 버린다.
export function pushHistory<T>(
  history: History<T>,
  snapshot: T,
  limit = HISTORY_LIMIT,
): History<T> {
  const past = [...history.past, snapshot]
  return {
    past: past.length > limit ? past.slice(past.length - limit) : past,
    future: [],
  }
}

// 현재 상태를 Redo 쪽에 넣고 직전 상태를 돌려준다. 되돌릴 기록이 없으면 null
export function undoHistory<T>(
  history: History<T>,
  current: T,
): { history: History<T>; value: T } | null {
  if (history.past.length === 0) {
    return null
  }

  const value = history.past[history.past.length - 1]
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, current],
    },
    value,
  }
}

// 현재 상태를 Undo 쪽에 넣고 다시 실행할 상태를 돌려준다. 기록이 없으면 null
export function redoHistory<T>(
  history: History<T>,
  current: T,
): { history: History<T>; value: T } | null {
  if (history.future.length === 0) {
    return null
  }

  const value = history.future[history.future.length - 1]
  return {
    history: {
      past: [...history.past, current],
      future: history.future.slice(0, -1),
    },
    value,
  }
}

// 입력 묶음이 끝났을 때, 마지막 기록이 현재 상태와 같으면(입력했다가 원래대로 되돌린 경우)
// 아무 변화 없는 Undo가 생기지 않도록 그 기록을 지운다.
export function dropUnchangedEntry<T>(
  history: History<T>,
  current: T,
  isEqual: (a: T, b: T) => boolean,
): History<T> {
  const last = history.past[history.past.length - 1]
  if (last === undefined || !isEqual(last, current)) {
    return history
  }
  return { ...history, past: history.past.slice(0, -1) }
}
