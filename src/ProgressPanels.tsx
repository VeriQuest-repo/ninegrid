// 영역별 달성률과 진척 기록 그래프 (#11)
// 그래프는 라이브러리 없이 SVG로 그린다. 색에만 의존하지 않도록 수치 텍스트와 표(스크린 리더용)를 함께 둔다.
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { BoardCell } from './board'
import type { Language, Translation } from './i18n'
import {
  getAllBlockProgress,
  getChartPoints,
  parseDateKey,
  type BlockProgress,
  type ChartRange,
  type ProgressSnapshot,
} from './progress'

function locale(language: Language) {
  return language === 'zh' ? 'zh-CN' : language
}

function formatDate(key: string, language: Language, withYear = false) {
  const date = parseDateKey(key)
  if (date === null) {
    return key
  }
  return new Intl.DateTimeFormat(locale(language), {
    ...(withYear ? { year: 'numeric' } : {}),
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// 진행 바 하나. 스크린 리더는 이름과 "40%, 완료 2 / 작성 5"처럼 읽는다.
export function BlockMeter({
  block,
  label,
  t,
  className = '',
}: {
  block: BlockProgress
  label: string
  t: Translation
  className?: string
}) {
  const empty = block.progress === null
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={block.progress ?? 0}
      aria-valuetext={
        empty
          ? t.blockNoPractice
          : `${block.progress}%, ${t.completedCount(block.completedCount, block.writtenCount)}`
      }
      className={`block-meter ${empty ? 'block-meter--empty' : ''} ${className}`}
      role="progressbar"
    >
      <span style={{ width: `${block.progress ?? 0}%` }} />
    </div>
  )
}

export function BlockProgressList({
  cells,
  t,
  getTitle,
  onSelect,
}: {
  cells: BoardCell[]
  t: Translation
  getTitle: (blockIndex: number) => string
  onSelect: (blockIndex: number) => void
}) {
  return (
    <section aria-labelledby="block-progress-title" className="insight-card">
      <div className="insight-card__head">
        <h2 id="block-progress-title">{t.blockProgressTitle}</h2>
      </div>
      <p className="insight-card__hint">{t.blockProgressHint}</p>
      <ul className="block-progress-list">
        {getAllBlockProgress(cells).map((block) => {
          const title = getTitle(block.blockIndex)
          return (
            <li key={block.blockIndex}>
              <button
                aria-label={t.expandBlock(title)}
                className="block-progress-list__name"
                onClick={() => onSelect(block.blockIndex)}
                type="button"
              >
                <span className="block-number">
                  {String(block.blockIndex + 1).padStart(2, '0')}
                </span>
                <span className="block-progress-list__title">{title}</span>
              </button>
              <BlockMeter block={block} label={t.blockProgressLabel(title)} t={t} />
              <span className="block-progress-list__value" aria-hidden="true">
                {block.progress === null ? (
                  <span className="block-progress-list__empty">{t.blockNoPractice}</span>
                ) : (
                  <>
                    <strong>{block.progress}%</strong>
                    <span>{t.completedCount(block.completedCount, block.writtenCount)}</span>
                  </>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// 그래프는 실제 폭에 맞춰 그려 글자 크기가 화면 폭에 따라 커지거나 작아지지 않게 한다.
const DEFAULT_CHART_WIDTH = 320
const CHART_HEIGHT = 132
const PAD_TOP = 10
const PAD_BOTTOM = 18
const PAD_LEFT = 34
const PAD_RIGHT = 38

export function ProgressHistoryChart({
  history,
  current,
  language,
  t,
}: {
  history: ProgressSnapshot[]
  current: ProgressSnapshot
  language: Language
  t: Translation
}) {
  const [range, setRange] = useState<ChartRange>('4w')
  const [hovered, setHovered] = useState<number | null>(null)
  const [chartWidth, setChartWidth] = useState(DEFAULT_CHART_WIDTH)
  const chartBox = useRef<HTMLDivElement>(null)
  const CHART_WIDTH = chartWidth

  useEffect(() => {
    const box = chartBox.current
    if (box === null || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      if (width > 0) {
        setChartWidth(width)
      }
    })
    observer.observe(box)
    return () => observer.disconnect()
  }, [])
  const points = getChartPoints(history, current, range)
  const rangeLabel = range === '4w' ? t.historyRange4w : t.historyRangeAll

  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM
  const x = (index: number) =>
    PAD_LEFT + (points.length <= 1 ? plotWidth : (index / (points.length - 1)) * plotWidth)
  const y = (value: number) => PAD_TOP + plotHeight - (value / 100) * plotHeight

  const first = points[0]
  const last = points.at(-1)
  const line = points.map((point, index) => `${x(index)},${y(point.progress)}`).join(' ')
  const area =
    points.length > 1
      ? `M${x(0)},${y(0)} L${points
          .map((point, index) => `${x(index)},${y(point.progress)}`)
          .join(' L')} L${x(points.length - 1)},${y(0)} Z`
      : ''

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (points.length === 0) {
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const relative = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH
    const ratio = (relative - PAD_LEFT) / plotWidth
    const index = Math.round(ratio * (points.length - 1))
    setHovered(Math.min(points.length - 1, Math.max(0, index)))
  }

  const active = hovered !== null ? points[hovered] : undefined

  return (
    <section aria-labelledby="history-title" className="insight-card">
      <div className="insight-card__head">
        <h2 id="history-title">{t.historyTitle}</h2>
        <div aria-label={t.historyRangeLabel} className="range-toggle" role="group">
          {(['4w', 'all'] as const).map((value) => (
            <button
              aria-pressed={range === value}
              key={value}
              onClick={() => {
                setRange(value)
                setHovered(null)
              }}
              type="button"
            >
              {value === '4w' ? t.historyRange4w : t.historyRangeAll}
            </button>
          ))}
        </div>
      </div>

      <div className="history-chart-box" ref={chartBox}>
        {first === undefined || last === undefined ? (
          <p className="insight-card__hint history-empty">{t.historyEmpty}</p>
        ) : (
          <>
            <p className="history-summary">
              {points.length === 1
                ? t.historyFirstDay(last.progress)
                : t.historySummary(first.progress, last.progress, points.length)}
            </p>
            <div className="history-chart">
              <svg
                aria-label={t.historyChartLabel(
                  rangeLabel,
                  first.progress,
                  last.progress,
                  formatDate(first.date, language, true),
                  formatDate(last.date, language, true),
                )}
                onPointerLeave={() => setHovered(null)}
                onPointerMove={handlePointerMove}
                role="img"
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              >
                {[0, 50, 100].map((value) => (
                  <g key={value}>
                    <line
                      className="history-chart__grid"
                      x1={PAD_LEFT}
                      x2={PAD_LEFT + plotWidth}
                      y1={y(value)}
                      y2={y(value)}
                    />
                    <text className="history-chart__axis" textAnchor="end" x={PAD_LEFT - 5} y={y(value) + 3}>
                      {value}%
                    </text>
                  </g>
                ))}
                {area !== '' && <path className="history-chart__area" d={area} />}
                {points.length > 1 && <polyline className="history-chart__line" points={line} />}
                {active !== undefined && hovered !== null && (
                  <line
                    className="history-chart__cursor"
                    x1={x(hovered)}
                    x2={x(hovered)}
                    y1={PAD_TOP}
                    y2={PAD_TOP + plotHeight}
                  />
                )}
                <circle
                  className="history-chart__dot"
                  cx={x(hovered ?? points.length - 1)}
                  cy={y((active ?? last).progress)}
                  r={4}
                />
                {hovered === null && (
                  <text
                    className="history-chart__value"
                    x={x(points.length - 1) + 7}
                    y={y(last.progress) + 3}
                  >
                    {last.progress}%
                  </text>
                )}
                <text className="history-chart__axis" x={PAD_LEFT} y={CHART_HEIGHT - 4}>
                  {formatDate(first.date, language)}
                </text>
                <text
                  className="history-chart__axis"
                  textAnchor="end"
                  x={PAD_LEFT + plotWidth}
                  y={CHART_HEIGHT - 4}
                >
                  {formatDate(last.date, language)}
                </text>
              </svg>
              {active !== undefined && hovered !== null && (
                <div
                  aria-hidden="true"
                  className="history-chart__tooltip"
                  style={{
                    left: `${(x(hovered) / CHART_WIDTH) * 100}%`,
                    transform: `translateX(${hovered > (points.length - 1) / 2 ? '-100%' : '0'})`,
                  }}
                >
                  <strong>{formatDate(active.date, language, true)}</strong>
                  <span>
                    {active.progress}% · {t.completedCount(active.completedCount, active.writtenCount)}
                  </span>
                </div>
              )}
            </div>
            <table className="visually-hidden">
              <caption>{`${t.historyTableCaption} (${rangeLabel})`}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.historyDateColumn}</th>
                  <th scope="col">{t.historyProgressColumn}</th>
                  <th scope="col">{t.historyCountColumn}</th>
                </tr>
              </thead>
              <tbody>
                {/* 값이 바뀐 날만 읽는다. (기록이 없는 날은 앞 기록을 이어 그린 값) */}
                {points
                  .filter(
                    (point, index) =>
                      index === 0 ||
                      index === points.length - 1 ||
                      point.progress !== points[index - 1].progress ||
                      point.completedCount !== points[index - 1].completedCount ||
                      point.writtenCount !== points[index - 1].writtenCount,
                  )
                  .map((point) => (
                    <tr key={point.date}>
                      <td>{formatDate(point.date, language, true)}</td>
                      <td>{point.progress}%</td>
                      <td>{`${point.completedCount} / ${point.writtenCount}`}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <p className="insight-card__note">{t.historyNote}</p>
    </section>
  )
}
