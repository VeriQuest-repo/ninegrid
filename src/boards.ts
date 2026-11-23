// 여러 보드(#10)의 저장 구조와 백업 형식을 다루는 함수 모음.
// React에 의존하지 않고, localStorage 대신 StorageLike를 받아 src/boards.test.ts로 동작을 고정한다.
//
// 저장 구조 (v2)
// - ninegrid-boards-v2: 앱 설정과 보드 목록
//   { version: 2, theme, language, currentBoardId, boards: [{ id, name, createdAt, updatedAt }] }
// - ninegrid-board-v2:<id>: 보드별 칸 데이터와 진척 기록 { cells, history } (history는 #11에서 추가, 없으면 빈 기록)
// - 이전 단일 보드 키(ninegrid-board-v1)는 첫 실행 때 첫 번째 보드로 옮기고, 롤백을 위해 지우지 않는다.
import {
  hasText,
  isBoardCellArray,
  isRecord,
  isTheme,
  normalizeCells,
  type BoardCell,
  type Theme,
  CENTER_CELL,
  createInitialCells,
  isPersistedState,
  parseBackup,
} from './board'
import { isLanguage, type Language } from './i18n'
import { parseHistory, type ProgressSnapshot } from './progress'

export const LEGACY_STORAGE_KEY = 'ninegrid-board-v1'
export const INDEX_STORAGE_KEY = 'ninegrid-boards-v2'
export const BOARD_STORAGE_PREFIX = 'ninegrid-board-v2:'
export const MAX_BOARDS = 20
export const MAX_BOARD_NAME_LENGTH = 40

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type BoardMeta = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export type BoardRecord = BoardMeta & {
  cells: BoardCell[]
  // 날짜별 진척 기록 (#11). 오래된 순서
  history: ProgressSnapshot[]
}

export type AppData = {
  boards: BoardRecord[]
  currentBoardId: string
  theme: Theme
  language: Language
}

export type StoredIndex = {
  version: 2
  theme: Theme
  language: Language
  currentBoardId: string
  boards: BoardMeta[]
}

export type LoadProblem = 'invalid' | 'read' | 'save'

// 새 보드 이름을 만드는 함수. 언어별 문구는 i18n에 있으므로 호출하는 쪽에서 넘긴다.
export type DefaultName = (number: number) => string

export function boardStorageKey(id: string) {
  return `${BOARD_STORAGE_PREFIX}${id}`
}

export function createBoardId(now = Date.now()) {
  const random = Math.random().toString(36).slice(2, 10)
  return `b${now.toString(36)}${random}`
}

export function cleanBoardName(name: string) {
  return name.trim().replace(/\s+/g, ' ').slice(0, MAX_BOARD_NAME_LENGTH)
}

// 이전 버전 보드나 이름 없는 백업에 붙일 이름: 중심 목표가 있으면 그 글, 없으면 기본 이름
export function nameFromCells(cells: BoardCell[], fallback: string) {
  return cleanBoardName(cells[CENTER_CELL]?.text ?? '') || fallback
}

// 기존 보드 이름과 겹치지 않는 "보드 N" 이름
export function nextDefaultName(boards: BoardMeta[], defaultName: DefaultName) {
  const names = new Set(boards.map((board) => board.name))
  let number = boards.length + 1
  while (names.has(defaultName(number))) {
    number += 1
  }
  return defaultName(number)
}

export function createBoard(
  name: string,
  cells: BoardCell[],
  now = Date.now(),
  history: ProgressSnapshot[] = [],
): BoardRecord {
  return {
    id: createBoardId(now),
    name: cleanBoardName(name),
    createdAt: now,
    updatedAt: now,
    cells,
    history,
  }
}

// 칸을 바꾼 보드. 수정 시각도 갱신한다.
export function withCells(board: BoardRecord, cells: BoardCell[], now = Date.now()): BoardRecord {
  return { ...board, cells, updatedAt: now }
}

