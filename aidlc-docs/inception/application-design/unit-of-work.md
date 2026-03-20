# Unit of Work

## 프로젝트 구조 (Monorepo)

```
table-order/                        <- workspace root (application code)
  frontend/                         <- Unit 1: React (TypeScript)
  backend/                          <- Unit 2: Spring Boot
  docker-compose.yml
aidlc-docs/                         <- documentation only
```

---

## Unit 1: Frontend

| 항목 | 내용 |
|------|------|
| 이름 | frontend |
| 기술 스택 | React 18, TypeScript, Vite |
| 개발 순서 | 1번째 (먼저 개발) |
| 디렉토리 | `frontend/` |

### 책임
- 고객 주문 UI (메뉴 탐색, 장바구니, 주문, 주문 내역)
- 관리자 대시보드 UI (실시간 모니터링, 테이블 관리, 메뉴 관리)
- 테이블 자동 로그인 및 localStorage 기반 세션 관리
- SSE 클라이언트 연결 및 실시간 데이터 처리
- 장바구니 localStorage 영속성

### 디렉토리 구조
```
frontend/
  src/
    pages/
      customer/         # MenuPage, CartPage, OrderConfirmPage, OrderHistoryPage
      admin/            # LoginPage, DashboardPage, MenuManagePage, AdminOrderHistoryPage
    components/
      customer/         # CategoryTabs, MenuCard, CartItem, CartSummary, OrderStatusBadge
      admin/            # TableCard, OrderDetailModal, OrderStatusControl, MenuForm, ConfirmDialog
      common/           # 공통 컴포넌트
    contexts/
      AuthContext.tsx   # 고객/관리자 인증 상태
      CartContext.tsx   # 장바구니 상태
      SseContext.tsx    # SSE 연결 및 실시간 데이터
    services/
      customerApi.ts    # 고객용 API 호출
      adminApi.ts       # 관리자용 API 호출
      apiClient.ts      # Axios 공통 설정
    types/              # TypeScript 타입 정의
    router/             # React Router 설정
  public/
  package.json
  vite.config.ts
  tsconfig.json
```

### 개발 전략
- Phase 1: Mock 데이터로 UI 완성 (msw 또는 로컬 mock)
- Phase 2: Backend API 연결로 교체

---

## Unit 2: Backend

| 항목 | 내용 |
|------|------|
| 이름 | backend |
| 기술 스택 | Java 17, Spring Boot 3, Spring Data JPA, MySQL 8 |
| 개발 순서 | 2번째 (Frontend 이후) |
| 디렉토리 | `backend/` |

### 책임
- REST API 제공 (고객용 + 관리자용)
- JWT 기반 관리자 인증 / 테이블 토큰 인증
- 테이블 세션 라이프사이클 관리
- 주문 처리 및 상태 관리
- SSE 서버 구현 (매장별 채널)
- 메뉴 CRUD 및 카테고리 관리
- MySQL 데이터 영속성

### 디렉토리 구조
```
backend/
  src/main/java/com/tableorder/
    controller/         # AuthController, TableController, MenuController, OrderController, SseController
    service/            # AuthService, TableService, MenuService, OrderService, SseService
    repository/         # 각 Entity Repository
    entity/             # Store, Table, TableSession, Menu, MenuCategory, Order, OrderItem
    dto/
      request/          # LoginRequest, OrderCreateRequest 등
      response/         # LoginResponse, MenuResponse 등
    security/           # JWT 필터, 인증 설정
    config/             # Spring Security, CORS, JPA 설정
  src/main/resources/
    application.yml
  src/test/
  build.gradle (또는 pom.xml)
```

---

## Docker Compose 구성 (루트)

```
docker-compose.yml
  services:
    mysql:      MySQL 8 데이터베이스
    backend:    Spring Boot API (포트 8080)
    frontend:   React 앱 (포트 3000, 개발 시 Vite dev server)
```
