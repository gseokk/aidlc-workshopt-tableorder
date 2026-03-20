# Domain Entities - Frontend

Frontend에서 사용하는 TypeScript 타입 정의입니다.

---

## 인증 관련

```typescript
// 테이블 인증 정보 (localStorage 저장)
interface TableAuthConfig {
  storeIdentifier: string
  tableNumber: number
  password: string
}

// 테이블 로그인 응답
interface TableAuthState {
  token: string           // 테이블 토큰
  storeId: number
  tableId: number
  tableNumber: number
  storeName: string
}

// 관리자 인증 상태
interface AdminAuthState {
  token: string           // JWT
  storeId: number
  storeName: string
  expiresAt: number       // timestamp (ms)
}
```

---

## 메뉴 관련

```typescript
interface MenuCategory {
  id: number
  name: string
  displayOrder: number
}

interface Menu {
  id: number
  categoryId: number
  categoryName: string
  name: string
  price: number
  description: string
  imageUrl: string | null
  displayOrder: number
}
```

---

## 장바구니 관련

```typescript
interface CartItem {
  menuId: number
  menuName: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalAmount: number     // 계산 필드 (items에서 파생)
  totalCount: number      // 계산 필드
}
```

---

## 주문 관련

```typescript
type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

interface OrderItem {
  menuId: number
  menuName: string
  quantity: number
  unitPrice: number
}

interface Order {
  id: number
  orderNumber: string
  tableNumber: number
  sessionId: number
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string       // ISO 8601
}

// 주문 생성 요청
interface CreateOrderRequest {
  items: { menuId: number; quantity: number }[]
}

// 관리자 대시보드용 테이블별 주문 집계
interface TableOrderSummary {
  tableId: number
  tableNumber: number
  totalAmount: number
  orders: Order[]
  hasNewOrder: boolean    // 신규 주문 강조 표시용
}
```

---

## SSE 이벤트 관련

```typescript
type SseEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'SESSION_COMPLETED'

interface SseEvent {
  type: SseEventType
  storeId: number
  tableId: number
  orderId?: number
  order?: Order
  status?: OrderStatus
}
```

---

## 과거 주문 내역 관련

```typescript
interface OrderHistory {
  sessionId: number
  tableNumber: number
  orders: Order[]
  sessionStartedAt: string
  sessionCompletedAt: string
  totalAmount: number
}
```
