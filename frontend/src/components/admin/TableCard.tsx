import type { TableOrderSummary } from '@/types'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'

interface Props {
  summary: TableOrderSummary
  isNew: boolean
  onClick: () => void
}

export function TableCard({ summary, isNew, onClick }: Props) {
  return (
    <div
      data-testid={`table-card-${summary.tableId}`}
      onClick={onClick}
      className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
        isNew
          ? 'border-orange-400 bg-orange-50 animate-pulse'
          : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">{summary.tableNumber}번 테이블</h3>
        {isNew && (
          <span
            data-testid={`table-card-new-badge-${summary.tableId}`}
            className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full"
          >
            NEW
          </span>
        )}
      </div>

      {summary.orders.length === 0 ? (
        <p className="text-sm text-gray-400">주문 없음</p>
      ) : (
        <>
          <div className="space-y-1 mb-3">
            {summary.orders.slice(0, 2).map((order) => (
              <div key={order.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 truncate">{order.orderNumber}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}
            {summary.orders.length > 2 && (
              <p className="text-xs text-gray-400">+{summary.orders.length - 2}개 더</p>
            )}
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span className="text-gray-700">총 금액</span>
            <span className="text-gray-900">{summary.totalAmount.toLocaleString()}원</span>
          </div>
        </>
      )}
    </div>
  )
}
