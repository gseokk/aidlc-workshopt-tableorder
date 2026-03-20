import { useEffect } from 'react'
import { useSse } from '@/contexts/SseContext'
import { useToast } from '@/components/common/Toast'
import { OrderStatusBadge } from '@/components/common/OrderStatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useState } from 'react'
import { deleteOrder, completeTable } from '@/services/adminApi'

interface Props {
  tableId: number | null
  onClose: () => void
}

export function OrderDetailModal({ tableId, onClose }: Props) {
  const { tableOrderSummaries, clearNewOrder } = useSse()
  const { show: showToast } = useToast()
  const [confirmState, setConfirmState] = useState<{ type: 'delete' | 'complete'; id?: number } | null>(null)

  const summary = tableOrderSummaries.find((s) => s.tableId === tableId)

  useEffect(() => {
    if (tableId) clearNewOrder(tableId)
  }, [tableId, clearNewOrder])

  if (!tableId || !summary) return null

  const handleDeleteConfirm = async () => {
    if (!confirmState?.id) return
    try {
      await deleteOrder(confirmState.id)
      showToast('주문이 삭제되었습니다', 'success')
    } catch {
      showToast('삭제에 실패했습니다', 'error')
    }
    setConfirmState(null)
  }

  const handleCompleteConfirm = async () => {
    try {
      await completeTable(tableId)
      showToast('이용 완료 처리되었습니다', 'success')
      onClose()
    } catch {
      showToast('처리에 실패했습니다', 'error')
    }
    setConfirmState(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-xl font-bold">{summary.tableNumber}번 테이블</h2>
            <button
              data-testid="order-modal-close"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px]"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {summary.orders.length === 0 ? (
              <p className="text-center text-gray-400 py-8">주문 내역이 없습니다</p>
            ) : (
              summary.orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <ul className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <li key={item.menuId} className="flex justify-between text-sm text-gray-600">
                        <span>{item.menuName} × {item.quantity}</span>
                        <span>{(item.unitPrice * item.quantity).toLocaleString()}원</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <button
                      data-testid={`order-delete-btn-${order.id}`}
                      onClick={() => setConfirmState({ type: 'delete', id: order.id })}
                      className="px-3 py-1.5 border border-red-300 text-red-500 text-sm rounded-lg hover:bg-red-50 min-h-[44px]"
                    >
                      삭제
                    </button>
                    <span className="font-semibold">{order.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">총 금액</span>
              <span className="text-xl font-bold">{summary.totalAmount.toLocaleString()}원</span>
            </div>
            <button
              data-testid="table-complete-button"
              onClick={() => setConfirmState({ type: 'complete' })}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 min-h-[44px]"
            >
              이용 완료
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState !== null}
        message={
          confirmState?.type === 'delete'
            ? '주문을 삭제하시겠습니까?'
            : '이용 완료 처리하시겠습니까? 현재 세션이 종료됩니다.'
        }
        onConfirm={confirmState?.type === 'delete' ? handleDeleteConfirm : handleCompleteConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </>
  )
}
