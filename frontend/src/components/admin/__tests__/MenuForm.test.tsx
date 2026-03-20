import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuForm } from '../MenuForm'
import type { MenuCategory } from '@/types'

const mockCategories: MenuCategory[] = [
  { id: 1, name: '커피', displayOrder: 1 },
  { id: 2, name: '디저트', displayOrder: 2 },
]

describe('MenuForm', () => {
  it('TC-FE-025: 메뉴명 미입력 시 에러 표시, onSubmit 미호출', async () => {
    const onSubmit = vi.fn()
    render(<MenuForm menu={null} categories={mockCategories} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByTestId('menu-form-submit'))
    expect(screen.getByTestId('menu-form-name-error')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('TC-FE-026: 가격 음수 입력 시 에러 표시', async () => {
    const onSubmit = vi.fn()
    render(<MenuForm menu={null} categories={mockCategories} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByTestId('menu-form-name'), '아메리카노')
    await userEvent.selectOptions(screen.getByTestId('menu-form-category'), '1')
    await userEvent.clear(screen.getByTestId('menu-form-price'))
    await userEvent.type(screen.getByTestId('menu-form-price'), '-1000')
    await userEvent.click(screen.getByTestId('menu-form-submit'))
    expect(screen.getByTestId('menu-form-price-error')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('TC-FE-027: 유효한 데이터 제출 시 onSubmit 호출', async () => {
    const onSubmit = vi.fn()
    render(<MenuForm menu={null} categories={mockCategories} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByTestId('menu-form-name'), '아메리카노')
    await userEvent.selectOptions(screen.getByTestId('menu-form-category'), '1')
    await userEvent.clear(screen.getByTestId('menu-form-price'))
    await userEvent.type(screen.getByTestId('menu-form-price'), '4500')
    await userEvent.click(screen.getByTestId('menu-form-submit'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '아메리카노', price: 4500, categoryId: 1 })
    )
  })
})
