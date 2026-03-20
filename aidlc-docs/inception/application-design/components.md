# Components

## 아키텍처 개요

```
+--------------------------------------------------+
|              단일 React App (Frontend)            |
|  +---------------------+  +--------------------+ |
|  |  Customer Routes    |  |   Admin Routes     | |
|  |  /menu, /cart,      |  |  /admin/login,     | |
|  |  /orders            |  |  /admin/dashboard, | |
|  |                     |  |  /admin/menus      | |
|  +---------------------+  +--------------------+ |
+--------------------------------------------------+
                     |  REST API + SSE
+--------------------------------------------------+
|              Spring Boot Backend                  |
|  Controller Layer -> Service Layer -> Repository  |
+--------------------------------------------------+
                     |  JPA
+--------------------------------------------------+
|                   MySQL                           |
+--------------------------------------------------+
```

---

## Backend Components (Spring Boot)

### Controller Layer

#### AuthController
- **목적**: 관리자 인증 처리
- **책임**:
  - 관리자 로그인 요청 처리 및 JWT 발급
  - 로그아웃 처리
- **엔드포인트**: `POST /api/auth/login`, `POST /api/auth/logout`

#### TableController
- **목적**: 테이블 인증 및 세션 관리
- **책임**:
  - 테이블 자동 로그인 처리 (테이블 토큰 발급)
  - 테이블 초기 설정
  - 테이블 이용 완료 처리
  - 과거 주문 내역 조회
- **엔드포인트**: `POST /api/tables/login`, `POST /api/tables/setup`, `POST /api/tables/{id}/complete`, `GET /api/tables/{id}/history`

#### MenuController
- **목적**: 메뉴 CRUD 처리
- **책임**:
  - 메뉴 목록 조회 (카테고리별)
  - 메뉴 등록/수정/삭제 (관리자 전용)
  - 메뉴 순서 조정 (관리자 전용)
  - 카테고리 관리
- **엔드포인트**: `GET /api/menus`, `POST /api/menus`, `PUT /api/menus/{id}`, `DELETE /api/menus/{id}`, `PATCH /api/menus/{id}/order`

#### OrderController
- **목적**: 주문 생성 및 조회 처리
- **책임**:
  - 고객 주문 생성
  - 현재 세션 주문 내역 조회 (고객용)
  - 테이블별 주문 목록 조회 (관리자용)
  - 주문 상태 변경 (관리자용)
  - 주문 삭제 (관리자용)
- **엔드포인트**: `POST /api/orders`, `GET /api/orders/session`, `GET /api/orders/table/{tableId}`, `PATCH /api/orders/{id}/status`, `DELETE /api/orders/{id}`

#### SseController
- **목적**: 실시간 SSE 스트림 제공
- **책임**:
  - 관리자용 SSE 연결 수립 (매장별 채널)
  - 연결 유지 및 heartbeat 전송
- **엔드포인트**: `GET /api/sse/subscribe/{storeId}`

---

### Service Layer

#### AuthService
- **목적**: 인증 비즈니스 로직
- **책임**:
  - 관리자 자격증명 검증 (bcrypt)
  - JWT 토큰 생성/검증/갱신
  - 테이블 토큰 생성/검증

#### TableService
- **목적**: 테이블 세션 라이프사이클 관리
- **책임**:
  - 테이블 초기 설정 및 비밀번호 저장
  - 테이블 세션 시작/종료
  - 이용 완료 시 주문 이력 이동
  - 과거 세션 주문 내역 조회

#### MenuService
- **목적**: 메뉴 비즈니스 로직
- **책임**:
  - 메뉴 CRUD 처리
  - 카테고리별 메뉴 조회
  - 메뉴 노출 순서 관리
  - 입력값 검증 (필수 필드, 가격 범위)

#### OrderService
- **목적**: 주문 처리 비즈니스 로직
- **책임**:
  - 주문 생성 및 유효성 검증
  - 현재 세션 주문 조회
  - 주문 상태 변경
  - 주문 삭제 및 총액 재계산
  - 주문 생성 시 SSE 이벤트 발행