export function toMeta({ id, name, createdAt, updatedAt }: BoardMeta): BoardMeta {
  return { id, name, createdAt, updatedAt }
}

export function toStoredIndex(data: AppData): StoredIndex {
  return {
    version: 2,
    theme: data.theme,
    language: data.language,
    currentBoardId: data.currentBoardId,
    boards: data.boards.map(toMeta),
  }
}

export function getCurrentBoard(data: AppData) {
  return data.boards.find((board) => board.id === data.currentBoardId) ?? data.boards[0]
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isBoardMeta(value: unknown): value is BoardMeta {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.name === 'string' &&
    isFiniteNumber(value.createdAt) &&
    isFiniteNumber(value.updatedAt)
  )
}

function hasUniqueIds(boards: { id: string }[]) {
  return new Set(boards.map((board) => board.id)).size === boards.length
}

export function parseStoredIndex(value: unknown): StoredIndex | null {
  if (
    !isRecord(value) ||
    value.version !== 2 ||
    !isTheme(value.theme) ||
    !isLanguage(value.language) ||
    typeof value.currentBoardId !== 'string' ||
    !Array.isArray(value.boards) ||
    value.boards.length === 0 ||
    !value.boards.every(isBoardMeta) ||
    !hasUniqueIds(value.boards)
  ) {
    return null
  }

  return {
    version: 2,
    theme: value.theme,
    language: value.language,
    currentBoardId: value.currentBoardId,
    boards: value.boards.map(toMeta),
  }
}

export function isQuotaError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  )
}

export type SaveResult = { ok: true } | { ok: false; quota: boolean }

function failure(error: unknown): SaveResult {
  return { ok: false, quota: isQuotaError(error) }
}

function tryRemove(storage: StorageLike, key: string) {
  try {
    storage.removeItem(key)
  } catch {
    // 지우지 못한 키는 다음 정리 때까지 남아도 보드 데이터에는 영향이 없다.
  }
}

export function saveIndex(storage: StorageLike, data: AppData): SaveResult {
  try {
    storage.setItem(INDEX_STORAGE_KEY, JSON.stringify(toStoredIndex(data)))
    return { ok: true }
  } catch (error) {
    return failure(error)
  }
}

export function saveBoardCells(storage: StorageLike, board: BoardRecord): SaveResult {
  try {
    storage.setItem(boardStorageKey(board.id), JSON.stringify({ cells: board.cells, history: board.history }))
    return { ok: true }
  } catch (error) {
    return failure(error)
  }
}

// 현재 보드의 칸과 목록(수정 시각)을 저장한다. 칸을 고칠 때마다 부른다.
export function saveBoard(storage: StorageLike, data: AppData, board: BoardRecord): SaveResult {
  const saved = saveBoardCells(storage, board)
  return saved.ok ? saveIndex(storage, data) : saved
}

// 보드 목록을 통째로 바꾼다(보드 추가, 삭제, 전체 복원).
// 1) 새로 생긴 보드의 칸 데이터를 먼저 쓰고 2) 목록을 쓴 뒤 3) 빠진 보드의 칸 데이터를 지운다.
// 중간에 실패하면(용량 초과 등) 새로 쓴 키만 지우고 이전 목록을 그대로 둬서, 저장된 데이터가 섞이지 않게 한다.
export function replaceBoards(
  storage: StorageLike,
  previous: AppData,
  next: AppData,
): SaveResult {
  const previousIds = new Set(previous.boards.map((board) => board.id))
  const added = next.boards.filter((board) => !previousIds.has(board.id))
  const written: string[] = []

  for (const board of added) {
    const saved = saveBoardCells(storage, board)
    if (!saved.ok) {
      written.forEach((key) => tryRemove(storage, key))
      return saved
    }
    written.push(boardStorageKey(board.id))
  }

  const savedIndex = saveIndex(storage, next)
  if (!savedIndex.ok) {
    written.forEach((key) => tryRemove(storage, key))
    return savedIndex
  }

  const nextIds = new Set(next.boards.map((board) => board.id))
  previous.boards
    .filter((board) => !nextIds.has(board.id))
    .forEach((board) => tryRemove(storage, boardStorageKey(board.id)))

  return { ok: true }
}

