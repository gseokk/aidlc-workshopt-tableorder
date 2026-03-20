import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuCard } from '../MenuCard'
import type { Menu } from '@/types'

const mockMenu: Menu = {
  id: 1,
  categoryId: 1,
  categoryName: '커피',
  name: '아메리카노',
  price: 4500,
  description: '진한 에스프레소',
  imageUrl: null,
  displayOrder: 1,
}

describe('MenuCard', () => {
  it('TC-FE-020: 메뉴 정보 렌더링', () => {
    render(<MenuCard menu={mockMenu} cartQuantity={0} onAdd={vi.fn()} />)
    expect(screen.getByText('아메리카노')).toBeInTheDocument()
    expect(screen.getByText('4,500원')).toBeInTheDocument()
  })

  it('TC-FE-021: 담기 버튼 클릭 시 onAdd 호출', async () => {
    const onAdd = vi.fn()
    render(<MenuCard menu={mockMenu} cartQuantity={0} onAdd={onAdd} />)
    await userEvent.click(screen.getByTestId('menu-add-button'))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('TC-FE-022: cartQuantity > 0 이면 수량 배지 표시', () => {
    render(<MenuCard menu={mockMenu} cartQuantity={2} onAdd={vi.fn()} />)
    expect(screen.getByTestId('cart-quantity-badge').textContent).toBe('2')
  })

  it('cartQuantity === 0 이면 배지 미표시', () => {
    render(<MenuCard menu={mockMenu} cartQuantity={0} onAdd={vi.fn()} />)
    expect(screen.queryByTestId('cart-quantity-badge')).toBeNull()
  })
})
