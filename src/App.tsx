import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Coffee,
  Download,
  Ellipsis,
  Image,
  Focus,
  Info,
  Grid2X2,
  LayoutTemplate,
  Link2,
  MonitorDown,
  Moon,
  Printer,
  Redo2,
  RefreshCw,
  RotateCcw,
  Sun,
  Target,
  Undo2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toBlob, toPng } from 'html-to-image'
import {
  CENTER_CELL,
  applyTextEdit,
  boardHasContent,
  cellsEqual,
  createInitialCells,
  getProgress,
  hasText,
  isDetailCell,
  isPersistedState,
  isRecord,
  isSyncedTitleCell,
  normalizeCells,
  parseBackup,
  toggleCellDone,
  type BoardCell,
  type PersistedState,
  type Theme,
} from './board'
import {
  canRedo,
  canUndo,
  createHistory,
  dropUnchangedEntry,
  pushHistory,
  redoHistory,
  undoHistory,
} from './history'
import { detectLanguage, getTranslation, isLanguage, type Language } from './i18n'
import { SAMPLE_IDS, getSampleInfo, loadSampleCells, type SampleId } from './samples'
import { usePwa } from './pwa'
import {
  getBlockIndex,
  getCellIndex,
  getCellNumber,
  getNeighborCell,
  isArrowKey,
  shouldLeaveCell,
} from './keyboard'
import { buildPrintBlocks, getPrintTextSize, type PrintMode } from './print'
import './App.css'

const STORAGE_KEY = 'ninegrid-board-v1'
// 백업 알림 상태는 보드 데이터와 분리해 별도 키에 저장한다. (#4)
// 보드 저장 구조(ninegrid-board-v1)와 백업 파일 형식은 바뀌지 않는다.
const BACKUP_META_KEY = 'ninegrid-backup-meta-v1'
const REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000
const CLOCK_TICK_MS = 60 * 60 * 1000
const CENTER_GOAL_HINT_INDEX: Record<number, number> = {
  30: 0,
  31: 1,
  32: 2,
  39: 3,
  41: 4,
  48: 5,
  49: 6,
  50: 7,
}
// 칸 입력을 한 번의 Undo 기록으로 묶는 시간. 마지막 입력 후 이 시간이 지나거나
// 입력창을 벗어나면 묶음을 끝낸다. (#5)
const TEXT_EDIT_IDLE_MS = 1000
const IS_APPLE_PLATFORM =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
const UNDO_SHORTCUT = IS_APPLE_PLATFORM ? '⌘Z' : 'Ctrl+Z'
const REDO_SHORTCUT = IS_APPLE_PLATFORM ? '⇧⌘Z' : 'Ctrl+Y'
// 실천 칸에서 완료 체크를 바꾸는 단축키 (#9)
const CHECK_SHORTCUT = IS_APPLE_PLATFORM ? '⌘Enter' : 'Ctrl+Enter'
// 블록마다 Tab으로 처음 들어가는 칸. 처음에는 블록 가운데(중심 목표, 블록 제목)다. (#9)
const INITIAL_ACTIVE_CELLS = Array.from({ length: 9 }, (_, block) => getCellIndex(block, 4))
const THEME_COLORS: Record<Theme, string> = {
  light: '#f4f5f1',
  dark: '#171d1b',
}

type BackupMeta = {
  // 마지막으로 JSON 백업(또는 복원)한 시각 (ms)
  lastBackupAt: number | null
  // 백업 이후 처음 보드를 수정한 시각 (ms). 백업하지 않은 변경이 없으면 null
  dirtySince: number | null
  // "나중에"를 누른 경우 배너를 다시 띄울 시각 (ms)
  snoozedUntil: number | null
  // "다시 보지 않기"로 배너를 끈 경우 true (버튼의 점 표시는 유지)
  remindersOff: boolean
  // "이 브라우저에만 저장돼요" 첫 안내를 확인했는지
  storageNoticeSeen: boolean
}

// 입력창에 포커스가 있으면 Ctrl/Cmd+Z를 브라우저 기본 Undo(입력 중인 글자 되돌리기)에 맡긴다.
function isTextEntryTarget(target: EventTarget | null) {
  if (target instanceof HTMLTextAreaElement) {
    return true
  }
  if (target instanceof HTMLInputElement) {
    return !['button', 'checkbox', 'file', 'radio', 'reset', 'submit'].includes(target.type)
  }
  return target instanceof HTMLElement && target.isContentEditable
}

type MoreActionKey = 'png' | 'print' | 'backup' | 'restore' | 'install' | 'samples' | 'reset'

type Notice = {
  message: string
  kind: 'success' | 'error'
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isBackupMeta(value: unknown): value is BackupMeta {
  return (
    isRecord(value) &&
    isNullableNumber(value.lastBackupAt) &&
    isNullableNumber(value.dirtySince) &&
    isNullableNumber(value.snoozedUntil) &&
    typeof value.remindersOff === 'boolean' &&
    typeof value.storageNoticeSeen === 'boolean'
  )
}

function saveBackupMeta(meta: BackupMeta) {
  try {
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta))
  } catch {
    // 알림 상태 저장 실패는 보드 사용에 영향이 없으므로 무시한다.
  }
}

// 백업 알림 상태를 읽는다. 이 기능 이전부터 쓰던 사용자는 키가 없으므로,
// 보드에 내용이 있으면 "아직 백업한 적 없음 + 지금부터 변경 있음"으로 시작한다.
function readBackupMeta(cells: BoardCell[]): BackupMeta {
  try {
    const saved = localStorage.getItem(BACKUP_META_KEY)
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)
      if (isBackupMeta(parsed)) {
        return parsed
      }
    }
  } catch {
    // 읽기 실패 시 아래 기본값을 쓴다.
  }

  const meta: BackupMeta = {
    lastBackupAt: null,
    dirtySince: boardHasContent(cells) ? Date.now() : null,
    snoozedUntil: null,
    remindersOff: false,
    storageNoticeSeen: false,
  }
  saveBackupMeta(meta)
  return meta
}

function readInitialState(): { state: PersistedState; notice: Notice | null } {
  const language = detectLanguage()
  const t = getTranslation(language)

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) {
      return {
        state: { cells: createInitialCells(), theme: 'light', language },
        notice: null,
      }
    }

    const parsed: unknown = JSON.parse(saved)
    if (!isPersistedState(parsed)) {
      return {
        state: { cells: createInitialCells(), theme: 'light', language },
        notice: {
          message: t.invalidStorage,
          kind: 'error',
        },
      }
    }

    return {
      state: {
        cells: normalizeCells(parsed.cells),
        theme: parsed.theme,
        language: isLanguage(parsed.language) ? parsed.language : language,
      },
      notice: null,
    }
  } catch {
    return {
      state: { cells: createInitialCells(), theme: 'light', language },
      notice: {
        message: t.readStorageError,
        kind: 'error',
      },
    }
  }
}

