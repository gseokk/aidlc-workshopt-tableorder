import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { saveAdminAuth } from '@/utils/authUtils'
import type { AdminAuthState } from '@/types'

function TestComponent() {
  const { isAdminTokenExpired } = useAuth()
  return <span data-testid="expired">{String(isAdminTokenExpired())}</span>
}

describe('AuthContext - isAdminTokenExpired', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('TC-FE-015: 만료된 관리자 토큰 감지', () => {
    const auth: AdminAuthState = {
      token: 'jwt',
      storeId: 1,
      storeName: '매장',
      expiresAt: Date.now() - 1000,
    }
    saveAdminAuth(auth)
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('expired').textContent).toBe('true')
  })

  it('TC-FE-016: 유효한 관리자 토큰', () => {
    const auth: AdminAuthState = {
      token: 'jwt',
      storeId: 1,
      storeName: '매장',
      expiresAt: Date.now() + 3_600_000,
    }
    saveAdminAuth(auth)
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('expired').textContent).toBe('false')
  })
})
