interface Props {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: Props) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <p className="text-gray-800 mb-6 text-center">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            data-testid="confirm-cancel"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px]"
          >
            취소
          </button>
          <button
            data-testid="confirm-ok"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 min-h-[44px]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
