import { describe, expect, it } from 'vitest'
import { CENTER_CELL, createInitialCells, type BoardCell } from './board'
import {
  INDEX_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  MAX_BOARDS,
  boardAfterDelete,
  boardStorageKey,
  boardsFromBackup,
  buildBackup,
  cleanBoardName,
  createBoard,
  loadAppData,
  nextDefaultName,
  parseBackupFile,
  replaceBoards,
  saveBoard,
  withCells,
  type AppData,
  type StorageLike,
} from './boards'

const defaultName = (number: number) => `보드 ${number}`

class MemoryStorage implements StorageLike {
  items = new Map<string, string>()
  // 이 키 이후의 setItem을 용량 초과로 실패시킨다.
  failOn: ((key: string) => boolean) | null = null

  getItem(key: string) {
    return this.items.get(key) ?? null
  }

  setItem(key: string, value: string) {
    if (this.failOn?.(key)) {
      throw new DOMException('full', 'QuotaExceededError')
    }
    this.items.set(key, value)
  }

  removeItem(key: string) {
    this.items.delete(key)
  }
}

function cellsWith(entries: Record<number, Partial<BoardCell>>) {
  const cells = createInitialCells()
  for (const [index, cell] of Object.entries(entries)) {
    cells[Number(index)] = { ...cells[Number(index)], ...cell }
  }
  return cells
}

const ACTION_CELL = 0

function sampleData(): AppData {
  const first = { ...createBoard('건강', cellsWith({ [CENTER_CELL]: { text: '건강' } }), 1), id: 'a' }
  const second = { ...createBoard('공부', cellsWith({ [ACTION_CELL]: { text: '책 읽기', done: true } }), 2), id: 'b' }
  return { boards: [first, second], currentBoardId: 'b', theme: 'dark', language: 'en' }
}

describe('loadAppData: v1 → v2 마이그레이션', () => {
  it('기존 단일 보드를 첫 번째 보드로 옮기고 v1 데이터는 남겨 둔다', () => {
    const storage = new MemoryStorage()
    const legacyCells = cellsWith({
      [CENTER_CELL]: { text: '올해 목표' },
      [ACTION_CELL]: { text: '걷기', done: true },
    })
    const legacy = JSON.stringify({ cells: legacyCells, theme: 'dark', language: 'ja' })
    storage.setItem(LEGACY_STORAGE_KEY, legacy)

    const { data, problem, migrated } = loadAppData(storage, 'ko', defaultName, 100)

    expect(problem).toBeNull()
    expect(migrated).toBe(true)
    expect(data.boards).toHaveLength(1)
    expect(data.boards[0].name).toBe('올해 목표')
    expect(data.boards[0].cells).toEqual(legacyCells)
    expect(data.theme).toBe('dark')
    expect(data.language).toBe('ja')
    expect(data.currentBoardId).toBe(data.boards[0].id)
    // v1은 롤백을 위해 그대로 남는다.
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBe(legacy)
    // v2로 저장되어, 다시 읽어도 같은 보드가 열린다.
    const again = loadAppData(storage, 'ko', defaultName, 200)
    expect(again.migrated).toBe(false)
    expect(again.data.boards).toEqual(data.boards)
  })

  it('중심 목표가 비어 있으면 기본 이름을 붙이고, 빈 칸 체크는 정리한다', () => {
    const storage = new MemoryStorage()
    const legacyCells = cellsWith({ [ACTION_CELL]: { text: '', done: true } })
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ cells: legacyCells, theme: 'light' }))

    const { data } = loadAppData(storage, 'en', defaultName)

    expect(data.boards[0].name).toBe('보드 1')
    expect(data.boards[0].cells[ACTION_CELL].done).toBe(false)
    expect(data.language).toBe('en')
  })

  it('저장된 데이터가 없으면 빈 보드 하나로 시작한다', () => {
    const storage = new MemoryStorage()
    const { data, problem, migrated } = loadAppData(storage, 'ko', defaultName)

    expect(problem).toBeNull()
    expect(migrated).toBe(false)
    expect(data.boards).toHaveLength(1)
    expect(data.boards[0].cells).toEqual(createInitialCells())
    expect(storage.getItem(INDEX_STORAGE_KEY)).not.toBeNull()
  })

  it('v1이 깨져 있으면 빈 보드를 열고, 원래 데이터를 덮어쓰지 않는다', () => {
    const storage = new MemoryStorage()
    storage.setItem(LEGACY_STORAGE_KEY, '{"cells": []}')

    const { data, problem } = loadAppData(storage, 'ko', defaultName)

    expect(problem).toBe('invalid')
    expect(data.boards[0].cells).toEqual(createInitialCells())
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBe('{"cells": []}')
    expect(storage.getItem(INDEX_STORAGE_KEY)).toBeNull()
  })

  it('v2 목록이 깨졌으면 v1에서 다시 옮긴다', () => {
    const storage = new MemoryStorage()
    storage.setItem(INDEX_STORAGE_KEY, '{"version": 2}')
    storage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({ cells: cellsWith({ [CENTER_CELL]: { text: '복구' } }), theme: 'light' }),
    )

    const { data, problem } = loadAppData(storage, 'ko', defaultName)

    expect(problem).toBe('invalid')
    expect(data.boards[0].name).toBe('복구')
  })

  it('용량이 부족해 옮기지 못해도 v1 보드를 그대로 연다', () => {
    const storage = new MemoryStorage()
    const legacyCells = cellsWith({ [CENTER_CELL]: { text: '목표' } })
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ cells: legacyCells, theme: 'light' }))
    storage.failOn = () => true

    const { data, problem } = loadAppData(storage, 'ko', defaultName)

    expect(problem).toBe('save')
    expect(data.boards[0].cells).toEqual(legacyCells)
    expect(storage.getItem(LEGACY_STORAGE_KEY)).not.toBeNull()
  })
})

