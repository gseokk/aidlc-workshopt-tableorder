import type { TableAuthConfig, TableAuthState, MenuCategory, Menu, Order, CreateOrderRequest } from '@/types'
import { apiClient } from './apiClient'
import { mockCategories, mockMenus } from './mock/data/menus'
import { mockOrders } from './mock/data/orders'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function tableLogin(config: TableAuthConfig): Promise<TableAuthState> {
  if (USE_MOCK) {
    return {
      token: 'mock-table-token',
      storeId: 1,
      tableId: config.tableNumber,
      tableNumber: config.tableNumber,
      storeName: '테스트 매장',
    }
  }
  const res = await apiClient.post<TableAuthState>('/api/tables/login', config)
  return res.data
}

export async function getCategories(): Promise<MenuCategory[]> {
  if (USE_MOCK) return mockCategories
  const res = await apiClient.get<MenuCategory[]>('/api/customer/menus/categories')
  return res.data
}

export async function getMenus(categoryId?: number): Promise<Menu[]> {
  if (USE_MOCK) {
    return categoryId
      ? mockMenus.filter((m) => m.categoryId === categoryId)
      : mockMenus
  }
  const res = await apiClient.get<Menu[]>('/api/customer/menus', {
    params: categoryId ? { categoryId } : undefined,
  })
  return res.data
}

export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  if (USE_MOCK) {
    const items = request.items.map((i) => {
      const menu = mockMenus.find((m) => m.id === i.menuId)!
      return { menuId: i.menuId, menuName: menu.name, quantity: i.quantity, unitPrice: menu.price }
    })
    const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    return {
      id: Date.now(),
      orderNumber: `ORD-${Date.now()}`,
      tableNumber: 1,
      sessionId: 101,
      items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
  }
  const res = await apiClient.post<Order>('/api/customer/orders', request)
  return res.data
}

export async function getSessionOrders(): Promise<Order[]> {
  if (USE_MOCK) return mockOrders.filter((o) => o.sessionId === 101)
  const res = await apiClient.get<Order[]>('/api/customer/orders/session')
  return res.data
}
