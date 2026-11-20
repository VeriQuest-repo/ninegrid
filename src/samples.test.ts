import { describe, expect, it } from 'vitest'
import {
  CELL_COUNT,
  CENTER_CELL,
  getProgress,
  getSyncTarget,
  hasText,
  isDetailCell,
  normalizeCells,
  parseBackup,
} from './board'
import type { Language } from './i18n'
import {
  SAMPLE_IDS,
  SUBGOAL_CELLS,
  buildSampleBackup,
  getSampleInfo,
  loadSampleCells,
} from './samples'

const LANGUAGES: Language[] = ['ko', 'en', 'ja', 'zh']
// 칸 입력창의 maxLength와 같다 (App.tsx)
const CELL_MAX_LENGTH = 70

describe('sample boards', () => {
  it('provides at least two samples', () => {
    expect(SAMPLE_IDS.length).toBeGreaterThanOrEqual(2)
  })

  for (const id of SAMPLE_IDS) {
    for (const language of LANGUAGES) {
      describe(`${id} (${language})`, () => {
        const backup = buildSampleBackup(id, language)
        const cells = loadSampleCells(id, language)

        it('is a valid JSON backup', () => {
          // JSON 문자열로 저장했다가 읽어도 그대로 통과해야 한다.
          const parsed = parseBackup(JSON.parse(JSON.stringify(backup)))
          expect(parsed).not.toBeNull()
          expect(parsed?.language).toBe(language)
          expect(cells).not.toBeNull()
        })

        it('fills all 81 cells within the input length limit', () => {
          expect(cells).toHaveLength(CELL_COUNT)
          cells?.forEach((cell) => {
            expect(hasText(cell)).toBe(true)
            expect(cell.text.length).toBeLessThanOrEqual(CELL_MAX_LENGTH)
          })
        })

        it('links the 8 center subgoals to the outer block titles', () => {
          for (const index of SUBGOAL_CELLS) {
            const target = getSyncTarget(index)
            expect(target).not.toBeNull()
            expect(backup.cells[target as number].text).toBe(backup.cells[index].text)
          }
          // 이미 규칙에 맞는 데이터라 정리해도 바뀌지 않는다.
          expect(normalizeCells(backup.cells)).toEqual(backup.cells)
        })

        it('checks only written practice cells, and only some of them', () => {
          backup.cells.forEach((cell, index) => {
            if (cell.done) {
              expect(isDetailCell(index)).toBe(true)
              expect(hasText(cell)).toBe(true)
            }
          })
          expect(backup.cells[CENTER_CELL].done).toBe(false)

          const { writtenCount, completedCount, progress } = getProgress(cells ?? [])
          expect(writtenCount).toBe(64)
          expect(completedCount).toBeGreaterThan(0)
          expect(completedCount).toBeLessThan(writtenCount)
          expect(progress).toBe(Math.round((completedCount / 64) * 100))
        })

        it('has unique practice texts within the board', () => {
          const actions = backup.cells
            .filter((_, index) => isDetailCell(index))
            .map((cell) => cell.text)
          expect(new Set(actions).size).toBe(actions.length)
        })

        it('has a name and description', () => {
          const info = getSampleInfo(id, language)
          expect(info.name.trim()).not.toBe('')
          expect(info.description.trim()).not.toBe('')
        })
      })
    }

    it(`${id} has the same progress in every language`, () => {
      const results = LANGUAGES.map((language) =>
        getProgress(loadSampleCells(id, language) ?? []),
      )
      results.forEach((result) => expect(result).toEqual(results[0]))
    })
  }
})
