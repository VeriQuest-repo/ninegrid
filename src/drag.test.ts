import { describe, expect, it } from 'vitest'
import { isDetailCell } from './board'
import {
  AUTO_SCROLL_EDGE,
  AUTO_SCROLL_MAX_STEP,
  OUTER_BLOCKS,
  getActionCells,
  getAutoScrollDelta,
  hasMovedEnough,
} from './drag'
import { getBlockIndex } from './keyboard'

describe('드래그 시작 판정', () => {
  it('조금만 움직이면 드래그가 아니라 탭으로 본다', () => {
    expect(hasMovedEnough(100, 100, 102, 103)).toBe(false)
    expect(hasMovedEnough(100, 100, 106, 100)).toBe(true)
    expect(hasMovedEnough(100, 100, 95, 95)).toBe(true)
  })
})

describe('가장자리 자동 스크롤', () => {
  const height = 800

  it('가운데에서는 스크롤하지 않는다', () => {
    expect(getAutoScrollDelta(400, height)).toBe(0)
    expect(getAutoScrollDelta(AUTO_SCROLL_EDGE, height)).toBe(0)
    expect(getAutoScrollDelta(height - AUTO_SCROLL_EDGE, height)).toBe(0)
  })

  it('위쪽 가장자리는 위로, 아래쪽 가장자리는 아래로 스크롤한다', () => {
    expect(getAutoScrollDelta(10, height)).toBeLessThan(0)
    expect(getAutoScrollDelta(height - 10, height)).toBeGreaterThan(0)
  })

  it('가장자리에 가까울수록 빠르고, 최대 속도를 넘지 않는다', () => {
    expect(Math.abs(getAutoScrollDelta(5, height))).toBeGreaterThan(
      Math.abs(getAutoScrollDelta(40, height)),
    )
    expect(getAutoScrollDelta(-50, height)).toBe(-AUTO_SCROLL_MAX_STEP)
    expect(getAutoScrollDelta(height + 50, height)).toBe(AUTO_SCROLL_MAX_STEP)
  })
})

describe('블록의 실천 칸', () => {
  it('바깥 블록마다 제목 칸을 뺀 실천 칸 8개를 돌려준다', () => {
    OUTER_BLOCKS.forEach((block) => {
      const cells = getActionCells(block)
      expect(cells).toHaveLength(8)
      cells.forEach((index) => {
        expect(isDetailCell(index)).toBe(true)
        expect(getBlockIndex(index)).toBe(block)
      })
    })
  })

  it('가운데 블록에는 실천 칸이 없다', () => {
    expect(getActionCells(4)).toEqual([])
  })

  it('바깥 블록 8개의 실천 칸을 모으면 64칸이다', () => {
    expect(new Set(OUTER_BLOCKS.flatMap(getActionCells)).size).toBe(64)
  })
})
