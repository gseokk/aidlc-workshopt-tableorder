import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTableHistory } from '@/services/adminApi'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'

export function AdminOrderHistoryPage() {
  const navigate = useNavigate()
  const [tableId, setTableId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchParams, setSearchParams] = useState<{ tableId: number; from: string; to: string } | null>(null)

  const { data: histories = [], isLoading } = useQuery({
    queryKey: ['table-history', searchParams],
    queryFn: () =>
      searchParams
        ? getTableHistory(searchParams.tableId, searchParams.from, searchParams.to)
        : Promise.resolve([]),
    enabled: !!searchParams,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableId || !fromDate || !toDate) return
    setSearchParams({ tableId: Number(tableId), from: fromDate, to: toDate })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button
          data-testid="order-history-back"
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full min-h-[44px]"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">과거 주문 내역</h1>
      </header>

      <div className="p-4">
        <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
            <input
              data-testid="history-table-id"
              type="number"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-28"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              data-testid="history-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              data-testid="history-to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            data-testid="history-search"
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg min-h-[44px]"
          >
            조회
          </button>
        </form>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : histories.length === 0 && searchParams ? (
          <p className="text-center text-gray-400 mt-8">조회된 내역이 없습니다</p>
        ) : (
          histories.map((history) => (
            <div key={history.sessionId} className="bg-white rounded-xl p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">{history.tableNumber}번 테이블</span>
                <span className="text-sm text-gray-500">
                  {new Date(history.sessionStartedAt).toLocaleDateString()}
                </span>
              </div>
              {history.orders.map((order) => (
                <div key={order.id} className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  {order.items.map((item) => (
                    <div key={item.menuId} className="flex justify-between text-sm text-gray-500">
                      <span>{item.menuName} × {item.quantity}</span>
                      <span>{(item.unitPrice * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="border-t mt-3 pt-2 flex justify-between font-semibold">
                <span>세션 합계</span>
                <span>{history.totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
