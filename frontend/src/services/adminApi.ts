import type {
  AdminAuthState, TableOrderSummary, Order, OrderStatus,
  Menu, MenuCategory, MenuFormData, OrderHistory,
} from '@/types'
import { apiClient } from './apiClient'

export async function adminLogin(
  storeIdentifier: string,
  username: string,
  password: string
): Promise<AdminAuthState> {
  const res = await apiClient.post<AdminAuthState>('/api/auth/login', {
    storeIdentifier,
    username,
    password,
  })
  return res.data
}

export async function getAllTableOrders(): Promise<TableOrderSummary[]> {
  const res = await apiClient.get<TableOrderSummary[]>('/api/admin/orders/tables')
  return res.data
}

export async function getTableOrders(tableId: number): Promise<Order[]> {
  const res = await apiClient.get<Order[]>(`/api/admin/orders/table/${tableId}`)
  return res.data
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  const res = await apiClient.patch<Order>(`/api/admin/orders/${orderId}/status`, { status })
  return res.data
}

export async function deleteOrder(orderId: number): Promise<void> {
  await apiClient.delete(`/api/admin/orders/${orderId}`)
}

export async function completeTable(tableId: number): Promise<void> {
  await apiClient.post(`/api/admin/tables/${tableId}/complete`)
}

export async function getAdminMenus(): Promise<Menu[]> {
  const res = await apiClient.get<Menu[]>('/api/admin/menus')
  return res.data
}

export async function getAdminCategories(): Promise<MenuCategory[]> {
  const res = await apiClient.get<MenuCategory[]>('/api/admin/menus/categories')
  return res.data
}

export async function createMenu(data: MenuFormData): Promise<Menu> {
  const res = await apiClient.post<Menu>('/api/admin/menus', data)
  return res.data
}

export async function updateMenu(menuId: number, data: MenuFormData): Promise<Menu> {
  const res = await apiClient.put<Menu>(`/api/admin/menus/${menuId}`, data)
  return res.data
}

export async function deleteMenu(menuId: number): Promise<void> {
  await apiClient.delete(`/api/admin/menus/${menuId}`)
}

export async function getTableHistory(
  tableId: number,
  from: string,
  to: string
): Promise<OrderHistory[]> {
  const res = await apiClient.get<OrderHistory[]>(`/api/admin/tables/${tableId}/history`, {
    params: { from, to },
  })
  return res.data
}

export async function setupTable(
  tableNumber: number,
  password: string
): Promise<void> {
  await apiClient.post('/api/admin/tables/setup', { tableNumber, password })
}
