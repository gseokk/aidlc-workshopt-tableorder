interface Props {
  isOpen: boolean
  message: string
  onClose: () => void
}

export function ErrorModal({ isOpen, message, onClose }: Props) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-red-500 text-2xl">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-900">오류 발생</h3>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          data-testid="error-modal-close"
          onClick={onClose}
          className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 min-h-[44px]"
        >
          확인
        </button>
      </div>
    </div>
  )
}
