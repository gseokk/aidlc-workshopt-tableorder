// ===== 인증 관련 =====

export interface TableAuthConfig {
  storeIdentifier: string
  tableNumber: number
  password: string
}

export interface TableAuthState {
  token: string
  storeId: number
  tableId: number
  tableNumber: number
  sessionId: number
  storeName: string
}

export interface AdminAuthState {
  token: string
  storeId: number
  storeName: string
  expiresAt: number // timestamp (ms)
}

// ===== 메뉴 관련 =====

export interface MenuCategory {
  id: number
  name: string
  displayOrder: number
}

export interface Menu {
  id: number
  categoryId: number
  categoryName: string
  name: string
  price: number
  description: string
  imageUrl: string | null
  displayOrder: number
}

export interface MenuFormData {
  name: string
  categoryId: number
  price: number
  description: string
  imageUrl: string
}

// ===== 장바구니 관련 =====

export interface CartItem {
  menuId: number
  menuName: string
  price: number
  quantity: number
}

// ===== 주문 관련 =====

export type OrderStatus = 'PENDING' | 'COMPLETED'

export interface OrderItem {
  menuId: number
  menuName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  orderNumber: string
  tableId: number
  tableNumber: number
  sessionId: number
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

export interface CreateOrderRequest {
  items: { menuId: number; quantity: number }[]
}

export interface TableOrderSummary {
  tableId: number
  tableNumber: number
  totalAmount: number
  orders: Order[]
  hasNewOrder: boolean
}

// ===== SSE 이벤트 관련 =====

export type SseEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'SESSION_COMPLETED'

export interface SseEvent {
  type: SseEventType
  storeId: number
  tableId: number
  orderId?: number
  order?: Order
  status?: OrderStatus
}

// ===== 과거 주문 내역 =====

export interface OrderHistory {
  sessionId: number
  tableNumber: number
  orders: Order[]
  sessionStartedAt: string
  sessionCompletedAt: string
  totalAmount: number
}