describe('v2 저장과 읽기', () => {
  it('보드별 칸과 마지막으로 연 보드를 기억한다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    expect(replaceBoards(storage, { ...data, boards: [] }, data)).toEqual({ ok: true })

    const loaded = loadAppData(storage, 'ko', defaultName)
    expect(loaded.problem).toBeNull()
    expect(loaded.data).toEqual(data)
  })

  it('칸을 고치면 그 보드만 바뀌고 다른 보드와 섞이지 않는다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    replaceBoards(storage, { ...data, boards: [] }, data)

    const edited = withCells(data.boards[1], cellsWith({ [ACTION_CELL]: { text: '수학' } }), 5)
    const next = { ...data, boards: [data.boards[0], edited] }
    expect(saveBoard(storage, next, edited)).toEqual({ ok: true })

    const loaded = loadAppData(storage, 'ko', defaultName).data
    expect(loaded.boards[0].cells).toEqual(data.boards[0].cells)
    expect(loaded.boards[1].cells[ACTION_CELL].text).toBe('수학')
    expect(loaded.boards[1].updatedAt).toBe(5)
  })

  it('칸 데이터가 깨진 보드는 빈 보드로 열고 알린다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    replaceBoards(storage, { ...data, boards: [] }, data)
    storage.setItem(boardStorageKey('a'), 'not json')

    const { data: loaded, problem } = loadAppData(storage, 'ko', defaultName)
    expect(problem).toBe('invalid')
    expect(loaded.boards.map((board) => board.id)).toEqual(['a', 'b'])
    expect(loaded.boards[0].cells).toEqual(createInitialCells())
  })

  it('없는 보드를 현재 보드로 가리키면 첫 보드를 연다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    replaceBoards(storage, { ...data, boards: [] }, { ...data, currentBoardId: 'zzz' })

    expect(loadAppData(storage, 'ko', defaultName).data.currentBoardId).toBe('a')
  })

  it('삭제한 보드의 칸 데이터를 지운다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    replaceBoards(storage, { ...data, boards: [] }, data)

    const next = { ...data, boards: [data.boards[0]], currentBoardId: 'a' }
    expect(replaceBoards(storage, data, next)).toEqual({ ok: true })
    expect(storage.getItem(boardStorageKey('b'))).toBeNull()
    expect(loadAppData(storage, 'ko', defaultName).data.boards).toHaveLength(1)
  })

  it('용량 초과로 보드를 추가하지 못하면 이전 상태를 그대로 둔다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    replaceBoards(storage, { ...data, boards: [] }, data)
    const before = new Map(storage.items)

    const added = { ...createBoard('새 보드', createInitialCells()), id: 'c' }
    storage.failOn = (key) => key === INDEX_STORAGE_KEY
    const result = replaceBoards(storage, data, { ...data, boards: [...data.boards, added] })

    expect(result).toEqual({ ok: false, quota: true })
    expect(storage.items).toEqual(before)
  })
})

