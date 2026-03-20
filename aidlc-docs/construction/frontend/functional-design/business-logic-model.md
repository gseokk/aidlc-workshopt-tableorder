# Business Logic Model - Frontend

---

## 1. 인증 플로우

### 고객 테이블 자동 로그인
```
앱 시작
  |
  +-- localStorage에 tableAuthConfig 있음?
  |     YES -> POST /api/tables/login
  |             |
  |             +-- 성공 -> token 저장 -> /menu 이동
  |             +-- 실패 -> 초기 설정 화면
  |
  +-- NO -> 초기 설정 화면
              |
              관리자가 storeIdentifier, tableNumber, password 입력
              -> POST /api/tables/login
              -> 성공 시 config + token 저장 -> /menu 이동
```

### 관리자 로그인
```
/admin/login 접근
  |
  storeIdentifier, username, password 입력
  -> POST /api/auth/login
  -> 성공: JWT + expiresAt 저장 -> /admin/dashboard 이동
  -> 실패: 에러 메시지 표시
```

---

## 2. 장바구니 상태 관리

```
CartContext 초기화
  -> localStorage에서 cartItems 복원

메뉴 카드 "담기" 클릭
  -> CartContext.addItem(menu)
     -> 기존 항목 있음? quantity++ : 새 항목 추가
     -> totalAmount 재계산
     -> localStorage 저장

장바구니 드로어 열기
  -> 현재 CartState 표시
  -> 수량 +/- 버튼 -> CartContext.updateQuantity()
     -> quantity == 0 -> CartContext.removeItem()
     -> localStorage 저장

주문 확정
  -> CartState.items -> CreateOrderRequest 변환
  -> POST /api/orders
  -> 성공: CartContext.clearCart() -> localStorage 삭제 -> 주문 번호 표시
  -> 실패: 에러 모달 표시, CartState 유지
```

---

## 3. 실시간 주문 모니터링 (SSE)

```
DashboardPage 마운트
  |
  1. GET /api/orders/table/{tableId} (모든 테이블)
     -> 초기 TableOrderSummary[] 로드
  |
  2. SseContext.connect(storeId)
     -> EventSource('/api/sse/subscribe/{storeId}') 연결
  |
  SSE 이벤트 수신
  |
  +-- ORDER_CREATED
  |     -> TableOrderSummary에 신규 Order 추가
  |     -> newOrderTableIds에 tableId 추가 (강조 표시)
  |     -> totalAmount 재계산
  |
  +-- ORDER_STATUS_CHANGED
  |     -> 해당 Order의 status 업데이트
  |
  +-- ORDER_DELETED
  |     -> 해당 Order 제거
  |     -> totalAmount 재계산
  |
  +-- SESSION_COMPLETED
        -> 해당 테이블 orders 초기화
        -> totalAmount = 0

DashboardPage 언마운트
  -> SseContext.disconnect()
```

---

## 4. 테이블 이용 완료 플로우

```
관리자가 테이블 카드 "이용 완료" 버튼 클릭
  -> ConfirmDialog 표시
  -> 확인 클릭
     -> POST /api/tables/{tableId}/complete
     -> 성공: Toast 표시 (SSE로 SESSION_COMPLETED 이벤트 수신 후 UI 자동 업데이트)
     -> 실패: 에러 모달 표시
```

---

## 5. 주문 상태 변경 플로우

```
관리자가 OrderDetailModal에서 상태 변경 버튼 클릭
  -> PATCH /api/orders/{orderId}/status
  -> 성공: Toast 표시 (SSE로 ORDER_STATUS_CHANGED 이벤트 수신 후 UI 자동 업데이트)
  -> 실패: Toast 에러 표시
```

---

## 6. Mock API 전략 (Phase 1)

Frontend 개발 시 Backend 없이 동작하기 위한 mock 전략:

```
src/services/mock/
  handlers.ts       <- msw request handlers
  data/
    menus.ts        <- 샘플 메뉴 데이터
    orders.ts       <- 샘플 주문 데이터
    categories.ts   <- 샘플 카테고리 데이터

개발 환경: msw로 API 요청 인터셉트
프로덕션: 실제 Backend API 호출
```
