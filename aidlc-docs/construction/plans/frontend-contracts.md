# Contract/Interface Definition - Frontend

## Unit Context
- **Unit**: frontend
- **Stories**: US-C-01 ~ US-C-14, US-A-01 ~ US-A-13 (총 23개)
- **Dependencies**: Backend REST API (Mock으로 대체하여 독립 개발)
- **Tech Stack**: React 18, TypeScript, Vite, React Query v5, Context API, Axios, shadcn/ui

---

## 1. Context Layer (클라이언트 상태)

### AuthContext
```typescript
interface AuthContextValue {
  // 고객 테이블 인증
  tableAuth: TableAuthState | null
  setupTable(config: TableAuthConfig): Promise<void>
  // 성공: token 저장 + /menu 이동 / 실패: throw Error

  // 관리자 인증
  adminAuth: AdminAuthState | null
  adminLogin(storeIdentifier: string, username: string, password: string): Promise<void>
  // 성공: JWT 저장 + /admin/dashboard 이동 / 실패: throw Error
  adminLogout(): void

  // 유틸
  isAdminTokenExpired(): boolean
  clearTableAuth(): void
}
```

### CartContext
```typescript
interface CartContextValue {
  items: CartItem[]
  totalAmount: number   // 파생값
  totalCount: number    // 파생값

  addItem(menu: Menu): void
  // 이미 있으면 quantity++ / 없으면 새 항목 추가 / localStorage 동기화

  updateQuantity(menuId: number, quantity: number): void
  // quantity <= 0 이면 removeItem / localStorage 동기화

  removeItem(menuId: number): void
  clearCart(): void
  // localStorage 삭제
}
```

### SseContext
```typescript
interface SseContextValue {
  tableOrderSummaries: TableOrderSummary[]
  newOrderTableIds: Set<number>

  connect(storeId: number): void
  disconnect(): void
  clearNewOrder(tableId: number): void
  // newOrderTableIds에서 tableId 제거
}
```

---

## 2. Service Layer (API 호출)

### customerApi.ts
```typescript
// 테이블 로그인
tableLogin(config: TableAuthConfig): Promise<TableAuthState>
// POST /api/tables/login

// 메뉴 카테고리 조회
getCategories(): Promise<MenuCategory[]>
// GET /api/menus/categories

// 메뉴 목록 조회
getMenus(categoryId?: number): Promise<Menu[]>
// GET /api/menus?categoryId={id}

// 주문 생성
createOrder(request: CreateOrderRequest): Promise<Order>
// POST /api/orders

// 현재 세션 주문 내역 조회
getSessionOrders(): Promise<Order[]>
// GET /api/orders/session
```

### adminApi.ts
```typescript
// 관리자 로그인
adminLogin(storeIdentifier: string, username: string, password: string): Promise<AdminAuthState>
// POST /api/auth/login

// 테이블별 주문 목록 조회 (초기 로드)
getTableOrders(tableId: number): Promise<TableOrderSummary>
// GET /api/orders/table/{tableId}

// 주문 상태 변경
updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order>
// PATCH /api/orders/{orderId}/status

// 주문 삭제
deleteOrder(orderId: number): Promise<void>
// DELETE /api/orders/{orderId}

// 테이블 이용 완료
completeTable(tableId: number): Promise<void>
// POST /api/tables/{tableId}/complete

// 메뉴 목록 조회 (관리자)
getAdminMenus(): Promise<Menu[]>
// GET /api/menus

// 메뉴 등록
createMenu(data: MenuFormData): Promise<Menu>
// POST /api/menus

// 메뉴 수정
updateMenu(menuId: number, data: MenuFormData): Promise<Menu>
// PUT /api/menus/{menuId}

// 메뉴 삭제
deleteMenu(menuId: number): Promise<void>
// DELETE /api/menus/{menuId}

// 과거 주문 내역 조회
getTableHistory(tableId: number, from: string, to: string): Promise<OrderHistory[]>
// GET /api/tables/{tableId}/history?from={date}&to={date}
```

---

## 3. Custom Hooks Layer

### useAuth
```typescript
// AuthContext를 소비하는 편의 hook
useAuth(): AuthContextValue
// AuthContext가 없으면 throw Error
```

### useCart
```typescript
// CartContext를 소비하는 편의 hook
useCart(): CartContextValue
```

### useSse
```typescript
// SseContext를 소비하는 편의 hook
useSse(): SseContextValue
```

### useOnlineStatus
```typescript
// 네트워크 온/오프라인 감지
useOnlineStatus(): boolean
// online/offline 이벤트 리스너
// 오프라인 시 Toast 알림
// 온라인 복귀 시 queryClient.invalidateQueries()
```

---

## 4. Utility Functions

### cartUtils.ts
```typescript
// 장바구니 총액 계산
calculateTotal(items: CartItem[]): number
// sum(item.price * item.quantity)

// 장바구니 총 수량 계산
calculateCount(items: CartItem[]): number

// localStorage 저장
saveCartToStorage(items: CartItem[]): void

// localStorage 복원
loadCartFromStorage(): CartItem[]
```

### authUtils.ts
```typescript
// JWT 만료 여부 확인
isTokenExpired(expiresAt: number): boolean
// Date.now() > expiresAt

// localStorage에서 관리자 인증 정보 로드
loadAdminAuth(): AdminAuthState | null

// localStorage에서 테이블 인증 정보 로드
loadTableAuth(): TableAuthState | null
```

---

## 5. Mock Data Layer

### mock/data/menus.ts
```typescript
export const mockCategories: MenuCategory[]
export const mockMenus: Menu[]
```

### mock/data/orders.ts
```typescript
export const mockOrders: Order[]
export const mockTableOrderSummaries: TableOrderSummary[]
```