describe('JSON 백업', () => {
  it('전체 백업을 내보낸 뒤 읽으면 모든 보드가 돌아온다', () => {
    const data = sampleData()
    const backup = parseBackupFile(JSON.parse(JSON.stringify(buildBackup(data, 'all'))))

    expect(backup?.scope).toBe('all')
    expect(backup?.boards.map((board) => board.name)).toEqual(['건강', '공부'])
    expect(backup?.boards.map((board) => board.cells)).toEqual(data.boards.map((board) => board.cells))
    expect(backup?.currentIndex).toBe(1)
    expect(backup?.theme).toBe('dark')
    expect(backup?.language).toBe('en')
  })

  it('보드 1개 백업에는 지금 보드만 들어간다', () => {
    const backup = parseBackupFile(JSON.parse(JSON.stringify(buildBackup(sampleData(), 'board'))))

    expect(backup?.scope).toBe('board')
    expect(backup?.boards.map((board) => board.name)).toEqual(['공부'])
  })

  it('이전 버전(v1) 백업 파일도 보드 1개로 읽는다', () => {
    const cells = cellsWith({ [CENTER_CELL]: { text: '예전 목표' } })
    const backup = parseBackupFile({
      format: 'ninegrid-backup',
      version: 1,
      exportedAt: '2026-11-01T00:00:00.000Z',
      cells,
      theme: 'light',
      language: 'ko',
    })

    expect(backup?.scope).toBe('board')
    expect(backup?.boards[0].cells).toEqual(cells)
    expect(backup?.boards[0].name).toBeNull()
  })

  it.each([
    ['다른 형식', { format: 'other', version: 2 }],
    ['모르는 버전', { ...buildBackup(sampleData(), 'all'), version: 3 }],
    ['보드 없음', { ...buildBackup(sampleData(), 'all'), boards: [] }],
    ['칸 수가 틀림', { ...buildBackup(sampleData(), 'all'), boards: [{ name: 'x', cells: [] }] }],
    [
      '보드 개수 초과',
      {
        ...buildBackup(sampleData(), 'all'),
        boards: Array.from({ length: MAX_BOARDS + 1 }, () => ({ name: 'x', cells: createInitialCells() })),
      },
    ],
  ])('형식이 맞지 않으면 null: %s', (_, value) => {
    expect(parseBackupFile(value)).toBeNull()
  })

  it('복원한 보드는 기존 보드와 겹치지 않는 새 id를 받는다', () => {
    const data = sampleData()
    const backup = parseBackupFile(JSON.parse(JSON.stringify(buildBackup(data, 'all'))))!
    const restored = boardsFromBackup(backup, data.boards, defaultName, 10)

    expect(restored).toHaveLength(2)
    const ids = new Set([...data.boards, ...restored].map((board) => board.id))
    expect(ids.size).toBe(4)
    expect(restored[0].createdAt).toBe(data.boards[0].createdAt)
  })

  it('이름 없는 백업은 중심 목표나 기본 이름으로 이름을 붙인다', () => {
    const named = boardsFromBackup(
      { scope: 'board', boards: [{ name: null, cells: cellsWith({ [CENTER_CELL]: { text: '목표' } }), history: [], createdAt: null, updatedAt: null }], currentIndex: 0, theme: null, language: null },
      [],
      defaultName,
    )
    const unnamed = boardsFromBackup(
      { scope: 'board', boards: [{ name: null, cells: createInitialCells(), history: [], createdAt: null, updatedAt: null }], currentIndex: 0, theme: null, language: null },
      sampleData().boards,
      defaultName,
    )
    expect(named[0].name).toBe('목표')
    expect(unnamed[0].name).toBe('보드 3')
  })
})

