import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { calculateTotal, calculateCount, saveCartToStorage, loadCartFromStorage } from '../cartUtils'
import type { CartItem } from '@/types'

describe('calculateTotal', () => {
  it('TC-FE-001: 빈 배열이면 0 반환', () => {
    expect(calculateTotal([])).toBe(0)
  })

  it('TC-FE-002: 단일 항목 총액 계산', () => {
    const items: CartItem[] = [
      { menuId: 1, menuName: '아메리카노', price: 10000, quantity: 2 },
    ]
    expect(calculateTotal(items)).toBe(20000)
  })

  it('TC-FE-003: 복수 항목 총액 계산', () => {
    const items: CartItem[] = [
      { menuId: 1, menuName: '아메리카노', price: 5000, quantity: 1 },
      { menuId: 2, menuName: '라떼', price: 3000, quantity: 3 },
    ]
    expect(calculateTotal(items)).toBe(14000)
  })
})

describe('calculateCount', () => {
  it('TC-FE-004: 빈 배열이면 0 반환', () => {
    expect(calculateCount([])).toBe(0)
  })

  it('TC-FE-005: 복수 항목 수량 합산', () => {
    const items: CartItem[] = [
      { menuId: 1, menuName: '아메리카노', price: 5000, quantity: 2 },
      { menuId: 2, menuName: '라떼', price: 3000, quantity: 3 },
    ]
    expect(calculateCount(items)).toBe(5)
  })
})

describe('localStorage 유틸', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('saveCartToStorage / loadCartFromStorage 왕복 저장', () => {
    const items: CartItem[] = [
      { menuId: 1, menuName: '아메리카노', price: 5000, quantity: 2 },
    ]
    saveCartToStorage(items)
    const loaded = loadCartFromStorage()
    expect(loaded).toEqual(items)
  })

  it('저장된 데이터 없으면 빈 배열 반환', () => {
    const loaded = loadCartFromStorage()
    expect(loaded).toEqual([])
  })
})