function readJson(storage: StorageLike, key: string): unknown {
  const saved = storage.getItem(key)
  return saved === null ? undefined : JSON.parse(saved)
}

// 저장된 데이터를 읽는다.
// - v2가 있으면 그대로 읽는다. 칸 데이터가 깨진 보드는 빈 보드로 열고 problem을 알린다.
// - v2가 없거나 목록이 깨졌으면 v1(단일 보드)을 첫 번째 보드로 옮겨 v2로 저장한다. v1 키는 지우지 않는다.
export function loadAppData(
  storage: StorageLike,
  fallbackLanguage: Language,
  defaultName: DefaultName,
  now = Date.now(),
): { data: AppData; problem: LoadProblem | null; migrated: boolean } {
  let problem: LoadProblem | null = null

  try {
    const rawIndex = readJson(storage, INDEX_STORAGE_KEY)
    if (rawIndex !== undefined) {
      const index = parseStoredIndex(rawIndex)
      if (index !== null) {
        const boards = index.boards.map((meta) => {
          try {
            const raw = readJson(storage, boardStorageKey(meta.id))
            if (isRecord(raw) && isBoardCellArray(raw.cells)) {
              return { ...meta, cells: normalizeCells(raw.cells), history: parseHistory(raw.history) }
            }
          } catch {
            // 아래에서 빈 보드로 연다.
          }
          problem = 'invalid'
          return { ...meta, cells: createInitialCells(), history: [] }
        })
        const currentBoardId = boards.some((board) => board.id === index.currentBoardId)
          ? index.currentBoardId
          : boards[0].id
        return {
          data: { boards, currentBoardId, theme: index.theme, language: index.language },
          problem,
          migrated: false,
        }
      }
      problem = 'invalid'
    }
  } catch {
    problem = 'read'
  }

  // v2가 없거나 읽을 수 없으면 v1에서 옮긴다.
  let theme: Theme = 'light'
  let language = fallbackLanguage
  let cells = createInitialCells()
  let hasLegacy = false

  try {
    const legacy = readJson(storage, LEGACY_STORAGE_KEY)
    if (legacy !== undefined) {
      if (isPersistedState(legacy)) {
        cells = normalizeCells(legacy.cells)
        theme = legacy.theme
        language = isLanguage(legacy.language) ? legacy.language : fallbackLanguage
        hasLegacy = true
      } else {
        problem = 'invalid'
      }
    }
  } catch {
    problem = 'read'
  }

  const board = createBoard(
    hasLegacy ? nameFromCells(cells, defaultName(1)) : defaultName(1),
    cells,
    now,
  )
  const data: AppData = { boards: [board], currentBoardId: board.id, theme, language }

  // 읽지 못한 데이터가 있으면 저장하지 않고 그대로 둔다. 사용자가 고치기 시작하면 그때 저장한다.
  if (problem === null) {
    const saved = saveBoard(storage, data, board)
    if (!saved.ok) {
      problem = 'save'
    }
  }

  return { data, problem, migrated: hasLegacy }
}

// ---- JSON 백업 ----

export type BackupScope = 'all' | 'board'

export type ParsedBackup = {
  scope: BackupScope
  boards: {
    name: string | null
    cells: BoardCell[]
    history: ProgressSnapshot[]
    createdAt: number | null
    updatedAt: number | null
  }[]
  // 전체 백업에서 열려 있던 보드의 위치
  currentIndex: number
  theme: Theme | null
  language: Language | null
}

export function buildBackup(
  data: AppData,
  scope: BackupScope,
  exportedAt = new Date(),
) {
  const boards = scope === 'all' ? data.boards : [getCurrentBoard(data)]
  return {
    format: 'ninegrid-backup',
    version: 2,
    scope,
    exportedAt: exportedAt.toISOString(),
    theme: data.theme,
    language: data.language,
    currentBoardId: scope === 'all' ? data.currentBoardId : boards[0].id,
    boards: boards.map(({ id, name, createdAt, updatedAt, cells, history }) => ({
      id,
      name,
      createdAt,
      updatedAt,
      cells,
      history,
    })),
  }
}

