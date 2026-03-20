import type { Order } from '@/types'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'

interface Props {
  order: Order
}

export function OrderHistoryItem({ order }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500">주문번호 {order.orderNumber}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <ul className="space-y-1 mb-3">
        {order.items.map((item) => (
          <li key={item.menuId} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.menuName} × {item.quantity}</span>
            <span className="text-gray-900">{(item.unitPrice * item.quantity).toLocaleString()}원</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>합계</span>
        <span>{order.totalAmount.toLocaleString()}원</span>
      </div>
    </div>
  )
}
