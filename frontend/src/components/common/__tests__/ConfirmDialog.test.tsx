import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('TC-FE-030: 확인 버튼 클릭 시 onConfirm 호출', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog isOpen message="삭제하시겠습니까?" onConfirm={onConfirm} onCancel={onCancel} />
    )
    await userEvent.click(screen.getByTestId('confirm-ok'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('TC-FE-031: 취소 버튼 클릭 시 onCancel 호출', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog isOpen message="삭제하시겠습니까?" onConfirm={onConfirm} onCancel={onCancel} />
    )
    await userEvent.click(screen.getByTestId('confirm-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('isOpen=false 이면 렌더링 안 함', () => {
    render(
      <ConfirmDialog isOpen={false} message="test" onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.queryByTestId('confirm-ok')).toBeNull()
  })
})
