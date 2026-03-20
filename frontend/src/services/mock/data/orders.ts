import type { Order, TableOrderSummary } from '@/types'

export const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    tableNumber: 1,
    sessionId: 101,
    items: [
      { menuId: 1, menuName: '아메리카노', quantity: 2, unitPrice: 4500 },
      { menuId: 9, menuName: '치즈케이크', quantity: 1, unitPrice: 6500 },
    ],
    totalAmount: 15500,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    tableNumber: 2,
    sessionId: 102,
    items: [
      { menuId: 2, menuName: '카페라떼', quantity: 1, unitPrice: 5000 },
    ],
    totalAmount: 5000,
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
  },
]

export const mockTableOrderSummaries: TableOrderSummary[] = [
  {
    tableId: 1,
    tableNumber: 1,
    totalAmount: 15500,
    orders: [mockOrders[0]],
    hasNewOrder: false,
  },
  {
    tableId: 2,
    tableNumber: 2,
    totalAmount: 5000,
    orders: [mockOrders[1]],
    hasNewOrder: false,
  },
  { tableId: 3, tableNumber: 3, totalAmount: 0, orders: [], hasNewOrder: false },
  { tableId: 4, tableNumber: 4, totalAmount: 0, orders: [], hasNewOrder: false },
]
