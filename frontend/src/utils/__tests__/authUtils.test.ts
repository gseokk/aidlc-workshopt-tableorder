import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isTokenExpired, loadAdminAuth, loadTableAuth, saveAdminAuth, saveTableAuth } from '../authUtils'
import type { AdminAuthState, TableAuthState } from '@/types'

describe('isTokenExpired', () => {
  it('TC-FE-006: 만료된 토큰 감지', () => {
    const pastTime = Date.now() - 1000
    expect(isTokenExpired(pastTime)).toBe(true)
  })

  it('TC-FE-007: 유효한 토큰 감지', () => {
    const futureTime = Date.now() + 3_600_000
    expect(isTokenExpired(futureTime)).toBe(false)
  })
})

describe('loadAdminAuth / loadTableAuth', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('저장된 관리자 인증 정보 복원', () => {
    const auth: AdminAuthState = {
      token: 'jwt-token',
      storeId: 1,
      storeName: '테스트 매장',
      expiresAt: Date.now() + 3_600_000,
    }
    saveAdminAuth(auth)
    expect(loadAdminAuth()).toEqual(auth)
  })

  it('관리자 인증 정보 없으면 null 반환', () => {
    expect(loadAdminAuth()).toBeNull()
  })

  it('저장된 테이블 인증 정보 복원', () => {
    const auth: TableAuthState = {
      token: 'table-token',
      storeId: 1,
      tableId: 10,
      tableNumber: 3,
      storeName: '테스트 매장',
    }
    saveTableAuth(auth)
    expect(loadTableAuth()).toEqual(auth)
  })

  it('테이블 인증 정보 없으면 null 반환', () => {
    expect(loadTableAuth()).toBeNull()
  })
})
