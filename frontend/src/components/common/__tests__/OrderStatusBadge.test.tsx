import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderStatusBadge } from '../OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it('TC-FE-017: PENDING → "대기중"', () => {
    render(<OrderStatusBadge status="PENDING" />)
    expect(screen.getByText('대기중')).toBeInTheDocument()
  })

  it('TC-FE-018: PREPARING → "준비중"', () => {
    render(<OrderStatusBadge status="PREPARING" />)
    expect(screen.getByText('준비중')).toBeInTheDocument()
  })

  it('TC-FE-019: COMPLETED → "완료"', () => {
    render(<OrderStatusBadge status="COMPLETED" />)
    expect(screen.getByText('완료')).toBeInTheDocument()
  })
})
