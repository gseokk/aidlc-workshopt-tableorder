import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { SseProvider } from '@/contexts/SseContext'
import type { ReactNode } from 'react'

// 고객 페이지 (메인 청크)
import { TableSetupPage } from '@/pages/customer/TableSetupPage'
import { MenuPage } from '@/pages/customer/MenuPage'
import { OrderConfirmPage } from '@/pages/customer/OrderConfirmPage'
import { CustomerOrderHistoryPage } from '@/pages/customer/CustomerOrderHistoryPage'

// 관리자 페이지 (별도 청크 - Code Splitting)
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
)
const DashboardPage = lazy(() =>
  import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const MenuManagePage = lazy(() =>
  import('@/pages/admin/MenuManagePage').then((m) => ({ default: m.MenuManagePage }))
)
const AdminOrderHistoryPage = lazy(() =>
  import('@/pages/admin/AdminOrderHistoryPage').then((m) => ({ default: m.AdminOrderHistoryPage }))
)

function PrivateRoute({ children }: { children: ReactNode }) {
  const { tableAuth, isAuthLoading } = useAuth()
  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  return tableAuth ? <>{children}</> : <Navigate to="/setup" replace />
}

function AdminPrivateRoute({ children }: { children: ReactNode }) {
  const { adminAuth, isAdminTokenExpired, isAuthLoading } = useAuth()
  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  if (!adminAuth || isAdminTokenExpired()) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SseProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
        {children}
      </Suspense>
    </SseProvider>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/menu" replace /> },
  { path: '/setup', element: <TableSetupPage /> },
  {
    path: '/menu',
    element: <PrivateRoute><MenuPage /></PrivateRoute>,
  },
  {
    path: '/order/confirm',
    element: <PrivateRoute><OrderConfirmPage /></PrivateRoute>,
  },
  {
    path: '/orders',
    element: <PrivateRoute><CustomerOrderHistoryPage /></PrivateRoute>,
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={null}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminPrivateRoute>
        <AdminLayout>
          <DashboardPage />
        </AdminLayout>
      </AdminPrivateRoute>
    ),
  },
  {
    path: '/admin/menus',
    element: (
      <AdminPrivateRoute>
        <AdminLayout>
          <MenuManagePage />
        </AdminLayout>
      </AdminPrivateRoute>
    ),
  },
  {
    path: '/admin/orders/history',
    element: (
      <AdminPrivateRoute>
        <AdminLayout>
          <AdminOrderHistoryPage />
        </AdminLayout>
      </AdminPrivateRoute>
    ),
  },
])
