import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { CartItem, Menu } from '@/types'
import { calculateTotal, calculateCount, saveCartToStorage, loadCartFromStorage } from '@/utils/cartUtils'

const MAX_QUANTITY = 99

interface CartState {
  items: CartItem[]
  totalAmount: number
  totalCount: number
}

interface CartContextValue extends CartState {
  addItem(menu: Menu): void
  updateQuantity(menuId: number, quantity: number): void
  removeItem(menuId: number): void
  clearCart(): void
}

type CartAction =
  | { type: 'ADD_ITEM'; menu: Menu }
  | { type: 'UPDATE_QUANTITY'; menuId: number; quantity: number }
  | { type: 'REMOVE_ITEM'; menuId: number }
  | { type: 'CLEAR' }
  | { type: 'INIT'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  let nextItems: CartItem[]

  switch (action.type) {
    case 'INIT':
      nextItems = action.items
      break

    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.menuId === action.menu.id)
      if (existing) {
        nextItems = state.items.map((i) =>
          i.menuId === action.menu.id
            ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) }
            : i
        )
      } else {
        nextItems = [
          ...state.items,
          {
            menuId: action.menu.id,
            menuName: action.menu.name,
            price: action.menu.price,
            quantity: 1,
          },
        ]
      }
      break
    }

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        nextItems = state.items.filter((i) => i.menuId !== action.menuId)
      } else {
        nextItems = state.items.map((i) =>
          i.menuId === action.menuId ? { ...i, quantity: action.quantity } : i
        )
      }
      break

    case 'REMOVE_ITEM':
      nextItems = state.items.filter((i) => i.menuId !== action.menuId)
      break

    case 'CLEAR':
      nextItems = []
      break

    default:
      return state
  }

  return {
    items: nextItems,
    totalAmount: calculateTotal(nextItems),
    totalCount: calculateCount(nextItems),
  }
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalAmount: 0,
    totalCount: 0,
  })

  // 초기화: localStorage 복원
  useEffect(() => {
    const saved = loadCartFromStorage()
    if (saved.length > 0) {
      dispatch({ type: 'INIT', items: saved })
    }
  }, [])

  // 변경 시 localStorage 동기화
  useEffect(() => {
    saveCartToStorage(state.items)
  }, [state.items])

  const addItem = (menu: Menu) => dispatch({ type: 'ADD_ITEM', menu })
  const updateQuantity = (menuId: number, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', menuId, quantity })
  const removeItem = (menuId: number) => dispatch({ type: 'REMOVE_ITEM', menuId })
  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
    localStorage.removeItem('cartItems')
  }

  return (
    <CartContext.Provider value={{ ...state, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
