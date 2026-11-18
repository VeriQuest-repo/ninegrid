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
  Grid2X2,
  Link2,
  Moon,
  RotateCcw,
  Sun,
  Target,
  Upload,
} from 'lucide-react'
import { toBlob, toPng } from 'html-to-image'
import { detectLanguage, getTranslation, isLanguage, type Language } from './i18n'
import './App.css'

const STORAGE_KEY = 'ninegrid-board-v1'
const CELL_COUNT = 81
const DETAIL_COUNT = 64
const CENTER_CELL = 40
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
const THEME_COLORS: Record<Theme, string> = {
  light: '#f4f5f1',
  dark: '#171d1b',
}

type BoardCell = {
  text: string
  done: boolean
}

type Theme = 'light' | 'dark'

type PersistedState = {
  cells: BoardCell[]
  theme: Theme
  language: Language
}

type Notice = {
  message: string
  kind: 'success' | 'error'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBoardCellArray(value: unknown): value is BoardCell[] {
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

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function normalizeSyncedTitles(cells: BoardCell[]) {
  const nextCells = cells.map((cell) => ({ ...cell }))

  for (let index = 0; index < CELL_COUNT; index += 1) {
    const target = getSyncTarget(index)
    if (target !== null) {
      nextCells[target] = { ...nextCells[target], text: nextCells[index].text }
    }
  }

  return nextCells
}

function isPersistedState(value: unknown): value is PersistedState {
  return (
    isRecord(value) &&
    isBoardCellArray(value.cells) &&
    isTheme(value.theme) &&
    (!('language' in value) || isLanguage(value.language))
  )
}

function createInitialCells(): BoardCell[] {
  return Array.from({ length: CELL_COUNT }, () => ({
    text: '',
    done: false,
  }))
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
        cells: normalizeSyncedTitles(parsed.cells),
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

function getSyncTarget(index: number): number | null {
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

function isSyncedTitleCell(index: number) {
  const row = Math.floor(index / 9)
  const column = index % 9
  const blockIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3)

  return blockIndex !== 4 && row % 3 === 1 && column % 3 === 1
}

function isDetailCell(index: number) {
  const row = Math.floor(index / 9)
  const column = index % 9
  const blockIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3)

  return blockIndex !== 4 && !isSyncedTitleCell(index)
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

  const completedCount = cells.reduce(
    (count, cell, index) => count + (isDetailCell(index) && cell.done ? 1 : 0),
    0,
  )
  const progress = Math.round((completedCount / DETAIL_COUNT) * 100)

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

  function updateText(index: number, text: string) {
    const next = cells.map((cell) => ({ ...cell }))
    next[index] = { ...next[index], text }

    const target = getSyncTarget(index)
    if (target !== null) {
      next[target] = { ...next[target], text }
    }

    persistState({ cells: next, theme, language })
  }

  function toggleDone(index: number) {
    if (!isDetailCell(index)) {
      return
    }

    persistState({
      cells: cells.map((cell, cellIndex) =>
        cellIndex === index ? { ...cell, done: !cell.done } : cell,
      ),
      theme,
      language,
    })
  }

  function resetBoard() {
    if (!window.confirm(t.resetConfirm)) {
      return
    }

    persistState({ cells: createInitialCells(), theme, language })
    setSelectedBlock(4)
    setFocusMode(false)
    setNotice({ message: t.resetSuccess, kind: 'success' })
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
      const parsed: unknown = JSON.parse(await file.text())
      if (
        !isRecord(parsed) ||
        parsed.format !== 'ninegrid-backup' ||
        parsed.version !== 1 ||
        !isBoardCellArray(parsed.cells) ||
        !isTheme(parsed.theme) ||
        ('language' in parsed && !isLanguage(parsed.language))
      ) {
        throw new Error(t.invalidBackup)
      }

      const restoredLanguage = isLanguage(parsed.language)
        ? parsed.language
        : language
      persistState({
        cells: normalizeSyncedTitles(parsed.cells),
        theme: parsed.theme,
        language: restoredLanguage,
      })
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
      cell.done && isAction ? 'mandala-cell--done' : '',
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
              aria-label={cell.done ? t.undoCompleted : t.completed}
              aria-pressed={cell.done}
              className="cell-check"
              onClick={() => toggleDone(index)}
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
            aria-label={t.backupDownload}
            className="icon-button"
            onClick={downloadBackup}
            title={t.backupDownload}
            type="button"
          >
            <Download aria-hidden="true" size={17} />
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
          <span className="toolbar-divider" />
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

      <section aria-label={t.progressLabel} className="overview">
        <div className="overview__intro">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {t.eyebrow}
          </div>
          <h1>{t.headline} <span>{t.headlineAccent}</span></h1>
          <p>{t.intro}</p>
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
            <span>{t.completedCount(completedCount, DETAIL_COUNT)}</span>
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
