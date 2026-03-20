import type { OrderStatus } from '@/types'

const NEXT_STATUS: Record<OrderStatus, { label: string; next: OrderStatus } | null> = {
  PENDING: { label: '준비 시작', next: 'PREPARING' },
  PREPARING: { label: '완료 처리', next: 'COMPLETED' },
  COMPLETED: null,
}

interface Props {
  orderId: number
  currentStatus: OrderStatus
  onChange: (orderId: number, status: OrderStatus) => void
}

export function OrderStatusControl({ orderId, currentStatus, onChange }: Props) {
  const next = NEXT_STATUS[currentStatus]
  if (!next) return <span className="text-sm text-gray-400">완료됨</span>

  return (
    <button
      data-testid={`order-status-btn-${orderId}`}
      onClick={() => onChange(orderId, next.next)}
      className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 min-h-[44px]"
    >
      {next.label}
    </button>
  )
}