// 백업 파일 내용을 검증한다. v1(보드 1개) 파일과 v2(보드 여러 개) 파일을 모두 읽는다. 형식이 맞지 않으면 null
export function parseBackupFile(value: unknown): ParsedBackup | null {
  if (!isRecord(value) || value.format !== 'ninegrid-backup') {
    return null
  }
  if ('language' in value && !isLanguage(value.language)) {
    return null
  }
  const language = isLanguage(value.language) ? value.language : null

  // 이전 버전(보드 1개) 백업은 기존 검증(parseBackup)을 그대로 쓴다.
  if (value.version === 1) {
    const legacy = parseBackup(value)
    if (legacy === null) {
      return null
    }
    return {
      scope: 'board',
      boards: [{ name: null, cells: legacy.cells, history: [], createdAt: null, updatedAt: null }],
      currentIndex: 0,
      theme: legacy.theme,
      language: legacy.language ?? null,
    }
  }

  if (
    value.version !== 2 ||
    (value.scope !== 'all' && value.scope !== 'board') ||
    !isTheme(value.theme) ||
    !Array.isArray(value.boards) ||
    value.boards.length === 0 ||
    value.boards.length > MAX_BOARDS ||
    !value.boards.every(
      (board) =>
        isRecord(board) &&
        typeof board.name === 'string' &&
        isBoardCellArray(board.cells),
    )
  ) {
    return null
  }

  const boards = value.boards as Record<string, unknown>[]
  const currentIndex = Math.max(
    0,
    boards.findIndex((board) => board.id === value.currentBoardId),
  )

  return {
    scope: value.scope,
    boards: boards.map((board) => ({
      name: cleanBoardName(board.name as string) || null,
      cells: normalizeCells(board.cells as BoardCell[]),
      // 진척 기록이 없는 이전 백업(#11 이전)도 그대로 불러온다.
      history: parseHistory(board.history),
      createdAt: isFiniteNumber(board.createdAt) ? board.createdAt : null,
      updatedAt: isFiniteNumber(board.updatedAt) ? board.updatedAt : null,
    })),
    currentIndex,
    theme: value.theme,
    language,
  }
}

// 백업의 보드를 새 id를 가진 보드로 만든다. (기존 보드와 id가 겹치지 않게)
export function boardsFromBackup(
  backup: ParsedBackup,
  existing: BoardMeta[],
  defaultName: DefaultName,
  now = Date.now(),
): BoardRecord[] {
  const result: BoardRecord[] = []
  const usedIds = new Set(existing.map((board) => board.id))
  backup.boards.forEach((board) => {
    const fallback = nextDefaultName([...existing, ...result], defaultName)
    let record = createBoard(
      board.name ?? nameFromCells(board.cells, fallback),
      board.cells,
      now,
      board.history,
    )
    while (usedIds.has(record.id)) {
      record = { ...record, id: createBoardId(now) }
    }
    usedIds.add(record.id)
    result.push({
      ...record,
      createdAt: board.createdAt ?? now,
      updatedAt: board.updatedAt ?? now,
    })
  })
  return result
}

// 보드를 지운 뒤 열 보드: 목록에서 바로 다음 보드, 마지막이었으면 바로 앞 보드
export function boardAfterDelete(boards: BoardMeta[], deletedId: string) {
  const index = boards.findIndex((board) => board.id === deletedId)
  const remaining = boards.filter((board) => board.id !== deletedId)
  if (remaining.length === 0) {
    return null
  }
  return remaining[Math.min(Math.max(index, 0), remaining.length - 1)].id
}

export function anyBoardHasContent(boards: BoardRecord[]) {
  return boards.some((board) => board.cells.some(hasText))
}
