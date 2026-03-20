import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { OrderHistoryItem } from '@/components/customer/OrderHistoryItem'
import { getSessionOrders } from '@/services/customerApi'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/contexts/AuthContext'

export function CustomerOrderHistoryPage() {
  const navigate = useNavigate()
  const { tableAuth } = useAuth()
  const sessionId = tableAuth?.sessionId ?? 0

  const { data: orders = [], isLoading } = useQuery({
    queryKey: queryKeys.sessionOrders(sessionId),
    queryFn: getSessionOrders,
    enabled: sessionId > 0,
    staleTime: 0,
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            data-testid="order-history-back"
            onClick={() => navigate('/menu')}
            className="p-2 hover:bg-gray-100 rounded-full min-h-[44px]"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">주문 내역</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-400 mt-12">주문 내역이 없습니다</p>
        ) : (
          orders.map((order) => <OrderHistoryItem key={order.id} order={order} />)
        )}
      </div>
    </div>
  )
}