function getBlockTitle(cells: BoardCell[], blockIndex: number, language: Language) {
  const t = getTranslation(language)
  if (blockIndex === 4) {
    return t.centerGoal
  }

  const centerIndex =
    (Math.floor(blockIndex / 3) * 3 + 1) * 9 +
    (blockIndex % 3) * 3 +
    1
  return cells[centerIndex].text.trim() || t.areaName(blockIndex + 1)
}

function App() {
  const [initialState] = useState(readInitialState)
  const [appState, setAppState] = useState(initialState.state)
  const { cells, theme, language } = appState
  const t = getTranslation(language)
  const [notice, setNotice] = useState<Notice | null>(initialState.notice)
  const [focusMode, setFocusMode] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(4)
  const importInput = useRef<HTMLInputElement>(null)
  const boardFrame = useRef<HTMLDivElement>(null)
  const [isExportingPng, setIsExportingPng] = useState(false)
  const [backupMeta, setBackupMeta] = useState(() =>
    readBackupMeta(initialState.state.cells),
  )
  const [now, setNow] = useState(() => Date.now())
  // 보드(cells) 히스토리. 메모리에만 두고 저장하지 않는다. (#5)
  const [history, setHistory] = useState(createHistory<BoardCell[]>)
  // 지금 하나의 기록으로 묶고 있는 입력 칸의 인덱스 (없으면 null)
  const textEditSession = useRef<number | null>(null)
  const textEditTimer = useRef<number | null>(null)
  const latestCells = useRef(cells)
  const stepHistoryRef = useRef<(direction: 'undo' | 'redo') => void>(() => {})
  // 예시 보드 선택/덮어쓰기 확인 대화상자 (#7)
  const sampleDialog = useRef<HTMLDialogElement>(null)
  const [selectedSample, setSelectedSample] = useState<SampleId>(SAMPLE_IDS[0])
  // 좁은 화면(760px 이하)의 더보기 메뉴
  const [moreOpen, setMoreOpen] = useState(false)
  const moreMenu = useRef<HTMLDivElement>(null)
  const moreButton = useRef<HTMLButtonElement>(null)
  // 인쇄 / PDF 저장 대화상자 (#12)
  const printDialog = useRef<HTMLDialogElement>(null)
  const [printMode, setPrintMode] = useState<PrintMode>('current')
  // 홈 화면 설치와 새 버전 안내 (#6)
  // 블록마다 Tab으로 들어갈 칸(roving tabindex). 방향키로 옮기면 그 칸을 기억한다. (#9)
  const [activeCells, setActiveCells] = useState(INITIAL_ACTIVE_CELLS)
  // 렌더링 뒤 포커스를 옮길 칸 (포커스 모드로 들어갈 때 등)
  const pendingCellFocus = useRef<number | null>(null)
  // 완료 체크를 바꿨을 때 스크린 리더에 읽어 줄 달성률
  const [progressAnnouncement, setProgressAnnouncement] = useState('')
  // 대화상자를 연 버튼. 닫히면 그 버튼으로 포커스를 돌려준다.
  const dialogOpener = useRef<HTMLElement | null>(null)
  // 더보기 버튼에서 위 화살표로 열면 마지막 항목에 포커스를 둔다.
  const moreFocusLast = useRef(false)
  const pwa = usePwa({
    onOfflineReady: () => showNotice({ message: t.offlineReady, kind: 'success' }),
  })

  const hasUnsavedChanges =
    backupMeta.dirtySince !== null && boardHasContent(cells)
  const reminderBase = backupMeta.lastBackupAt ?? backupMeta.dirtySince
  const showStorageNotice = !backupMeta.storageNoticeSeen
  const showBackupReminder =
    !showStorageNotice &&
    hasUnsavedChanges &&
    !backupMeta.remindersOff &&
    reminderBase !== null &&
    now - reminderBase >= REMINDER_INTERVAL_MS &&
    (backupMeta.snoozedUntil === null || now >= backupMeta.snoozedUntil)
  const backupLabel = hasUnsavedChanges
    ? `${t.backupDownload} · ${t.unsavedChanges}`
    : t.backupDownload

  const { writtenCount, completedCount, progress } = getProgress(cells)

  // 탭을 오래 열어 두어도 7일 경과 여부가 갱신되도록 시간을 주기적으로 갱신
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), CLOCK_TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language
    document.title = t.pageTitle

    // 앱에서 고른 테마에 맞춰 브라우저 상단바 색을 갱신
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = THEME_COLORS[theme]
      })

    // 선택한 언어에 맞춰 검색 설명 갱신
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )
    if (description) {
      description.content = t.pageDescription
    }
  }, [theme, language, t.pageTitle, t.pageDescription])

  useEffect(() => {
    latestCells.current = cells
  }, [cells])

  // 단축키: Ctrl/Cmd+Z 실행 취소, Ctrl+Y 또는 Ctrl/Cmd+Shift+Z 다시 실행
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.isComposing || event.altKey || !(event.ctrlKey || event.metaKey)) {
        return
      }
      const key = event.key.toLowerCase()
      const isUndo = key === 'z' && !event.shiftKey
      const isRedo =
        (key === 'z' && event.shiftKey) ||
        (key === 'y' && event.ctrlKey && !event.metaKey && !event.shiftKey)
      if (
        (!isUndo && !isRedo) ||
        isTextEntryTarget(event.target) ||
        // 대화상자가 열려 있으면 뒤쪽 보드를 바꾸지 않는다.
        sampleDialog.current?.open ||
        printDialog.current?.open
      ) {
        return
      }
      event.preventDefault()
      stepHistoryRef.current(isUndo ? 'undo' : 'redo')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (textEditTimer.current !== null) {
        window.clearTimeout(textEditTimer.current)
      }
    }
  }, [])

  function persistState(nextState: PersistedState) {
    setAppState(nextState)
    setNotice(null)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
    } catch {
      showNotice({
        message: t.saveError,
        kind: 'error',
      })
    }
  }

  // 화면 알림을 띄운다. 이전 달성률 안내는 지워서, 알림이 사라질 때 다시 읽히지 않게 한다.
  function showNotice(next: Notice) {
    setNotice(next)
    setProgressAnnouncement('')
  }

  function updateBackupMeta(update: (meta: BackupMeta) => BackupMeta) {
    setBackupMeta((current) => {
      const next = update(current)
      saveBackupMeta(next)
      return next
    })
  }

  function markEdited() {
    if (backupMeta.dirtySince !== null) {
      return
    }
    updateBackupMeta((meta) => ({ ...meta, dirtySince: Date.now() }))
  }

  function markBackedUp() {
    const timestamp = Date.now()
    setNow(timestamp)
    updateBackupMeta((meta) => ({
      ...meta,
      lastBackupAt: timestamp,
      dirtySince: null,
      snoozedUntil: null,
    }))
  }

  function snoozeReminder() {
    const timestamp = Date.now()
    setNow(timestamp)
    updateBackupMeta((meta) => ({
      ...meta,
      snoozedUntil: timestamp + REMINDER_INTERVAL_MS,
    }))
  }

  function clearTextEditSession() {
    if (textEditTimer.current !== null) {
      window.clearTimeout(textEditTimer.current)
      textEditTimer.current = null
    }
    const wasEditing = textEditSession.current !== null
    textEditSession.current = null
    return wasEditing
  }

  // 입력 묶음을 끝낸다. 입력했다가 원래대로 되돌렸다면 빈 기록을 지운다.
  function endTextEditSession() {
    if (clearTextEditSession()) {
      setHistory((current) =>
        dropUnchangedEntry(current, latestCells.current, cellsEqual),
      )
    }
  }

  // 보드가 바뀌기 직전 상태를 기록한다. (새 작업이므로 Redo 기록은 사라진다)
  function recordChange(before: BoardCell[]) {
    setHistory((current) => pushHistory(current, before))
  }

  function stepHistory(direction: 'undo' | 'redo') {
    const base = clearTextEditSession()
      ? dropUnchangedEntry(history, cells, cellsEqual)
      : history
    const result =
      direction === 'undo' ? undoHistory(base, cells) : redoHistory(base, cells)
    if (result === null) {
      setHistory(base)
      return
    }

    setHistory(result.history)
    // 기록된 보드도 현재 규칙으로 정리해 빈 칸이 체크된 채 남지 않게 한다.
    persistState({ cells: normalizeCells(result.value), theme, language })
    // Undo/Redo도 보드 변경이므로 백업 알림에 반영한다. (#4)
    markEdited()
  }

  useEffect(() => {
    stepHistoryRef.current = stepHistory
  })

  function updateText(index: number, text: string) {
    if (textEditSession.current !== index) {
      endTextEditSession()
      recordChange(cells)
      textEditSession.current = index
    }
    if (textEditTimer.current !== null) {
      window.clearTimeout(textEditTimer.current)
    }
    textEditTimer.current = window.setTimeout(endTextEditSession, TEXT_EDIT_IDLE_MS)

    persistState({ cells: applyTextEdit(cells, index, text), theme, language })
    markEdited()
  }

  function toggleDone(index: number) {
    const next = toggleCellDone(cells, index)
    if (next === null) {
      return
    }

    endTextEditSession()
    recordChange(cells)
    persistState({ cells: next, theme, language })
    markEdited()
    // 달성률 변화를 스크린 리더에 알린다. (#9)
    const nextProgress = getProgress(next)
    setProgressAnnouncement(
      `${t.progressLabel} ${nextProgress.progress}%, ${t.completedCount(
        nextProgress.completedCount,
        nextProgress.writtenCount,
      )}`,
    )
  }

  function focusCell(index: number) {
    boardFrame.current
      ?.querySelector<HTMLTextAreaElement>(`[data-cell="${index}"]`)
      ?.focus()
  }

  // 포커스 모드로 들어간 뒤처럼, 다시 그려진 칸에 포커스를 옮긴다.
  useEffect(() => {
    if (pendingCellFocus.current !== null) {
      focusCell(pendingCellFocus.current)
      pendingCellFocus.current = null
    }
  })

  // 보드로 바로 가기: 전체 보기면 중심 목표, 포커스 모드면 보고 있는 블록의 칸으로 간다.
  function focusBoard() {
    focusCell(activeCells[focusMode ? selectedBlock : 4])
  }

  function enterFocusMode(blockIndex: number) {
    setSelectedBlock(blockIndex)
    setFocusMode(true)
    // 누른 확대 버튼이 사라지므로 그 블록의 칸으로 포커스를 옮긴다.
    pendingCellFocus.current = activeCells[blockIndex]
  }

  // 칸 입력창의 키보드 조작 (#9)
  // - 방향키: 커서가 글자 맨 앞/맨 끝이면 옆 칸으로 이동 (포커스 모드에서는 블록 안에서만)
  // - Ctrl/Cmd+Enter: 실천 칸의 완료 체크 바꾸기
  function handleCellKeyDown(
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
    index: number,
  ) {
    // 한글 등 조합 중인 입력은 건드리지 않는다.
    if (event.nativeEvent.isComposing) {
      return
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      if (isDetailCell(index)) {
        event.preventDefault()
        toggleDone(index)
      }
      return
    }
    if (
      !isArrowKey(event.key) ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return
    }
    const input = event.currentTarget
    if (
      !shouldLeaveCell(event.key, input.selectionStart, input.selectionEnd, input.value.length)
    ) {
      return
    }
    const next = getNeighborCell(index, event.key, focusMode ? selectedBlock : null)
    if (next === null) {
      return
    }
    event.preventDefault()
    focusCell(next)
  }

  function rememberActiveCell(index: number) {
    const block = getBlockIndex(index)
    setActiveCells((current) =>
      current[block] === index
        ? current
        : current.map((cell, blockIndex) => (blockIndex === block ? index : cell)),
    )
  }

  // 대화상자를 연 버튼을 기억했다가, 닫히면 그 버튼으로 포커스를 돌려준다.
  // 버튼이 사라졌으면(예: 샘플을 불러와 안내가 없어짐) 보드로 보낸다.
  function openDialog(dialog: HTMLDialogElement | null) {
    dialogOpener.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog?.showModal()
  }

  function restoreDialogFocus() {
    const opener = dialogOpener.current
    dialogOpener.current = null
    if (opener?.isConnected) {
      opener.focus()
    } else {
      focusBoard()
    }
  }

  function resetBoard() {
    if (!window.confirm(t.resetConfirm)) {
      return
    }

    const emptyCells = createInitialCells()
    endTextEditSession()
    if (!cellsEqual(cells, emptyCells)) {
      recordChange(cells)
    }
    persistState({ cells: emptyCells, theme, language })
    // 빈 보드는 잃을 내용이 없으므로 "백업하지 않은 변경"을 해제한다.
    updateBackupMeta((meta) => ({ ...meta, dirtySince: null }))
    setSelectedBlock(4)
    setFocusMode(false)
    showNotice({ message: t.resetSuccess, kind: 'success' })
  }

  function openSampleDialog() {
    endTextEditSession()
    openDialog(sampleDialog.current)
  }

  function closeSampleDialog() {
    sampleDialog.current?.close()
  }

  // 더보기 메뉴가 열리면 첫 항목에 포커스를 두고, 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!moreOpen) {
      return
    }
    const items = moreMenu.current?.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    )
    items?.[moreFocusLast.current ? items.length - 1 : 0]?.focus()
    moreFocusLast.current = false
    function handlePointerDown(event: PointerEvent) {
      if (!moreMenu.current?.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [moreOpen])

  function closeMoreMenu(returnFocus: boolean) {
    setMoreOpen(false)
    if (returnFocus) {
      moreButton.current?.focus()
    }
  }

  // 메뉴 키보드 조작: 위/아래 화살표, Home/End로 이동, Esc로 닫기, Tab이면 닫고 다음으로 이동
  function handleMoreMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
    )
    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    let next: number | null = null
    if (event.key === 'ArrowDown') {
      next = (current + 1) % items.length
    } else if (event.key === 'ArrowUp') {
      next = (current - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = items.length - 1
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeMoreMenu(true)
      return
    } else if (event.key === 'Tab') {
      closeMoreMenu(false)
      return
    }
    if (next !== null) {
      event.preventDefault()
      items[next]?.focus()
    }
  }

  // 메뉴 버튼에서 아래/위 화살표로도 메뉴를 연다.
  function handleMoreButtonKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moreFocusLast.current = event.key === 'ArrowUp'
      setMoreOpen(true)
    }
  }

  function runMoreAction(key: MoreActionKey) {
    // 항목이 사라지기 전에 메뉴 버튼으로 포커스를 돌려 둔다.
    // 대화상자를 닫으면 이 버튼으로 돌아온다.
    closeMoreMenu(true)
    if (key === 'png') {
      void downloadBoardPng()
    } else if (key === 'print') {
      openPrintDialog()
    } else if (key === 'backup') {
      downloadBackup()
    } else if (key === 'restore') {
      openRestorePicker()
    } else if (key === 'install') {
      void pwa.installApp()
    } else if (key === 'samples') {
      openSampleDialog()
    } else {
      resetBoard()
    }
  }

  function openRestorePicker() {
    importInput.current?.click()
  }

  function openPrintDialog() {
    endTextEditSession()
    openDialog(printDialog.current)
  }

  function closePrintDialog() {
    printDialog.current?.close()
  }

  // 인쇄 전용 보드(.print-sheet)는 항상 그려져 있고 화면에서만 숨겨져 있다.
  // 대화상자가 닫힌 뒤 인쇄 창을 열어야 인쇄물에 대화상자가 찍히지 않는다.
  function printBoard() {
    closePrintDialog()
    window.requestAnimationFrame(() => window.print())
  }

  // 예시 보드를 불러온다. 보드 전체를 바꾸는 다른 작업(초기화, 백업 복원)처럼
  // 직전 보드를 Undo 히스토리에 기록하므로, 불러온 뒤 실행 취소로 되돌릴 수 있다. (#5, #7)
  function loadSample() {
    const sampleCells = loadSampleCells(selectedSample, language)
    if (sampleCells === null) {
      return
    }

    endTextEditSession()
    if (!cellsEqual(cells, sampleCells)) {
      recordChange(cells)
    }
    // 테마와 언어는 사용자가 쓰던 설정을 그대로 둔다.
    persistState({ cells: sampleCells, theme, language })
    // 예시 내용은 아직 백업되지 않았으므로 백업 알림에 반영한다. (#4)
    markEdited()
    setSelectedBlock(4)
    setFocusMode(false)
    closeSampleDialog()
    showNotice({
      message: t.sampleLoaded(getSampleInfo(selectedSample, language).name),
      kind: 'success',
    })
  }

  function downloadBackup() {
    const backup = {
      format: 'ninegrid-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      cells,
      theme,
      language,
    }
    const file = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `ninegrid-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    markBackedUp()
    showNotice({ message: t.backupSuccess, kind: 'success' })
  }

  async function downloadBoardPng() {
    const frame = boardFrame.current
    const captureTarget = focusMode
      ? frame?.querySelector<HTMLElement>('.mandala-block')
      : frame

    if (!captureTarget) {
      showNotice({ message: t.pngNoBoard, kind: 'error' })
      return
    }

    setIsExportingPng(true)
    setNotice(null)
    try {
      const options = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme === 'light' ? '#f4f5f1' : '#171d1b',
        skipFonts: true,
        style: { margin: '0', maxWidth: 'none' },
      }
      await toPng(captureTarget, options)
      const blob = await toBlob(captureTarget, options)
      if (!blob) {
        throw new Error('The browser did not create a PNG image.')
      }

      const now = new Date()
      const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-')
      const file = new File([blob], `ninegrid-${date}.png`, {
        type: 'image/png',
      })
      const isMobileOrTablet =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      if (
        isMobileOrTablet &&
        typeof navigator.canShare === 'function' &&
        typeof navigator.share === 'function'
      ) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'NineGrid' })
            showNotice({ message: t.pngSuccess, kind: 'success' })
            return
          }
        } catch {
          // A dismissed or unavailable share sheet falls back to downloading.
        }
      }

      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.target = '_blank'
      link.rel = 'noopener'
      document.body.append(link)
      try {
        link.click()
      } catch (downloadError) {
        const imageTab = window.open(url, '_blank')
        if (!imageTab) {
          const reason =
            downloadError instanceof Error
              ? downloadError.message
              : String(downloadError)
          throw new Error(
            `Download failed: ${reason}. The browser also blocked opening the image in a new tab.`,
          )
        }
        imageTab.opener = null
      } finally {
        link.remove()
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      showNotice({ message: t.pngSuccess, kind: 'success' })
    } catch (error) {
      showNotice({
        message:
          error instanceof Error
            ? t.pngError(error.message)
            : t.pngError(String(error)),
        kind: 'error',
      })
    } finally {
      setIsExportingPng(false)
    }
  }

  function moveFocusBlock(offset: -1 | 1) {
    setSelectedBlock((current) => (current + offset + 9) % 9)
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const backup = parseBackup(JSON.parse(await file.text()))
      if (backup === null) {
        throw new Error(t.invalidBackup)
      }

      const restoredLanguage = backup.language ?? language
      endTextEditSession()
      if (!cellsEqual(cells, backup.cells)) {
        recordChange(cells)
      }
      persistState({
        cells: backup.cells,
        theme: backup.theme,
        language: restoredLanguage,
      })
      // 복원한 보드는 백업 파일과 같으므로 백업된 상태로 본다.
      markBackedUp()
      setSelectedBlock(4)
      setFocusMode(false)
      showNotice({
        message: getTranslation(restoredLanguage).restoreSuccess,
        kind: 'success',
      })
    } catch (error) {
      showNotice({
        message:
          error instanceof Error
            ? error.message
            : t.restoreError,
        kind: 'error',
      })
    } finally {
      event.target.value = ''
    }
  }

  function renderCell(index: number) {
    const cell = cells[index]
    const isHub = index === CENTER_CELL
    const isSynced = isSyncedTitleCell(index)
    const isSubgoal =
      Math.floor(index / 27) === 1 &&
      Math.floor((index % 9) / 3) === 1 &&
      !isHub
    const isAction = isDetailCell(index)
    const syncedSourceIndex = isSynced
      ? (3 + Math.floor(Math.floor(index / 9) / 3)) * 9 +
        3 +
        Math.floor((index % 9) / 3)
      : -1
    const placeholder = isHub
      ? t.hubPlaceholder
      : isSynced
        ? t.areaExamples[CENTER_GOAL_HINT_INDEX[syncedSourceIndex]] ??
          t.linkedPlaceholder
        : isSubgoal
          ? t.areaExamples[CENTER_GOAL_HINT_INDEX[index]] ?? t.goalPlaceholder
          : t.actionPlaceholder
    const cellClass = [
      'mandala-cell',
      isHub ? 'mandala-cell--hub' : '',
      isSubgoal ? 'mandala-cell--subgoal' : '',
      isSynced ? 'mandala-cell--synced' : '',
      cell.done && isAction && hasText(cell) ? 'mandala-cell--done' : '',
    ]
      .filter(Boolean)
      .join(' ')
    // 스크린 리더가 읽을 칸 이름: "3번 블록, 실천 5" (#9)
    const blockIndex = getBlockIndex(index)
    const cellNumber = getCellNumber(index)
    const cellName = t.cellName(
      blockIndex + 1,
      isHub
        ? t.centerGoal
        : isSynced
          ? t.linkedGoal
          : isSubgoal
            ? t.numberedSubgoal(cellNumber ?? 0)
            : t.numberedAction(cellNumber ?? 0),
    )
    const inputLabel =
      isAction && hasText(cell)
        ? `${cellName}, ${cell.done ? t.doneState : t.notDoneState}`
        : cellName

    return (
      <article className={cellClass} key={index}>
        {/* 연동 칸은 직접 고칠 수 없지만, 방향키로 들어가 내용을 읽을 수 있게 readOnly로 둔다. */}
        <textarea
          aria-label={inputLabel}
          className="mandala-cell__input"
          data-cell={index}
          maxLength={70}
          onBlur={endTextEditSession}
          onChange={(event) => updateText(index, event.target.value)}
          onFocus={() => rememberActiveCell(index)}
          onKeyDown={(event) => handleCellKeyDown(event, index)}
          placeholder={placeholder}
          readOnly={isSynced}
          tabIndex={activeCells[blockIndex] === index ? 0 : -1}
          value={cell.text}
        />
        <div className="mandala-cell__footer">
          {isAction ? (
            <span className="cell-caption">{t.action}</span>
          ) : isSynced ? (
            <span className="cell-caption cell-caption--linked">
              <Link2 aria-hidden="true" size={11} />
              {t.linkedGoal}
            </span>
          ) : isHub ? (
            <span className="cell-caption cell-caption--hub">
              <Target aria-hidden="true" size={11} />
              {t.centerGoal}
            </span>
          ) : (
            <span className="cell-caption">{t.subgoal}</span>
          )}
          {isAction && (
            // Tab 정지점을 줄이려고 Tab 순서에서는 뺀다. 키보드는 입력창에서 Ctrl/Cmd+Enter로 체크한다.
            <button
              aria-label={t.markDone(cellName)}
              aria-pressed={hasText(cell) && cell.done}
              className="cell-check"
              disabled={!hasText(cell)}
              onClick={() => toggleDone(index)}
              tabIndex={-1}
              title={!hasText(cell) ? t.completedDisabled : `${t.markDone(cellName)} (${CHECK_SHORTCUT})`}
              type="button"
            >
              {cell.done && <Check aria-hidden="true" size={11} strokeWidth={3} />}
            </button>
          )}
        </div>
      </article>
    )
  }

  // 인쇄 전용 보드. 화면에서는 숨기고 @media print에서만 보인다. (#12)
  function renderPrintSheet() {
    const isBlank = printMode === 'blank'
    const goal = isBlank ? '' : cells[CENTER_CELL].text.trim()
    const printedOn = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : language, {
      dateStyle: 'long',
    }).format(new Date(now))

    return (
      <div aria-hidden="true" className={`print-sheet ${isBlank ? 'print-sheet--blank' : ''}`}>
        <header className="print-sheet__header">
          <div className="print-sheet__goal">
            <span className="print-sheet__label">{t.centerGoal}</span>
            <span className={`print-sheet__goal-text print-sheet__goal-text--${getPrintTextSize(goal)}`}>
              {goal}
            </span>
          </div>
          <div className="print-sheet__meta">
            {!isBlank && (
              <span>
                {t.progressLabel} {progress}% · {t.completedCount(completedCount, writtenCount)}
              </span>
            )}
            <span>{isBlank ? t.printDateBlank : t.printDate(printedOn)}</span>
          </div>
        </header>
        <div className="print-board">
          {buildPrintBlocks(cells, printMode).map((block, blockIndex) => (
            <div className="print-block" key={blockIndex}>
              {block.map((cell) => (
                <div
                  className={`print-cell print-cell--${cell.kind} print-cell--${cell.textSize}`}
                  key={cell.index}
                >
                  {cell.check && (
                    <span className="print-cell__check">
                      {cell.check === 'done' ? '☑' : '☐'}
                    </span>
                  )}
                  <span className="print-cell__text">{cell.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <footer className="print-sheet__footer">{t.footerBrand}</footer>
      </div>
    )
  }

  function renderBlock(blockIndex: number) {
    const rowStart = Math.floor(blockIndex / 3) * 3
    const columnStart = (blockIndex % 3) * 3

    return (
      <section
        aria-label={t.blockRegion(
          blockIndex + 1,
          getBlockTitle(cells, blockIndex, language),
        )}
        className={`mandala-block ${selectedBlock === blockIndex ? 'mandala-block--selected' : ''}`}
        key={blockIndex}
      >
        <div className="mandala-block__heading">
          <span>
            <span className="block-number">{String(blockIndex + 1).padStart(2, '0')}</span>
            <span className="block-title">{getBlockTitle(cells, blockIndex, language)}</span>
          </span>
          {!focusMode && (
            <button
              aria-label={t.expandBlock(getBlockTitle(cells, blockIndex, language))}
              className="block-select"
              onClick={() => enterFocusMode(blockIndex)}
              type="button"
            >
              {t.expand}
            </button>
          )}
        </div>
        <div className="mandala-block__cells">
          {Array.from({ length: 9 }, (_, localIndex) => {
            const row = rowStart + Math.floor(localIndex / 3)
            const column = columnStart + (localIndex % 3)
            return renderCell(row * 9 + column)
          })}
        </div>
      </section>
    )
  }

  // 더보기 메뉴 항목. 순서는 상단 버튼(toolbar-secondary)과 같고, 동작은 runMoreAction에서 처리한다.
  const moreActions: {
    key: MoreActionKey
    label: string
    Icon: LucideIcon
    disabled?: boolean
    dot?: boolean
  }[] = [
    { key: 'png', label: t.pngDownload, Icon: Image, disabled: isExportingPng },
    { key: 'print', label: t.printButton, Icon: Printer },
    { key: 'backup', label: t.backupDownload, Icon: Download, dot: hasUnsavedChanges },
    { key: 'restore', label: t.backupRestore, Icon: Upload },
    ...(pwa.canInstall ? [{ key: 'install' as const, label: t.installApp, Icon: MonitorDown }] : []),
    { key: 'samples', label: t.samples, Icon: LayoutTemplate },
    { key: 'reset', label: t.reset, Icon: RotateCcw },
  ]

  return (
    <main className="app-shell min-h-screen">
      <a
        className="skip-link"
        href="#board"
        onClick={(event) => {
          event.preventDefault()
          focusBoard()
        }}
      >
        {t.skipToBoard}
      </a>
      <header className="topbar">
        <a aria-label={t.homeLabel} className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">nine<span>grid</span></span>
        </a>
        <div className="topbar__actions">
          <button
            className={`toolbar-button toolbar-button--focus ${focusMode ? 'is-active' : ''}`}
            onClick={() => setFocusMode((active) => !active)}
            type="button"
          >
            {focusMode ? (
              <Grid2X2 aria-hidden="true" size={16} />
            ) : (
              <Focus aria-hidden="true" size={16} />
            )}
            <span>{focusMode ? t.showAll : t.focusMode}</span>
          </button>
          <span className="toolbar-divider" />
          <button
            aria-label={t.undo}
            className="icon-button icon-button--history"
            disabled={!canUndo(history)}
            onClick={() => stepHistory('undo')}
            title={`${t.undo} (${UNDO_SHORTCUT})`}
            type="button"
          >
            <Undo2 aria-hidden="true" size={17} />
          </button>
          <button
            aria-label={t.redo}
            className="icon-button icon-button--history"
            disabled={!canRedo(history)}
            onClick={() => stepHistory('redo')}
            title={`${t.redo} (${REDO_SHORTCUT})`}
            type="button"
          >
            <Redo2 aria-hidden="true" size={17} />
          </button>
          <span className="toolbar-divider" />
          <button
            aria-label={t.pngDownload}
            className="icon-button toolbar-secondary"
            disabled={isExportingPng}
            onClick={downloadBoardPng}
            title={t.pngDownload}
            type="button"
          >
            <Image aria-hidden="true" size={17} />
          </button>
          <button
            aria-label={t.printButton}
            className="icon-button toolbar-secondary"
            onClick={openPrintDialog}
            title={t.printButton}
            type="button"
          >
            <Printer aria-hidden="true" size={17} />
          </button>
          <button
            aria-label={backupLabel}
            className="icon-button icon-button--backup toolbar-secondary"
            onClick={downloadBackup}
            title={backupLabel}
            type="button"
          >
            <Download aria-hidden="true" size={17} />
            {hasUnsavedChanges && (
              <span aria-hidden="true" className="unsaved-dot" />
            )}
          </button>
          <button
            aria-label={t.backupRestore}
            className="icon-button toolbar-secondary"
            onClick={openRestorePicker}
            title={t.backupRestore}
            type="button"
          >
            <Upload aria-hidden="true" size={17} />
          </button>
          <input
            accept="application/json,.json"
            aria-label={t.backupFile}
            className="visually-hidden"
            onChange={restoreBackup}
            ref={importInput}
            type="file"
          />
          <button
            aria-label={theme === 'light' ? t.themeToDark : t.themeToLight}
            className="icon-button"
            onClick={() =>
              persistState({
                cells,
                theme: theme === 'light' ? 'dark' : 'light',
                language,
              })
            }
            title={theme === 'light' ? t.themeToDark : t.themeToLight}
            type="button"
          >
            {theme === 'light' ? (
              <Moon aria-hidden="true" size={17} />
            ) : (
              <Sun aria-hidden="true" size={17} />
            )}
          </button>
          <label className="language-picker">
            <span className="visually-hidden">{t.languageLabel}</span>
            <select
              aria-label={t.languageLabel}
              onChange={(event) => {
                if (isLanguage(event.target.value)) {
                  persistState({
                    cells,
                    theme,
                    language: event.target.value,
                  })
                }
              }}
              value={language}
            >
              <option value="ko">KO</option>
              <option value="en">EN</option>
              <option value="ja">JA</option>
              <option value="zh">ZH</option>
            </select>
            <ChevronDown aria-hidden="true" size={12} />
          </label>
          {pwa.canInstall && (
            <button
              aria-label={t.installApp}
              className="icon-button toolbar-secondary"
              onClick={() => void pwa.installApp()}
              title={t.installApp}
              type="button"
            >
              <MonitorDown aria-hidden="true" size={17} />
            </button>
          )}
          <span className="toolbar-divider" />
          <button
            aria-label={t.samples}
            className="icon-button toolbar-secondary"
            onClick={openSampleDialog}
            title={t.samples}
            type="button"
          >
            <LayoutTemplate aria-hidden="true" size={17} />
          </button>
          <button
            aria-label={t.reset}
            className="icon-button icon-button--reset toolbar-secondary"
            onClick={resetBoard}
            title={t.reset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={17} />
          </button>
          {/* 좁은 화면(760px 이하)에서만 보이는 더보기 메뉴. 위의 toolbar-secondary 버튼을 모은다. */}
          <div className="toolbar-more" ref={moreMenu}>
            <button
              aria-controls="toolbar-more-menu"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label={hasUnsavedChanges ? `${t.moreActions} · ${t.unsavedChanges}` : t.moreActions}
              className="icon-button icon-button--backup"
              onClick={() => setMoreOpen((open) => !open)}
              onKeyDown={handleMoreButtonKeyDown}
              ref={moreButton}
              title={t.moreActions}
              type="button"
            >
              <Ellipsis aria-hidden="true" size={17} />
              {hasUnsavedChanges && <span aria-hidden="true" className="unsaved-dot" />}
            </button>
            {moreOpen && (
              <div
                aria-label={t.moreActions}
                className="toolbar-more__menu"
                id="toolbar-more-menu"
                onKeyDown={handleMoreMenuKeyDown}
                role="menu"
                tabIndex={-1}
              >
                {moreActions.map(({ key, label, Icon, disabled, dot }) => (
                  <button
                    className="toolbar-more__item"
                    disabled={disabled}
                    key={key}
                    onClick={() => runMoreAction(key)}
                    role="menuitem"
                    tabIndex={-1}
                    type="button"
                  >
                    <Icon aria-hidden="true" size={17} />
                    <span>{label}</span>
                    {dot && (
                      <>
                        <span className="visually-hidden">{` · ${t.unsavedChanges}`}</span>
                        <span aria-hidden="true" className="toolbar-more__dot" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {pwa.needRefresh && (
        <section
          aria-label={t.updateLabel}
          className="backup-banner backup-banner--info"
          role="status"
        >
          <RefreshCw aria-hidden="true" className="backup-banner__icon" size={16} />
          <p className="backup-banner__message">{t.updateAvailable}</p>
          <div className="backup-banner__actions">
            <button
              className="banner-button banner-button--primary"
              onClick={() => void pwa.applyUpdate()}
              type="button"
            >
              {t.updateNow}
            </button>
            <button className="banner-button" onClick={pwa.dismissUpdate} type="button">
              {t.remindLater}
            </button>
          </div>
        </section>
      )}

      {showStorageNotice ? (
        <section
          aria-label={t.storageNoticeLabel}
          className="backup-banner backup-banner--info"
          role="status"
        >
          <Info aria-hidden="true" className="backup-banner__icon" size={16} />
          <p className="backup-banner__message">{t.storageNotice}</p>
          <div className="backup-banner__actions">
            <button
              className="banner-button banner-button--primary"
              onClick={() =>
                updateBackupMeta((meta) => ({ ...meta, storageNoticeSeen: true }))
              }
              type="button"
            >
              {t.storageNoticeConfirm}
            </button>
          </div>
        </section>
      ) : (
        showBackupReminder && (
          <section
            aria-label={t.backupReminderLabel}
            className="backup-banner backup-banner--warning"
            role="status"
          >
            <Download aria-hidden="true" className="backup-banner__icon" size={16} />
            <p className="backup-banner__message">
              {backupMeta.lastBackupAt === null
                ? t.backupReminderNever
                : t.backupReminderStale(
                    Math.floor((now - backupMeta.lastBackupAt) / (24 * 60 * 60 * 1000)),
                  )}
            </p>
            <div className="backup-banner__actions">
              <button
                className="banner-button banner-button--primary"
                onClick={downloadBackup}
                type="button"
              >
                {t.backupNow}
              </button>
              <button className="banner-button" onClick={snoozeReminder} type="button">
                {t.remindLater}
              </button>
              <button
                className="banner-button banner-button--quiet"
                onClick={() =>
                  updateBackupMeta((meta) => ({ ...meta, remindersOff: true }))
                }
                type="button"
              >
                {t.dontShowAgain}
              </button>
            </div>
          </section>
        )
      )}

      <section aria-label={t.progressLabel} className="overview">
        <div className="overview__intro">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {t.eyebrow}
          </div>
          <h1>{t.headline} <span>{t.headlineAccent}</span></h1>
          <p>{t.intro}</p>
          {!boardHasContent(cells) && (
            <div className="sample-hint">
              <span>{t.samplesHint}</span>
              <button
                className="banner-button banner-button--primary sample-hint__button"
                onClick={openSampleDialog}
                type="button"
              >
                <LayoutTemplate aria-hidden="true" size={14} />
                {t.samplesOpen}
              </button>
            </div>
          )}
        </div>
        <div className="progress-card">
          <div className="progress-card__top">
            <span>{t.progressLabel}</span>
            <span className="progress-percent">{progress}<small>%</small></span>
          </div>
          <div
            aria-label={`${t.progressLabel} ${progress}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            aria-valuetext={`${progress}%, ${t.completedCount(completedCount, writtenCount)}`}
            className="progress-track"
            role="progressbar"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-card__bottom">
            <span>
              {completedCount === 0
                ? t.writtenSummary(writtenCount)
                : t.completedCount(completedCount, writtenCount)}
            </span>
            <span>{t.detailCount}</span>
          </div>
        </div>
      </section>

      <section className={`workspace ${focusMode ? 'workspace--focus' : ''}`}>
        <div className="board-toolbar">
          <div className="board-toolbar__label">
            <span className="board-icon"><Grid2X2 aria-hidden="true" size={15} /></span>
            {focusMode ? (
              <div className="focus-select-wrap">
                <button
                  aria-label={t.previousBlock(
                    getBlockTitle(cells, (selectedBlock + 8) % 9, language),
                  )}
                  className="focus-nav-button"
                  onClick={() => moveFocusBlock(-1)}
                  title={t.previousBlock(
                    getBlockTitle(cells, (selectedBlock + 8) % 9, language),
                  )}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={15} />
                </button>
                <select
                  aria-label={t.editAreaLabel}
                  className="focus-select"
                  onChange={(event) => setSelectedBlock(Number(event.target.value))}
                  value={selectedBlock}
                >
                  {Array.from({ length: 9 }, (_, index) => (
                    <option key={index} value={index}>
                      {`${String(index + 1).padStart(2, '0')} · ${getBlockTitle(cells, index, language)}`}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={14} />
                <button
                  aria-label={t.nextBlock(
                    getBlockTitle(cells, (selectedBlock + 1) % 9, language),
                  )}
                  className="focus-nav-button"
                  onClick={() => moveFocusBlock(1)}
                  title={t.nextBlock(
                    getBlockTitle(cells, (selectedBlock + 1) % 9, language),
                  )}
                  type="button"
                >
                  <ArrowRight aria-hidden="true" size={15} />
                </button>
              </div>
            ) : (
              <span>{t.boardLabel} <span className="board-dim">· {t.boardSize}</span></span>
            )}
          </div>
          <div className="board-toolbar__hint">
            {notice ? (
              <span className={`notice notice--${notice.kind}`}>{notice.message}</span>
            ) : (
              <>
                <span className="autosave-dot" />
                {t.autoSaving}
                <span className="hint-divider">·</span>
                {focusMode ? t.focusModeHint : t.fullModeHint}
              </>
            )}
          </div>
        </div>

        {/* 알림과 달성률 변화를 스크린 리더에 읽어 준다. 내용이 바뀌어야 읽히므로 영역은 항상 둔다. (#9) */}
        <div className="visually-hidden" role="status">
          {notice?.kind === 'success' ? notice.message : notice ? '' : progressAnnouncement}
        </div>
        <div className="visually-hidden" role="alert">
          {notice?.kind === 'error' ? notice.message : ''}
        </div>

        <div
          className={`board-frame ${focusMode ? 'board-frame--focus' : ''}`}
          id="board"
          ref={boardFrame}
        >
          <div
            aria-describedby="board-keyboard-hint"
            aria-label={t.boardLabel}
            className="mandala-board"
            role="group"
          >
            {focusMode ? renderBlock(selectedBlock) : Array.from({ length: 9 }, (_, index) => renderBlock(index))}
          </div>
        </div>

        <div className="board-legend">
          <span><i className="legend-dot legend-dot--goal" /> {t.legendCenter}</span>
          <span><i className="legend-dot legend-dot--linked" /> {t.legendLinked}</span>
          <span><i className="legend-dot legend-dot--action" /> {t.legendAction}</span>
        </div>
        <p className="board-keyboard-hint" id="board-keyboard-hint">
          {t.keyboardHint(CHECK_SHORTCUT)}
        </p>
      </section>

      {/* 바깥(배경) 클릭으로 닫기는 마우스용 보조 동작이다. 키보드는 Esc와 닫기 버튼으로 닫는다. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        aria-labelledby="sample-dialog-title"
        className="sample-dialog"
        onClose={restoreDialogFocus}
        onClick={(event) => {
          // 바깥(배경)을 누르면 닫는다.
          if (event.target === event.currentTarget) {
            closeSampleDialog()
          }
        }}
        ref={sampleDialog}
      >
        <form
          className="sample-dialog__body"
          method="dialog"
          onSubmit={(event) => {
            event.preventDefault()
            loadSample()
          }}
        >
          <div className="sample-dialog__header">
            <h2 id="sample-dialog-title">{t.sampleDialogTitle}</h2>
            <button
              aria-label={t.cancel}
              className="sample-dialog__close"
              onClick={closeSampleDialog}
              title={t.cancel}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
          <p className="sample-dialog__intro">{t.sampleDialogIntro}</p>

          <fieldset className="sample-options">
            <legend className="visually-hidden">{t.sampleChoiceLabel}</legend>
            {SAMPLE_IDS.map((id) => {
              const info = getSampleInfo(id, language)
              const { completedCount, writtenCount } = getProgress(
                loadSampleCells(id, language) ?? [],
              )
              return (
                <label
                  className={`sample-option ${selectedSample === id ? 'is-selected' : ''}`}
                  key={id}
                >
                  <input
                    checked={selectedSample === id}
                    name="sample"
                    onChange={() => setSelectedSample(id)}
                    type="radio"
                    value={id}
                  />
                  <span className="sample-option__text">
                    <span className="sample-option__name">{info.name}</span>
                    <span className="sample-option__description">{info.description}</span>
                    <span className="sample-option__progress">
                      {t.sampleProgress(completedCount, writtenCount)}
                    </span>
                  </span>
                </label>
              )
            })}
          </fieldset>

          {boardHasContent(cells) ? (
            <div className="sample-dialog__warning" role="note">
              <Info aria-hidden="true" size={15} />
              <div>
                <p>{t.sampleOverwrite}</p>
                {hasUnsavedChanges && (
                  <p className="sample-dialog__backup">
                    {t.sampleBackupHint}
                    <button
                      className="banner-button"
                      onClick={downloadBackup}
                      type="button"
                    >
                      <Download aria-hidden="true" size={13} />
                      {t.sampleBackupFirst}
                    </button>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="sample-dialog__note">{t.sampleEmptyBoard}</p>
          )}

          <div className="sample-dialog__actions">
            <button className="banner-button" onClick={closeSampleDialog} type="button">
              {t.cancel}
            </button>
            <button className="banner-button banner-button--primary" type="submit">
              {t.sampleLoad}
            </button>
          </div>
        </form>
      </dialog>

      {/* 바깥(배경) 클릭으로 닫기는 마우스용 보조 동작이다. 키보드는 Esc와 닫기 버튼으로 닫는다. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        aria-labelledby="print-dialog-title"
        className="sample-dialog"
        onClose={restoreDialogFocus}
        onClick={(event) => {
          // 바깥(배경)을 누르면 닫는다.
          if (event.target === event.currentTarget) {
            closePrintDialog()
          }
        }}
        ref={printDialog}
      >
        <form
          className="sample-dialog__body"
          method="dialog"
          onSubmit={(event) => {
            event.preventDefault()
            printBoard()
          }}
        >
          <div className="sample-dialog__header">
            <h2 id="print-dialog-title">{t.printButton}</h2>
            <button
              aria-label={t.cancel}
              className="sample-dialog__close"
              onClick={closePrintDialog}
              title={t.cancel}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
          <p className="sample-dialog__intro">{t.printDialogIntro}</p>

          <fieldset className="sample-options">
            <legend className="visually-hidden">{t.printChoiceLabel}</legend>
            {(
              [
                ['current', t.printCurrent, t.printCurrentDescription],
                ['blank', t.printBlank, t.printBlankDescription],
              ] as const
            ).map(([mode, name, description]) => (
              <label
                className={`sample-option ${printMode === mode ? 'is-selected' : ''}`}
                key={mode}
              >
                <input
                  checked={printMode === mode}
                  name="print-mode"
                  onChange={() => setPrintMode(mode)}
                  type="radio"
                  value={mode}
                />
                <span className="sample-option__text">
                  <span className="sample-option__name">{name}</span>
                  <span className="sample-option__description">{description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <p className="sample-dialog__note">{t.printDeviceHint}</p>

          <div className="sample-dialog__actions">
            <button className="banner-button" onClick={closePrintDialog} type="button">
              {t.cancel}
            </button>
            <button className="banner-button banner-button--primary" type="submit">
              {t.printConfirm}
            </button>
          </div>
        </form>
      </dialog>

      {renderPrintSheet()}

      <footer className="page-footer">
        <span>{t.footerMessage}</span>
        <a
          className="footer-support"
          href={
            language === 'ko'
              ? 'https://ctee.kr/place/veriquest'
              : 'https://ko-fi.com/veriquest'
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          <Coffee aria-hidden="true" size={14} />
          <span>{t.footerSupport}</span>
        </a>
        <span className="footer-brand">{t.footerBrand}</span>
      </footer>
    </main>
  )
}

export default App
