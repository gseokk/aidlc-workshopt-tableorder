import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartItem } from '../CartItem'
import type { CartItem as CartItemType } from '@/types'

const mockItem: CartItemType = {
  menuId: 1,
  menuName: '아메리카노',
  price: 4500,
  quantity: 2,
}

describe('CartItem', () => {
  it('TC-FE-023: + 버튼 클릭 시 onIncrease 호출', async () => {
    const onIncrease = vi.fn()
    render(<CartItem item={mockItem} onIncrease={onIncrease} onDecrease={vi.fn()} />)
    await userEvent.click(screen.getByTestId('cart-item-increase'))
    expect(onIncrease).toHaveBeenCalledTimes(1)
  })

  it('TC-FE-024: - 버튼 클릭 시 onDecrease 호출', async () => {
    const onDecrease = vi.fn()
    render(<CartItem item={mockItem} onIncrease={vi.fn()} onDecrease={onDecrease} />)
    await userEvent.click(screen.getByTestId('cart-item-decrease'))
    expect(onDecrease).toHaveBeenCalledTimes(1)
  })
})
