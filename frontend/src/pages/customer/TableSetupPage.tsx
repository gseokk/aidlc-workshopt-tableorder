import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function TableSetupPage() {
  const { setupTable } = useAuth()
  const navigate = useNavigate()
  const [storeIdentifier, setStoreIdentifier] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await setupTable({
        storeIdentifier,
        tableNumber: Number(tableNumber),
        password,
      })
      navigate('/menu')
    } catch {
      setError('설정 정보를 확인해 주세요')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">테이블 설정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매장 코드</label>
            <input
              data-testid="setup-store-identifier"
              value={storeIdentifier}
              onChange={(e) => setStoreIdentifier(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="매장 코드 입력"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
            <input
              data-testid="setup-table-number"
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="테이블 번호"
              required
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              data-testid="setup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="비밀번호"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            data-testid="setup-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? '설정 중...' : '설정 완료'}
          </button>
        </form>
      </div>
    </div>
  )
}
