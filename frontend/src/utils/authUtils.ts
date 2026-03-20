import type { AdminAuthState, TableAuthState } from '@/types'

const ADMIN_AUTH_KEY = 'adminAuth'
const TABLE_AUTH_KEY = 'tableAuthToken'
const TABLE_CONFIG_KEY = 'tableAuthConfig'

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt
}

export function loadAdminAuth(): AdminAuthState | null {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY)
    return raw ? (JSON.parse(raw) as AdminAuthState) : null
  } catch {
    return null
  }
}

export function loadTableAuth(): TableAuthState | null {
  try {
    const raw = localStorage.getItem(TABLE_AUTH_KEY)
    return raw ? (JSON.parse(raw) as TableAuthState) : null
  } catch {
    return null
  }
}

export function saveAdminAuth(auth: AdminAuthState): void {
  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(auth))
}

export function clearAdminAuth(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY)
}

export function saveTableAuth(auth: TableAuthState): void {
  localStorage.setItem(TABLE_AUTH_KEY, JSON.stringify(auth))
}

export function clearTableAuth(): void {
  localStorage.removeItem(TABLE_AUTH_KEY)
  localStorage.removeItem(TABLE_CONFIG_KEY)
}
