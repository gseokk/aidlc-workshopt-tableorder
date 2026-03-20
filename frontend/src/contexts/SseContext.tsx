import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react'
import type { TableOrderSummary, SseEvent, Order, OrderStatus } from '@/types'

const MAX_RECONNECT = 5
const RECONNECT_DELAY = 3000

interface SseContextValue {
  tableOrderSummaries: TableOrderSummary[]
  newOrderTableIds: Set<number>
  connect(storeId: number): void
  disconnect(): void
  clearNewOrder(tableId: number): void
  setInitialSummaries(summaries: TableOrderSummary[]): void
}

const SseContext = createContext<SseContextValue | null>(null)

export function SseProvider({ children }: { children: ReactNode }) {
  const [tableOrderSummaries, setTableOrderSummaries] = useState<TableOrderSummary[]>([])
  const [newOrderTableIds, setNewOrderTableIds] = useState<Set<number>>(new Set())
  const esRef = useRef<EventSource | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const connect = useCallback(
    (storeId: number) => {
      disconnect()
      reconnectCountRef.current = 0

      const baseUrl = import.meta.env.VITE_API_BASE_URL as string
      const url = `${baseUrl}/api/sse/subscribe/${storeId}`

      const createEs = () => {
        const adminAuthRaw = localStorage.getItem('adminAuth')
        const token = adminAuthRaw ? (JSON.parse(adminAuthRaw) as { token: string }).token : ''
        const es = new EventSource(`${url}?token=${encodeURIComponent(token)}`)
        esRef.current = es

        es.onopen = () => {
          reconnectCountRef.current = 0
        }

        // named event 수신 (백엔드가 .name(eventType)으로 전송)
        const handleEvent = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string) as SseEvent
            handleSseEvent({ ...data, type: e.type })
          } catch {
            // 파싱 실패 무시
          }
        }

        es.addEventListener('ORDER_CREATED', handleEvent)
        es.addEventListener('ORDER_STATUS_CHANGED', handleEvent)
        es.addEventListener('ORDER_DELETED', handleEvent)
        es.addEventListener('SESSION_COMPLETED', handleEvent)

        es.onerror = () => {
          es.close()
          if (reconnectCountRef.current < MAX_RECONNECT) {
            reconnectCountRef.current += 1
            reconnectTimerRef.current = setTimeout(createEs, RECONNECT_DELAY)
          }
        }
      }

      createEs()
    },
    [disconnect]
  )

  const handleSseEvent = (event: SseEvent) => {
    setTableOrderSummaries((prev) => {
      switch (event.type) {
        case 'ORDER_CREATED': {
          // payload가 OrderResponse 형태로 직접 옴 (order 필드 없이 flat 구조)
          const order = event as unknown as Order
          if (!order.id) return prev
          return prev.map((s) => {
            if (s.tableId !== order.tableId) return s
            return {
              ...s,
              orders: [...s.orders, order],
              totalAmount: s.totalAmount + order.totalAmount,
            }
          })
        }
        case 'ORDER_STATUS_CHANGED': {
          // payload가 OrderResponse 형태로 직접 옴
          const order = event as unknown as Order
          return prev.map((s) => ({
            ...s,
            orders: s.orders.map((o) =>
              o.id === order.id ? { ...o, status: order.status } : o
            ),
          }))
        }
        case 'ORDER_DELETED': {
          // payload: { orderId, tableId }
          return prev.map((s) => {
            const removed = s.orders.find((o) => o.id === event.orderId)
            if (!removed) return s
            return {
              ...s,
              orders: s.orders.filter((o) => o.id !== event.orderId),
              totalAmount: s.totalAmount - removed.totalAmount,
            }
          })
        }
        case 'SESSION_COMPLETED': {
          return prev.map((s) =>
            s.tableId === event.tableId ? { ...s, orders: [], totalAmount: 0 } : s
          )
        }
        default:
          return prev
      }
    })

    if (event.type === 'ORDER_CREATED') {
      const order = event as unknown as Order
      if (order.tableId) {
        setNewOrderTableIds((prev) => new Set([...prev, order.tableId]))
      }
    }
  }

  const clearNewOrder = useCallback((tableId: number) => {
    setNewOrderTableIds((prev) => {
      const next = new Set(prev)
      next.delete(tableId)
      return next
    })
  }, [])

  const setInitialSummaries = useCallback((summaries: TableOrderSummary[]) => {
    setTableOrderSummaries(summaries)
  }, [])

  return (
    <SseContext.Provider
      value={{
        tableOrderSummaries,
        newOrderTableIds,
        connect,
        disconnect,
        clearNewOrder,
        setInitialSummaries,
      }}
    >
      {children}
    </SseContext.Provider>
  )
}

export function useSse(): SseContextValue {
  const ctx = useContext(SseContext)
  if (!ctx) throw new Error('useSse must be used within SseProvider')
  return ctx
}
