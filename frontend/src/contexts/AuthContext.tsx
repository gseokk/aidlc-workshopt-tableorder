import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { TableAuthConfig, TableAuthState, AdminAuthState } from '@/types'
import {
  isTokenExpired,
  loadAdminAuth,
  loadTableAuth,
  saveAdminAuth,
  saveTableAuth,
  clearAdminAuth,
  clearTableAuth,
} from '@/utils/authUtils'

interface AuthContextValue {
  tableAuth: TableAuthState | null
  adminAuth: AdminAuthState | null
  isAuthLoading: boolean
  setupTable(config: TableAuthConfig): Promise<void>
  adminLogin(storeIdentifier: string, username: string, password: string): Promise<void>
  adminLogout(): void
  isAdminTokenExpired(): boolean
  clearTableAuthState(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tableAuth, setTableAuth] = useState<TableAuthState | null>(null)
  const [adminAuth, setAdminAuth] = useState<AdminAuthState | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    setTableAuth(loadTableAuth())
    setAdminAuth(loadAdminAuth())
    setIsAuthLoading(false)
  }, [])

  const setupTable = async (config: TableAuthConfig): Promise<void> => {
    // customerApi.tableLogin 호출 (서비스 레이어에서 주입)
    // 여기서는 import를 피하고 외부에서 주입받는 패턴 대신 직접 import
    const { tableLogin } = await import('@/services/customerApi')
    const auth = await tableLogin(config)
    saveTableAuth(auth)
    setTableAuth(auth)
  }

  const adminLogin = async (
    storeIdentifier: string,
    username: string,
    password: string
  ): Promise<void> => {
    const { adminLogin: apiAdminLogin } = await import('@/services/adminApi')
    const auth = await apiAdminLogin(storeIdentifier, username, password)
    saveAdminAuth(auth)
    setAdminAuth(auth)
  }

  const adminLogout = () => {
    clearAdminAuth()
    setAdminAuth(null)
  }

  const isAdminTokenExpiredFn = (): boolean => {
    if (!adminAuth) return true
    return isTokenExpired(adminAuth.expiresAt)
  }

  const clearTableAuthState = () => {
    clearTableAuth()
    setTableAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        tableAuth,
        adminAuth,
        isAuthLoading,
        setupTable,
        adminLogin,
        adminLogout,
        isAdminTokenExpired: isAdminTokenExpiredFn,
        clearTableAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
