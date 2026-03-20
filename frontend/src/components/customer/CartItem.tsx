import type { CartItem as CartItemType } from '@/types'

interface Props {
  item: CartItemType
  onIncrease: () => void
  onDecrease: () => void
}

export function CartItem({ item, onIncrease, onDecrease }: Props) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.menuName}</p>
        <p className="text-sm text-gray-500">{item.price.toLocaleString()}원</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          data-testid="cart-item-decrease"
          onClick={onDecrease}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 min-h-[44px] min-w-[44px]"
        >
          −
        </button>
        <span className="w-6 text-center font-medium">{item.quantity}</span>
        <button
          data-testid="cart-item-increase"
          onClick={onIncrease}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 min-h-[44px] min-w-[44px]"
        >
          +
        </button>
      </div>
      <p className="ml-4 font-semibold text-gray-900 w-20 text-right">
        {(item.price * item.quantity).toLocaleString()}원
      </p>
    </div>
  )
}
