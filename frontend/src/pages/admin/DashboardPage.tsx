import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSse } from '@/contexts/SseContext'
import { TableCard } from '@/components/admin/TableCard'
import { OrderDetailModal } from '@/components/admin/OrderDetailModal'
import { getAllTableOrders } from '@/services/adminApi'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { adminAuth, adminLogout } = useAuth()
  const { tableOrderSummaries, newOrderTableIds, connect, disconnect, setInitialSummaries } = useSse()
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuth) return

    getAllTableOrders().then((summaries) => {
      setInitialSummaries(summaries.map((s) => ({ ...s, hasNewOrder: false })))
    })

    connect(adminAuth.storeId)

    return () => {
      disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAuth?.storeId])

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">주문 대시보드</h1>
        <div className="flex gap-2">
          <button
            data-testid="nav-menu-manage"
            onClick={() => navigate('/admin/menus')}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg min-h-[44px]"
          >
            메뉴 관리
          </button>
          <button
            data-testid="nav-order-history"
            onClick={() => navigate('/admin/orders/history')}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg min-h-[44px]"
          >
            주문 내역
          </button>
          <button
            data-testid="admin-logout"
            onClick={handleLogout}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg min-h-[44px]"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tableOrderSummaries.map((summary) => (
          <TableCard
            key={summary.tableId}
            summary={summary}
            isNew={newOrderTableIds.has(summary.tableId)}
            onClick={() => setSelectedTableId(summary.tableId)}
          />
        ))}
      </div>

      <OrderDetailModal
        tableId={selectedTableId}
        onClose={() => setSelectedTableId(null)}
      />
    </div>
  )
}
