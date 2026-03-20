# Component Dependency

## 전체 의존성 구조

```
[Customer React App]          [Admin React App]
  AuthContext                   AuthContext
  CartContext                   SseContext
  customerApi                   adminApi
       |                             |
       +----------+  +--------------+
                  |  |
         [Spring Boot API]
         Controller Layer
              |
         Service Layer
         +----+----+----+----+----+
         |    |    |    |    |    |
       Auth Table Menu Order Sse
         |    |    |    |    |
         +----+----+----+----+
              |
         Repository Layer
              |
           [MySQL]
```

---

## Backend 의존성 매트릭스

| 컴포넌트 | 의존하는 컴포넌트 |
|---------|----------------|
| AuthController | AuthService |
| TableController | TableService, AuthService |
| MenuController | MenuService, AuthService |
| OrderController | OrderService, AuthService |
| SseController | SseService, AuthService |
| AuthService | StoreRepository, TableRepository |
| TableService | TableRepository, TableSessionRepository, OrderRepository, SseService |
| MenuService | MenuRepository, MenuCategoryRepository |
| OrderService | OrderRepository, OrderItemRepository, MenuRepository, TableService, SseService |
| SseService | (없음 - 다른 서비스에서 주입) |

---

## 인증 흐름

```
[고객 테이블]
  브라우저 -> POST /api/tables/login
           <- 테이블 토큰 (JWT, role=TABLE)
  이후 요청 -> Authorization: Bearer <테이블 토큰>

[관리자]
  브라우저 -> POST /api/auth/login
           <- 관리자 JWT (role=ADMIN)
  이후 요청 -> Authorization: Bearer <관리자 JWT>
```

---

## 실시간 데이터 흐름 (SSE)

**중요**: 대시보드 초기 로드는 REST API로 DB 조회, SSE는 이후 신규 이벤트 수신 전용.
관리자가 늦게 로그인해도 로그인 전에 들어온 미처리 주문은 초기 REST API 조회로 모두 표시됨.

```
[관리자 브라우저 - 로그인 시]
  1. GET /api/orders/table/{tableId} (REST)
     -> DB에서 현재 활성 세션의 모든 주문 조회
     -> 로그인 전 미처리 주문 포함하여 대시보드에 표시

  2. GET /api/sse/subscribe/{storeId}  (SSE 연결 수립)
     -> 이후 발생하는 신규 이벤트만 실시간 수신
  3. 연결 유지 (heartbeat 30초마다)

[고객 브라우저]
  4. POST /api/orders  (주문 생성)

[OrderService]
  5. 주문 저장 완료 (DB)
  6. SseService.sendOrderEvent(storeId, ORDER_CREATED)

[SseService]
  7. 해당 storeId의 모든 Emitter에 이벤트 전송

[관리자 브라우저]
  8. SSE 이벤트 수신 -> SseContext 상태 업데이트
  9. DashboardPage 자동 리렌더링
```

---

## Frontend 컴포넌트 의존성

### Customer 앱
```
App
 +-- AuthContext (Provider)
 |    +-- CartContext (Provider)
 |         +-- Router
 |              +-- MenuPage
 |              |    +-- CategoryTabs
 |              |    +-- MenuCard (n개)
 |              +-- CartPage
 |              |    +-- CartItem (n개)
 |              |    +-- CartSummary
 |              +-- OrderConfirmPage
 |              +-- OrderHistoryPage
 |                   +-- OrderStatusBadge (n개)
```

### Admin 앱
```
App
 +-- AuthContext (Provider)
 |    +-- SseContext (Provider)
 |         +-- Router
 |              +-- LoginPage
 |              +-- DashboardPage
 |              |    +-- TableCard (n개)
 |              |         +-- OrderDetailModal
 |              |         +-- OrderStatusControl
 |              +-- MenuManagePage
 |              |    +-- MenuForm
 |              |    +-- ConfirmDialog
 |              +-- AdminOrderHistoryPage
```

---

## 데이터 모델 관계

```
Store (1) ----< Table (N)
Table (1) ----< TableSession (N)
TableSession (1) ----< Order (N)
Order (1) ----< OrderItem (N)
OrderItem (N) >---- Menu (1)
Store (1) ----< MenuCategory (N)
MenuCategory (1) ----< Menu (N)
```
