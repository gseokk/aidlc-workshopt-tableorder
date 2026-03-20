import type { Menu } from '@/types'

interface Props {
  menu: Menu
  cartQuantity: number
  onAdd: () => void
}

export function MenuCard({ menu, cartQuantity, onAdd }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {menu.imageUrl && (
        <img src={menu.imageUrl} alt={menu.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-900">{menu.name}</h3>
          {cartQuantity > 0 && (
            <span
              data-testid="cart-quantity-badge"
              className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {cartQuantity}
            </span>
          )}
        </div>
        {menu.description && (
          <p className="text-sm text-gray-500 mb-3">{menu.description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">{menu.price.toLocaleString()}원</span>
          <button
            data-testid="menu-add-button"
            onClick={onAdd}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 min-h-[44px]"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  )
}
