import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { CartItem } from './CartItem'
import { createOrder } from '@/services/customerApi'
import { useToast } from '@/components/common/Toast'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const { items, totalAmount, updateQuantity, clearCart } = useCart()
  const { show: showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOrder = async () => {
    if (items.length === 0 || isSubmitting) return
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
      })
      clearCart()
      onClose()
      showToast(`주문 완료! 주문번호: ${order.orderNumber}`, 'success')
    } catch {
      showToast('주문에 실패했습니다. 다시 시도해 주세요.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          data-testid="cart-drawer-overlay"
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}
      {/* 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">장바구니</h2>
            <button
              data-testid="cart-drawer-close"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px]"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">장바구니가 비어있습니다</p>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.menuId}
                  item={item}
                  onIncrease={() => updateQuantity(item.menuId, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.menuId, item.quantity - 1)}
                />
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">합계</span>
                <span className="font-bold text-lg">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex gap-2">
                <button
                  data-testid="cart-clear-button"
                  onClick={clearCart}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 min-h-[44px]"
                >
                  비우기
                </button>
                <button
                  data-testid="cart-order-button"
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className="flex-2 flex-grow-[2] py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? '주문 중...' : '주문하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
