import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from '../CartContext'
import type { Menu } from '@/types'

const mockMenu: Menu = {
  id: 1,
  categoryId: 1,
  categoryName: '음료',
  name: '아메리카노',
  price: 4500,
  description: '진한 에스프레소',
  imageUrl: null,
  displayOrder: 1,
}

// 테스트용 컴포넌트
function TestComponent() {
  const { items, totalAmount, totalCount, addItem, updateQuantity, clearCart } = useCart()
  return (
    <div>
      <span data-testid="count">{totalCount}</span>
      <span data-testid="total">{totalAmount}</span>
      <span data-testid="items">{items.length}</span>
      <button data-testid="add" onClick={() => addItem(mockMenu)}>추가</button>
      <button data-testid="increase" onClick={() => updateQuantity(1, 2)}>수량2</button>
      <button data-testid="decrease" onClick={() => updateQuantity(1, 0)}>수량0</button>
      <button data-testid="clear" onClick={() => clearCart()}>비우기</button>
    </div>
  )
}

function renderWithCart() {
  return render(
    <CartProvider>
      <TestComponent />
    </CartProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('TC-FE-008: 새 메뉴 추가', async () => {
    renderWithCart()
    await userEvent.click(screen.getByTestId('add'))
    expect(screen.getByTestId('items').textContent).toBe('1')
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('TC-FE-009: 동일 메뉴 재추가 시 수량 증가', async () => {
    renderWithCart()
    await userEvent.click(screen.getByTestId('add'))
    await userEvent.click(screen.getByTestId('add'))
    expect(screen.getByTestId('items').textContent).toBe('1')
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('TC-FE-010: 최대 수량 99 초과 불가', async () => {
    renderWithCart()
    // 99번 추가
    for (let i = 0; i < 100; i++) {
      await userEvent.click(screen.getByTestId('add'))
    }
    expect(screen.getByTestId('count').textContent).toBe('99')
  })

  it('TC-FE-011: 수량 변경', async () => {
    renderWithCart()
    await userEvent.click(screen.getByTestId('add'))
    await userEvent.click(screen.getByTestId('increase'))
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('TC-FE-012: 수량 0 이하 시 항목 제거', async () => {
    renderWithCart()
    await userEvent.click(screen.getByTestId('add'))
    await userEvent.click(screen.getByTestId('decrease'))
    expect(screen.getByTestId('items').textContent).toBe('0')
  })

  it('TC-FE-013: clearCart - 전체 비우기', async () => {
    renderWithCart()
    await userEvent.click(screen.getByTestId('add'))
    await userEvent.click(screen.getByTestId('clear'))
    expect(screen.getByTestId('items').textContent).toBe('0')
    expect(screen.getByTestId('total').textContent).toBe('0')
  })

  it('TC-FE-014: clearCart 후 localStorage 삭제', async () => {
    renderWithCart()
    await userEvent.click(screen.getByTestId('add'))
    await userEvent.click(screen.getByTestId('clear'))
    expect(localStorage.getItem('cartItems')).toBeNull()
  })
})
