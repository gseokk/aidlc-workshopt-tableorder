import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { createOrder } from '@/services/customerApi'
import { ErrorModal } from '@/components/common/ErrorModal'

export function OrderConfirmPage() {
  const { items, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [errorMessage, setErrorMessage] = useState('')

  // 주문 성공 후 카운트다운
  useEffect(() => {
    if (!orderNumber) return
    if (countdown <= 0) {
      clearCart()
      navigate('/menu')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [orderNumber, countdown, clearCart, navigate])

  const handleOrder = async () => {
    if (items.length === 0) return
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
      })
      setOrderNumber(order.orderNumber)
    } catch {
      setErrorMessage('주문 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">주문 완료!</h2>
          <p className="text-gray-500 mb-4">주문번호: {orderNumber}</p>
          <p className="text-gray-400 text-sm mb-6">{countdown}초 후 메뉴 화면으로 이동합니다</p>
          <button
            data-testid="order-confirm-go-menu"
            onClick={() => { clearCart(); navigate('/menu') }}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 min-h-[44px]"
          >
            바로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            data-testid="order-confirm-back"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full min-h-[44px]"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">주문 확인</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="bg-white rounded-xl p-4 mb-4">
          {items.map((item) => (
            <div key={item.menuId} className="flex justify-between py-2 border-b last:border-0">
              <span className="text-gray-700">{item.menuName} × {item.quantity}</span>
              <span className="font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 flex justify-between font-bold text-lg">
          <span>합계</span>
          <span>{totalAmount.toLocaleString()}원</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          data-testid="order-confirm-submit"
          onClick={handleOrder}
          disabled={isSubmitting || items.length === 0}
          className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50 min-h-[44px]"
        >
          {isSubmitting ? '주문 중...' : `${totalAmount.toLocaleString()}원 주문하기`}
        </button>
      </div>

      <ErrorModal
        isOpen={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </div>
  )
}