describe('보드 목록 도우미', () => {
  it('보드를 지우면 다음 보드, 마지막이었으면 앞 보드를 연다', () => {
    const boards = ['a', 'b', 'c'].map((id) => ({ id, name: id, createdAt: 0, updatedAt: 0 }))
    expect(boardAfterDelete(boards, 'a')).toBe('b')
    expect(boardAfterDelete(boards, 'b')).toBe('c')
    expect(boardAfterDelete(boards, 'c')).toBe('b')
    expect(boardAfterDelete([boards[0]], 'a')).toBeNull()
  })

  it('기본 이름은 이미 있는 이름과 겹치지 않는다', () => {
    const boards = [
      { id: 'a', name: '보드 2', createdAt: 0, updatedAt: 0 },
      { id: 'b', name: '보드 3', createdAt: 0, updatedAt: 0 },
    ]
    expect(nextDefaultName(boards, defaultName)).toBe('보드 4')
    expect(nextDefaultName([], defaultName)).toBe('보드 1')
  })

  it('보드 이름의 앞뒤 공백을 지우고 길이를 제한한다', () => {
    expect(cleanBoardName('  2027   목표 ')).toBe('2027 목표')
    expect(cleanBoardName('가'.repeat(60))).toHaveLength(40)
  })
})

describe('진척 기록 저장 (#11)', () => {
  const history = [
    {
      date: '2026-11-22',
      progress: 100,
      completedCount: 1,
      writtenCount: 1,
      blockCompleted: [1, 0, 0, 0, 0, 0, 0, 0],
    },
  ]

  it('보드별로 저장하고 다른 보드와 섞이지 않는다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    data.boards[1] = { ...data.boards[1], history }
    replaceBoards(storage, { ...data, boards: [] }, data)

    const loaded = loadAppData(storage, 'ko', defaultName).data
    expect(loaded.boards[0].history).toEqual([])
    expect(loaded.boards[1].history).toEqual(history)
  })

  it('기록이 없는 이전 v2 칸 데이터도 빈 기록으로 읽는다', () => {
    const storage = new MemoryStorage()
    const data = sampleData()
    replaceBoards(storage, { ...data, boards: [] }, data)
    storage.setItem(boardStorageKey('b'), JSON.stringify({ cells: data.boards[1].cells }))

    const loaded = loadAppData(storage, 'ko', defaultName)
    expect(loaded.problem).toBeNull()
    expect(loaded.data.boards[1].history).toEqual([])
  })

  it('백업에 기록을 담고, 복원하면 그대로 돌아온다', () => {
    const data = sampleData()
    data.boards[1] = { ...data.boards[1], history }
    const backup = parseBackupFile(JSON.parse(JSON.stringify(buildBackup(data, 'all'))))
    expect(backup?.boards.map((board) => board.history)).toEqual([[], history])

    const restored = boardsFromBackup(backup!, [], defaultName)
    expect(restored[1].history).toEqual(history)
  })

  it('기록이 없는 이전 백업도 불러온다', () => {
    const data = sampleData()
    const raw = JSON.parse(JSON.stringify(buildBackup(data, 'all')))
    raw.boards.forEach((board: Record<string, unknown>) => delete board.history)
    const backup = parseBackupFile(raw)
    expect(backup?.boards).toHaveLength(2)
    expect(backup?.boards.every((board) => board.history.length === 0)).toBe(true)
  })
})
