# Services

## 서비스 레이어 개요

서비스 레이어는 비즈니스 로직을 담당하며, Controller와 Repository 사이에서 오케스트레이션을 수행합니다.

---

## Backend Services

### AuthService
**목적**: 인증/인가 전담 서비스

**오케스트레이션**:
- 관리자 로그인: StoreRepository 조회 → bcrypt 비밀번호 검증 → JWT 생성
- 테이블 로그인: TableRepository 조회 → 비밀번호 검증 → 테이블 토큰 생성
- 토큰 검증: JWT 파싱 → 만료 확인 → Claims 반환

**의존성**: StoreRepository, TableRepository

---

### TableService
**목적**: 테이블 세션 라이프사이클 전담 서비스

**오케스트레이션**:
- 테이블 초기 설정: TableRepository 저장 → TableSession 생성
- 이용 완료 처리:
  1. 현재 활성 세션 조회 (TableSessionRepository)
  2. 세션 completedAt 업데이트
  3. 해당 세션의 주문들을 과거 이력으로 표시
  4. SseService를 통해 관리자에게 이벤트 발행
- 과거 내역 조회: TableSessionRepository → OrderRepository 조인 조회

**의존성**: TableRepository, TableSessionRepository, OrderRepository, SseService

---

### MenuService
**목적**: 메뉴 데이터 관리 서비스

**오케스트레이션**:
- 메뉴 조회: MenuCategoryRepository → MenuRepository (카테고리별 필터, 순서 정렬)
- 메뉴 등록: 입력값 검증 → MenuRepository 저장
- 메뉴 순서 조정: 기존 순서 조회 → 순서 재배치 → 일괄 업데이트

**의존성**: MenuRepository, MenuCategoryRepository

---

### OrderService
**목적**: 주문 처리 핵심 서비스

**오케스트레이션**:
- 주문 생성:
  1. 테이블 활성 세션 확인 (TableService)
  2. 메뉴 유효성 검증 (MenuRepository)
  3. Order + OrderItem 저장
  4. SseService를 통해 관리자에게 신규 주문 이벤트 발행
- 주문 삭제: Order 삭제 → 테이블 총액 재계산 → SSE 이벤트 발행
- 상태 변경: Order 상태 업데이트 → SSE 이벤트 발행

**의존성**: OrderRepository, OrderItemRepository, MenuRepository, TableService, SseService

---

### SseService
**목적**: 실시간 이벤트 발행 서비스

**오케스트레이션**:
- Emitter 풀 관리: ConcurrentHashMap<storeId, List<SseEmitter>>
- 이벤트 발행: 해당 매장의 모든 Emitter에 이벤트 전송
- 연결 정리: 만료/오류 Emitter 자동 제거

**이벤트 타입**:
| 이벤트 | 발행 시점 | 발행자 |
|--------|---------|--------|
| ORDER_CREATED | 신규 주문 생성 | OrderService |
| ORDER_STATUS_CHANGED | 주문 상태 변경 | OrderService |
| ORDER_DELETED | 주문 삭제 | OrderService |
| SESSION_COMPLETED | 테이블 이용 완료 | TableService |

**의존성**: 없음 (다른 서비스에서 주입받아 사용)

---

## Frontend Services (API Client)

### apiClient
**목적**: Axios 기반 HTTP 클라이언트 공통 설정

- Base URL 설정
- 요청 인터셉터: 토큰 자동 첨부 (Authorization 헤더)
- 응답 인터셉터: 401 시 자동 로그아웃 처리

### customerApi
**목적**: 고객용 API 호출 함수 모음
```typescript
getCategories(storeId): Promise<Category[]>
getMenus(storeId, categoryId?): Promise<Menu[]>
createOrder(orderData): Promise<Order>
getSessionOrders(sessionId): Promise<Order[]>
tableLogin(storeIdentifier, tableNumber, password): Promise<TableLoginResponse>
```

### adminApi
**목적**: 관리자용 API 호출 함수 모음
```typescript
login(storeIdentifier, username, password): Promise<LoginResponse>
getTableOrders(tableId): Promise<Order[]>
updateOrderStatus(orderId, status): Promise<Order>
deleteOrder(orderId): Promise<void>
completeTableSession(tableId): Promise<void>
getTableHistory(tableId, from, to): Promise<OrderHistory[]>
getMenus(storeId): Promise<Menu[]>
createMenu(menuData): Promise<Menu>
updateMenu(menuId, menuData): Promise<Menu>
deleteMenu(menuId): Promise<void>
updateMenuOrder(menuId, order): Promise<void>
```
