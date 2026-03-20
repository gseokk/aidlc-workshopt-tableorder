import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableCard } from '../TableCard'
import type { TableOrderSummary } from '@/types'

const mockSummary: TableOrderSummary = {
  tableId: 1,
  tableNumber: 1,
  totalAmount: 0,
  orders: [],
  hasNewOrder: false,
}

describe('TableCard', () => {
  it('TC-FE-028: isNew=true 시 NEW 배지 표시', () => {
    render(<TableCard summary={mockSummary} isNew onClick={vi.fn()} />)
    expect(screen.getByTestId('table-card-new-badge-1')).toBeInTheDocument()
  })

  it('isNew=false 시 NEW 배지 미표시', () => {
    render(<TableCard summary={mockSummary} isNew={false} onClick={vi.fn()} />)
    expect(screen.queryByTestId('table-card-new-badge-1')).toBeNull()
  })

  it('TC-FE-029: 클릭 시 onClick 호출', async () => {
    const onClick = vi.fn()
    render(<TableCard summary={mockSummary} isNew={false} onClick={onClick} />)
    await userEvent.click(screen.getByTestId('table-card-1'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
