# Component Methods

> 상세 비즈니스 로직은 Construction Phase의 Functional Design에서 정의됩니다.
> 여기서는 method signature와 고수준 목적만 정의합니다.

---

## Backend - Controller Methods

### AuthController
```java
// POST /api/auth/login
ResponseEntity<LoginResponse> login(LoginRequest request)

// POST /api/auth/logout
ResponseEntity<Void> logout(HttpServletRequest request)
```

### TableController
```java
// POST /api/tables/login
ResponseEntity<TableLoginResponse> tableLogin(TableLoginRequest request)

// POST /api/tables/setup  [Admin JWT 필요]
ResponseEntity<TableSetupResponse> setupTable(TableSetupRequest request)

// POST /api/tables/{tableId}/complete  [Admin JWT 필요]
ResponseEntity<Void> completeTableSession(Long tableId)

// GET /api/tables/{tableId}/history  [Admin JWT 필요]
ResponseEntity<List<OrderHistoryResponse>> getTableHistory(
    Long tableId, LocalDate fromDate, LocalDate toDate)
```

### MenuController
```java
// GET /api/menus?categoryId={id}  [테이블 토큰 필요]
ResponseEntity<List<MenuResponse>> getMenus(Long categoryId)

// GET /api/menus/categories  [테이블 토큰 필요]
ResponseEntity<List<CategoryResponse>> getCategories()

// POST /api/menus  [Admin JWT 필요]
ResponseEntity<MenuResponse> createMenu(MenuCreateRequest request)

// PUT /api/menus/{menuId}  [Admin JWT 필요]
ResponseEntity<MenuResponse> updateMenu(Long menuId, MenuUpdateRequest request)

// DELETE /api/menus/{menuId}  [Admin JWT 필요]
ResponseEntity<Void> deleteMenu(Long menuId)

// PATCH /api/menus/{menuId}/order  [Admin JWT 필요]
ResponseEntity<Void> updateMenuOrder(Long menuId, MenuOrderRequest request)
```

### OrderController
```java
// POST /api/orders  [테이블 토큰 필요]
ResponseEntity<OrderResponse> createOrder(OrderCreateRequest request)

// GET /api/orders/session  [테이블 토큰 필요]
ResponseEntity<List<OrderResponse>> getSessionOrders()

// GET /api/orders/table/{tableId}  [Admin JWT 필요]
ResponseEntity<List<OrderResponse>> getTableOrders(Long tableId)

// PATCH /api/orders/{orderId}/status  [Admin JWT 필요]
ResponseEntity<OrderResponse> updateOrderStatus(Long orderId, OrderStatusRequest request)

// DELETE /api/orders/{orderId}  [Admin JWT 필요]
ResponseEntity<Void> deleteOrder(Long orderId)
```

### SseController
```java
// GET /api/sse/subscribe/{storeId}  [Admin JWT 필요]
SseEmitter subscribe(Long storeId)
```

---

## Backend - Service Methods

### AuthService
```java
LoginResponse login(String storeIdentifier, String username, String password)
void logout(String token)
String generateAdminJwt(Long storeId, String username)
AdminClaims validateAdminJwt(String token)
String generateTableToken(Long tableId, Long storeId)
TableClaims validateTableToken(String token)
```

### TableService
```java
TableLoginResponse tableLogin(String storeIdentifier, int tableNumber, String password)
TableSetupResponse setupTable(Long storeId, int tableNumber, String password)
void completeTableSession(Long tableId, Long storeId)
List<OrderHistoryResponse> getTableHistory(Long tableId, LocalDate from, LocalDate to)
TableSession getOrCreateActiveSession(Long tableId)
```

### MenuService
```java
List<MenuResponse> getMenusByCategory(Long storeId, Long categoryId)
List<CategoryResponse> getCategories(Long storeId)
MenuResponse createMenu(Long storeId, MenuCreateRequest request)
MenuResponse updateMenu(Long storeId, Long menuId, MenuUpdateRequest request)
void deleteMenu(Long storeId, Long menuId)
void updateMenuOrder(Long storeId, Long menuId, int newOrder)
```

### OrderService
```java
OrderResponse createOrder(Long tableId, Long sessionId, List<OrderItemRequest> items)
List<OrderResponse> getSessionOrders(Long sessionId)
List<OrderResponse> getTableOrders(Long tableId)
OrderResponse updateOrderStatus(Long orderId, Long storeId, OrderStatus status)
void deleteOrder(Long orderId, Long storeId)
```

### SseService
```java
SseEmitter createEmitter(Long storeId)
void sendOrderEvent(Long storeId, OrderEventPayload payload)
void removeEmitter(Long storeId, SseEmitter emitter)
```

---

## Frontend - Customer Context Methods

### AuthContext
```typescript
// 테이블 자동 로그인
autoLogin(): Promise<boolean>
// 초기 설정 저장
saveTableConfig(storeIdentifier: string, tableNumber: number, password: string): void
// 로그인 상태 확인
isAuthenticated(): boolean
// 테이블 토큰 반환
getToken(): string | null
```

### CartContext
```typescript
addItem(menu: Menu): void
removeItem(menuId: number): void
updateQuantity(menuId: number, quantity: number): void
clearCart(): void
getTotal(): number
getItemCount(): number
// localStorage 동기화
loadFromStorage(): void
saveToStorage(): void
```

---

## Frontend - Admin Context Methods

### AuthContext (Admin)
```typescript
login(storeIdentifier: string, username: string, password: string): Promise<void>
logout(): void
isAuthenticated(): boolean
getToken(): string | null
getStoreId(): number | null
```

### SseContext
```typescript
connect(storeId: number): void
disconnect(): void
// 실시간 주문 데이터
orders: OrdersByTable
// 신규 주문 알림
newOrderIds: number[]
clearNewOrderAlert(orderId: number): void
```
