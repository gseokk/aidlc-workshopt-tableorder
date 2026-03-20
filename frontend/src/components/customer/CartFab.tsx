interface Props {
  itemCount: number
  totalAmount: number
  onClick: () => void
}

export function CartFab({ itemCount, totalAmount, onClick }: Props) {
  if (itemCount === 0) return null
  return (
    <button
      data-testid="cart-fab"
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-orange-600 transition-colors min-h-[44px] z-30"
    >
      <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
        {itemCount}
      </span>
      <span className="font-semibold">장바구니 보기</span>
      <span className="font-bold">{totalAmount.toLocaleString()}원</span>
    </button>
  )
}
