# Contract/Interface Definition - Backend

## Unit Context
- **Unit**: backend (Spring Boot)
- **Stories**: US-C-01~03 (테이블 인증/세션), US-C-04~05 (메뉴 탐색), US-C-10~14 (주문/내역), US-A-01~02 (관리자 인증), US-A-03~09 (모니터링/테이블관리), US-A-10~13 (메뉴관리)
- **Dependencies**: MySQL 8.0, JWT (jjwt), Spring Security
- **Database Entities**: Store, TableEntity, TableSession, MenuCategory, Menu, Order, OrderItem

---

## Security Layer

### JwtProvider
```java
// JWT 생성/검증 유틸리티
String generateAdminToken(Long storeId, String username)
  // Returns: 서명된 JWT 문자열 (만료 8시간)

String generateTableToken(Long tableId, Long storeId, Long sessionId)
  // Returns: 서명된 JWT 문자열 (만료 12시간)

Claims validateToken(String token)
  // Returns: JWT Claims
  // Throws: UnauthorizedException (만료/서명 오류)

String getTokenType(String token)
  // Returns: "ADMIN" | "TABLE"
```

---

## Business Logic Layer

### AuthService
```java
LoginResponse login(String storeIdentifier, String username, String password)
  // Returns: LoginResponse(token, storeId, storeName)
  // Throws: UnauthorizedException

TableLoginResponse tableLogin(String storeIdentifier, Integer tableNumber, String password)
  // Returns: TableLoginResponse(token, tableId, tableNumber, sessionId)
  // Throws: UnauthorizedException
```

### TableService
```java
TableSetupResponse setupTable(Long storeId, Integer tableNumber, String password)
  // Returns: TableSetupResponse(tableId, tableNumber)

void completeTableSession(Long tableId, Long storeId)
  // Throws: NotFoundException (테이블/세션 없음)

List<OrderHistoryResponse> getTableHistory(Long tableId, Long storeId, LocalDate from, LocalDate to)
  // Returns: 세션별 주문 내역 목록

TableSession getOrCreateActiveSession(Long tableId)
  // Returns: 활성 세션 (없으면 신규 생성)
```

### MenuService
```java
List<MenuResponse> getMenusByCategory(Long storeId, Long categoryId)
  // categoryId null이면 전체 반환

List<CategoryResponse> getCategories(Long storeId)

MenuResponse createMenu(Long storeId, MenuCreateRequest request)
  // Returns: 생성된 MenuResponse
  // 카테고리 없으면 자동 생성

MenuResponse updateMenu(Long storeId, Long menuId, MenuUpdateRequest request)
  // Throws: NotFoundException

void deleteMenu(Long storeId, Long menuId)
  // Soft Delete (isDeleted=true)
  // Throws: NotFoundException

void updateMenuOrder(Long storeId, Long menuId, Integer newOrder)
  // 카테고리 내 displayOrder 일괄 재정렬
  // Throws: NotFoundException
```

### OrderService
```java
OrderResponse createOrder(Long tableId, Long sessionId, OrderCreateRequest request)
  // Returns: 생성된 OrderResponse
  // Throws: BadRequestException (비활성 세션), NotFoundException (메뉴 없음)

List<OrderResponse> getSessionOrders(Long sessionId)

List<OrderResponse> getTableOrders(Long tableId)

OrderResponse updateOrderStatus(Long orderId, Long storeId, OrderStatus newStatus)
  // 상태 전이 검증: PENDING→CONFIRMED→COMPLETED만 허용
  // Throws: NotFoundException, ForbiddenException, BadRequestException

void deleteOrder(Long orderId, Long storeId)
  // Throws: NotFoundException, ForbiddenException
```

### SseService
```java
SseEmitter createEmitter(Long storeId)
  // Returns: 30분 타임아웃 SseEmitter, Emitter Pool에 등록

void sendEvent(Long storeId, String eventType, Object payload)
  // 해당 매장 모든 Emitter에 이벤트 전송, 실패 시 해당 Emitter 제거

void removeEmitter(Long storeId, SseEmitter emitter)
```

---

## API Layer

### AuthController
```
POST /api/auth/login
  Request:  LoginRequest(storeIdentifier, username, password)
  Response: 200 LoginResponse(token, storeId, storeName)
            401 UnauthorizedException
```

### TableController
```
POST /api/tables/login                          [공개]
  Request:  TableLoginRequest(storeIdentifier, tableNumber, password)
  Response: 200 TableLoginResponse(token, tableId, tableNumber, sessionId)

POST /api/admin/tables/setup                    [Admin JWT]
  Request:  TableSetupRequest(tableNumber, password)
  Response: 200 TableSetupResponse(tableId, tableNumber)

POST /api/admin/tables/{tableId}/complete       [Admin JWT]
  Response: 200

GET /api/admin/tables/{tableId}/history         [Admin JWT]
  Params:   from (LocalDate), to (LocalDate)
  Response: 200 List<OrderHistoryResponse>
```