#### SseService
- **목적**: SSE 연결 및 이벤트 관리
- **책임**:
  - 매장별 SSE Emitter 풀 관리
  - 신규 주문/상태 변경 이벤트 발행
  - 연결 만료/오류 처리

---

### Repository Layer

| Repository | 대상 Entity | 주요 쿼리 |
|-----------|------------|---------|
| StoreRepository | Store | findByIdentifier |
| TableRepository | Table | findByStoreIdAndTableNumber |
| TableSessionRepository | TableSession | findByTableIdAndCompletedAtIsNull |
| MenuRepository | Menu | findByStoreIdAndCategoryId, findByStoreIdOrderByDisplayOrder |
| MenuCategoryRepository | MenuCategory | findByStoreIdOrderByDisplayOrder |
| OrderRepository | Order | findBySessionId, findByTableIdAndSessionId |
| OrderItemRepository | OrderItem | findByOrderId |

---

## Frontend Components (단일 React App)

### Routing 구조
```
/                    -> 리다이렉트 (테이블 설정 여부에 따라)
/menu                -> MenuPage (고객 기본 화면)
/cart                -> CartPage
/order/confirm       -> OrderConfirmPage
/orders              -> OrderHistoryPage (고객)
/admin/login         -> LoginPage
/admin/dashboard     -> DashboardPage
/admin/menus         -> MenuManagePage
/admin/orders/history -> AdminOrderHistoryPage
```

### Customer Pages

#### MenuPage
- **목적**: 메뉴 탐색 기본 화면
- **책임**: 카테고리 탭 표시, 메뉴 카드 그리드, 장바구니 진입점

#### CartPage
- **목적**: 장바구니 관리
- **책임**: 담긴 메뉴 목록, 수량 조절, 총액 표시, 주문 확인 진입

#### OrderConfirmPage
- **목적**: 주문 최종 확인 및 확정
- **책임**: 주문 내역 표시, 주문 확정 처리, 성공/실패 피드백

#### OrderHistoryPage (Customer)
- **목적**: 현재 세션 주문 내역 조회
- **책임**: 세션 주문 목록, 상태 표시

### Customer Components

| Component | 목적 |
|-----------|------|
| CategoryTabs | 카테고리 탭 네비게이션 |
| MenuCard | 메뉴 정보 카드 (이미지, 이름, 가격, 담기 버튼) |
| CartItem | 장바구니 아이템 (수량 조절, 소계) |
| CartSummary | 장바구니 총액 요약 |
| OrderStatusBadge | 주문 상태 배지 (대기중/준비중/완료) |

### Customer State/Context

| Context | 목적 |
|---------|------|
| AuthContext | 테이블 토큰, 매장/테이블 정보 저장 |
| CartContext | 장바구니 상태 관리 (localStorage 동기화) |

---

### Admin Pages

#### LoginPage
- **목적**: 관리자 로그인
- **책임**: 매장 식별자/사용자명/비밀번호 입력, JWT 저장

#### DashboardPage
- **목적**: 실시간 주문 모니터링
- **책임**: 테이블별 카드 그리드, SSE 연결, 신규 주문 강조

#### MenuManagePage
- **목적**: 메뉴 CRUD 관리
- **책임**: 메뉴 목록, 등록/수정/삭제, 순서 조정

#### AdminOrderHistoryPage
- **목적**: 과거 주문 내역 조회
- **책임**: 테이블별 과거 세션 주문 목록, 날짜 필터

### Admin Components

| Component | 목적 |
|-----------|------|
| TableCard | 테이블별 주문 현황 카드 (총액, 최신 주문 미리보기) |
| OrderDetailModal | 주문 전체 메뉴 상세 모달 |
| OrderStatusControl | 주문 상태 변경 버튼 그룹 |
| MenuForm | 메뉴 등록/수정 폼 |
| ConfirmDialog | 삭제/이용완료 확인 팝업 (공통) |

### Admin State/Context

| Context | 목적 |
|---------|------|
| AuthContext | 관리자 JWT 토큰, 매장 정보 저장 |
| SseContext | SSE 연결 관리, 실시간 주문 데이터 상태 |
