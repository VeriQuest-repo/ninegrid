import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Coffee,
  Download,
  Image,
  Focus,
  Info,
  Grid2X2,
  LayoutTemplate,
  Link2,
  MonitorDown,
  Moon,
  Redo2,
  RefreshCw,
  RotateCcw,
  Sun,
  Target,
  Undo2,
  Upload,
  X,
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
  // 홈 화면 설치와 새 버전 안내 (#6)
  const pwa = usePwa({
    onOfflineReady: () => setNotice({ message: t.offlineReady, kind: 'success' }),
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
        sampleDialog.current?.open
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
      setNotice({
        message: t.saveError,
        kind: 'error',
      })
    }
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
    setNotice({ message: t.resetSuccess, kind: 'success' })
  }

  function openSampleDialog() {
    endTextEditSession()
    sampleDialog.current?.showModal()
  }

  function closeSampleDialog() {
    sampleDialog.current?.close()
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
    setNotice({
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
    setNotice({ message: t.backupSuccess, kind: 'success' })
  }

  async function downloadBoardPng() {
    const frame = boardFrame.current
    const captureTarget = focusMode
      ? frame?.querySelector<HTMLElement>('.mandala-block')
      : frame

    if (!captureTarget) {
      setNotice({ message: t.pngNoBoard, kind: 'error' })
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
            setNotice({ message: t.pngSuccess, kind: 'success' })
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
      setNotice({ message: t.pngSuccess, kind: 'success' })
    } catch (error) {
      setNotice({
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
      setNotice({
        message: getTranslation(restoredLanguage).restoreSuccess,
        kind: 'success',
      })
    } catch (error) {
      setNotice({
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

    return (
      <article className={cellClass} key={index}>
        <textarea
          aria-label={
            isHub
              ? t.centerGoal
              : isSynced
                ? t.linkedGoal
                : isSubgoal
                  ? t.subgoal
                  : t.action
          }
          className="mandala-cell__input"
          disabled={isSynced}
          maxLength={70}
          onBlur={endTextEditSession}
          onChange={(event) => updateText(index, event.target.value)}
          placeholder={placeholder}
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
            <button
              aria-disabled={!hasText(cell)}
              aria-label={
                !hasText(cell)
                  ? t.completedDisabled
                  : cell.done
                    ? t.undoCompleted
                    : t.completed
              }
              aria-pressed={cell.done}
              className="cell-check"
              disabled={!hasText(cell)}
              onClick={() => toggleDone(index)}
              title={!hasText(cell) ? t.completedDisabled : undefined}
              type="button"
            >
              {cell.done && <Check aria-hidden="true" size={11} strokeWidth={3} />}
            </button>
          )}
        </div>
      </article>
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
              onClick={() => {
                setSelectedBlock(blockIndex)
                setFocusMode(true)
              }}
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

  return (
    <main className="app-shell min-h-screen">
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
            {focusMode ? <Grid2X2 size={16} /> : <Focus size={16} />}
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
            className="icon-button"
            disabled={isExportingPng}
            onClick={downloadBoardPng}
            title={t.pngDownload}
            type="button"
          >
            <Image aria-hidden="true" size={17} />
          </button>
          <button
            aria-label={backupLabel}
            className="icon-button icon-button--backup"
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
            className="icon-button"
            onClick={() => importInput.current?.click()}
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
              className="icon-button"
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
            className="icon-button"
            onClick={openSampleDialog}
            title={t.samples}
            type="button"
          >
            <LayoutTemplate aria-hidden="true" size={17} />
          </button>
          <button
            aria-label={t.reset}
            className="icon-button icon-button--reset"
            onClick={resetBoard}
            title={t.reset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={17} />
          </button>
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
          <div aria-live="polite" className="board-toolbar__hint">
            {notice ? (
              <span className={`notice notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
                {notice.message}
              </span>
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

        <div
          className={`board-frame ${focusMode ? 'board-frame--focus' : ''}`}
          ref={boardFrame}
        >
          <div className="mandala-board">
            {focusMode ? renderBlock(selectedBlock) : Array.from({ length: 9 }, (_, index) => renderBlock(index))}
          </div>
        </div>

        <div className="board-legend">
          <span><i className="legend-dot legend-dot--goal" /> {t.legendCenter}</span>
          <span><i className="legend-dot legend-dot--linked" /> {t.legendLinked}</span>
          <span><i className="legend-dot legend-dot--action" /> {t.legendAction}</span>
        </div>
      </section>

      <dialog
        aria-labelledby="sample-dialog-title"
        className="sample-dialog"
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