### MenuController
```
GET /api/customer/menus                         [Table Token]
  Params:   categoryId (optional)
  Response: 200 List<MenuResponse>

GET /api/customer/menus/categories              [Table Token]
  Response: 200 List<CategoryResponse>

POST /api/admin/menus                           [Admin JWT]
  Request:  MenuCreateRequest(name, price, categoryName, description?, imageUrl?)
  Response: 201 MenuResponse

PUT /api/admin/menus/{menuId}                   [Admin JWT]
  Request:  MenuUpdateRequest(name, price, categoryName, description?, imageUrl?)
  Response: 200 MenuResponse

DELETE /api/admin/menus/{menuId}                [Admin JWT]
  Response: 204

PATCH /api/admin/menus/{menuId}/order           [Admin JWT]
  Request:  MenuOrderRequest(displayOrder)
  Response: 200
```

### OrderController
```
POST /api/customer/orders                       [Table Token]
  Request:  OrderCreateRequest(items: [{menuId, quantity}])
  Response: 201 OrderResponse

GET /api/customer/orders/session                [Table Token]
  Response: 200 List<OrderResponse>

GET /api/admin/orders/table/{tableId}           [Admin JWT]
  Response: 200 List<OrderResponse>

PATCH /api/admin/orders/{orderId}/status        [Admin JWT]
  Request:  OrderStatusRequest(status)
  Response: 200 OrderResponse

DELETE /api/admin/orders/{orderId}              [Admin JWT]
  Response: 204
```

### SseController
```
GET /api/sse/subscribe/{storeId}                [Admin JWT]
  Response: text/event-stream SseEmitter
```

---

## Repository Layer

### StoreRepository
```java
Optional<Store> findByStoreIdentifier(String storeIdentifier)
```

### TableRepository
```java
Optional<TableEntity> findByStoreIdAndTableNumber(Long storeId, Integer tableNumber)
Optional<TableEntity> findByIdAndStoreId(Long id, Long storeId)
```

### TableSessionRepository
```java
Optional<TableSession> findByTableIdAndIsActiveTrue(Long tableId)
List<TableSession> findByTableIdAndIsActiveFalseAndStartedAtBetween(Long tableId, LocalDateTime from, LocalDateTime to)
```

### MenuCategoryRepository
```java
List<MenuCategory> findByStoreIdOrderByDisplayOrder(Long storeId)
Optional<MenuCategory> findByStoreIdAndName(Long storeId, String name)
```

### MenuRepository
```java
List<Menu> findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(Long storeId)
List<Menu> findByStoreIdAndCategoryIdAndIsDeletedFalseOrderByDisplayOrder(Long storeId, Long categoryId)
List<Menu> findByCategoryIdAndIsDeletedFalseOrderByDisplayOrder(Long categoryId)
Optional<Menu> findByIdAndStoreId(Long id, Long storeId)
```

### OrderRepository
```java
List<Order> findBySessionIdOrderByCreatedAtDesc(Long sessionId)
```

---

## DTO Contracts

### Request DTOs
```java
record LoginRequest(String storeIdentifier, String username, String password)
record TableLoginRequest(String storeIdentifier, Integer tableNumber, String password)
record TableSetupRequest(Integer tableNumber, String password)
record MenuCreateRequest(String name, Integer price, String categoryName, String description, String imageUrl)
record MenuUpdateRequest(String name, Integer price, String categoryName, String description, String imageUrl)
record MenuOrderRequest(Integer displayOrder)
record OrderCreateRequest(List<OrderItemRequest> items)
record OrderItemRequest(Long menuId, Integer quantity)
record OrderStatusRequest(OrderStatus status)
```

### Response DTOs
```java
record LoginResponse(String token, Long storeId, String storeName)
record TableLoginResponse(String token, Long tableId, Integer tableNumber, Long sessionId)
record TableSetupResponse(Long tableId, Integer tableNumber)
record CategoryResponse(Long id, String name, Integer displayOrder)
record MenuResponse(Long id, String name, Integer price, String categoryName, String description, String imageUrl, Integer displayOrder)
record OrderResponse(Long id, Long tableId, Integer tableNumber, OrderStatus status, Integer totalAmount, List<OrderItemResponse> items, LocalDateTime createdAt)
record OrderItemResponse(Long id, String menuName, Integer menuPrice, Integer quantity, Integer subtotal)
record OrderHistoryResponse(Long sessionId, LocalDateTime startedAt, LocalDateTime completedAt, List<OrderResponse> orders)
```
