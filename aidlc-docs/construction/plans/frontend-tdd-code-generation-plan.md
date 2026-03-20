# TDD Code Generation Plan - Frontend

## Unit Context
- **Workspace Root**: `/` (monorepo)
- **Application Code 위치**: `frontend/`
- **Project Type**: Greenfield
- **Stories**: US-C-01 ~ US-C-14, US-A-01 ~ US-A-13 (총 23개)
- **Test Framework**: Vitest + React Testing Library
- **Contracts**: `aidlc-docs/construction/plans/frontend-contracts.md`
- **Test Plan**: `aidlc-docs/construction/plans/frontend-test-plan.md`

---

## Plan Step 0: 프로젝트 구조 셋업 (Skeleton)

- [x] 0-1. Vite + React + TypeScript 프로젝트 초기화 (`frontend/`)
- [x] 0-2. 의존성 설치 (package.json 생성)
- [x] 0-3. 설정 파일 생성 (vite.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js, vitest.config.ts)
- [x] 0-4. 환경 변수 파일 생성 (.env.development, .env.production)
- [x] 0-5. 디렉토리 구조 생성 (types, utils, contexts, services, hooks, lib, components, pages, router)
- [x] 0-6. Skeleton 컴파일 확인

---

## Plan Step 1: Utility Functions (TDD)

### 1-1. cartUtils.ts
- [x] TC-FE-001~003: calculateTotal (RED → GREEN → REFACTOR)
- [x] TC-FE-004~005: calculateCount (RED → GREEN → REFACTOR)
- [x] localStorage 유틸 함수 구현 (saveCartToStorage, loadCartFromStorage)

### 1-2. authUtils.ts
- [x] TC-FE-006~007: isTokenExpired (RED → GREEN → REFACTOR)
- [x] loadAdminAuth, loadTableAuth 구현

---

## Plan Step 2: Context Layer (TDD)

### 2-1. CartContext
- [x] TC-FE-008~014: CartContext 전체 (RED → GREEN → REFACTOR)
- [x] CartProvider 완성 (localStorage 초기화 복원 포함)

### 2-2. AuthContext
- [x] TC-FE-015~016: isAdminTokenExpired (RED → GREEN → REFACTOR)
- [x] setupTable, adminLogin, adminLogout 구현
- [x] AuthProvider 완성

### 2-3. SseContext
- [x] connect/disconnect/clearNewOrder 구현
- [x] SSE 이벤트 핸들러 구현 (ORDER_CREATED, ORDER_STATUS_CHANGED, ORDER_DELETED, SESSION_COMPLETED)
- [x] 재연결 로직 구현 (최대 5회, 3초 간격)

---

## Plan Step 3: Service Layer (Mock API)

- [x] apiClient.ts (Axios 인스턴스, Request/Response Interceptor)
- [x] mock/data/menus.ts (mockCategories, mockMenus)
- [x] mock/data/orders.ts (mockOrders, mockTableOrderSummaries)
- [x] customerApi.ts (VITE_USE_MOCK 분기 처리)
- [x] adminApi.ts (VITE_USE_MOCK 분기 처리)

---

## Plan Step 4: Common Components (TDD)

- [x] TC-FE-017~019: OrderStatusBadge (RED → GREEN → REFACTOR)
- [x] TC-FE-030~031: ConfirmDialog (RED → GREEN → REFACTOR)
- [x] Toast / ToastProvider / useToast hook
- [x] ErrorModal

---

## Plan Step 5: Customer Components (TDD)

- [x] TC-FE-020~022: MenuCard (RED → GREEN → REFACTOR)
- [x] TC-FE-023~024: CartItem (RED → GREEN → REFACTOR)
- [x] CategoryTabs
- [x] CartDrawer (사이드 드로어)
- [x] CartFab
- [x] OrderHistoryItem

---

## Plan Step 6: Admin Components (TDD)

- [x] TC-FE-028~029: TableCard (RED → GREEN → REFACTOR)
- [x] TC-FE-025~027: MenuForm (RED → GREEN → REFACTOR)
- [x] OrderDetailModal
- [x] OrderStatusControl
- [x] TableActionButtons (OrderDetailModal에 통합)

---

## Plan Step 7: Pages

### 7-1. Customer Pages
- [x] TableSetupPage (US-C-01, US-C-02)
- [x] MenuPage (US-C-04, US-C-05)
- [x] OrderConfirmPage (US-C-10, US-C-11, US-C-12) - 5초 카운트다운 포함
- [x] CustomerOrderHistoryPage (US-C-13, US-C-14)

### 7-2. Admin Pages
- [x] AdminLoginPage (US-A-01)
- [x] DashboardPage (US-A-03, US-A-04, US-A-05, US-A-06) - 초기 REST API 로드 + SSE 연결
- [x] MenuManagePage (US-A-10, US-A-11, US-A-12, US-A-13)
- [x] AdminOrderHistoryPage (US-A-09)

---

## Plan Step 8: Router 및 App 조립

- [x] queryClient.ts, queryKeys.ts
- [x] useOnlineStatus hook
- [x] ErrorBoundary
- [x] Router (PrivateRoute, AdminPrivateRoute, Code Splitting)
- [x] App.tsx (Provider 계층: QueryClientProvider → ErrorBoundary → ToastProvider → AuthProvider → CartProvider → Router)
- [x] main.tsx, index.html, index.css

---

## Plan Step 9: 배포 산출물

- [x] `frontend/Dockerfile` (multi-stage build)
- [x] `frontend/nginx.conf` (SPA fallback)
- [x] `docker-compose.yml` (workspace root)
- [x] `frontend/README.md`

---

## Story 커버리지 추적

| Story ID | Plan Step | Status |
|----------|-----------|--------|
| US-C-01 | Step 7-1 (TableSetupPage) | 🟢 |
| US-C-02 | Step 2-2 (AuthContext) + Step 7-1 | 🟢 |
| US-C-03 | Step 2-3 (SseContext) + Step 6 | 🟢 |
| US-C-04 | Step 7-1 (MenuPage) | 🟢 |
| US-C-05 | Step 5-1 (MenuCard) | 🟢 |
| US-C-06 | Step 2-1 (CartContext) + Step 5-1 | 🟢 |
| US-C-07 | Step 2-1 + Step 5-2 | 🟢 |
| US-C-08 | Step 2-1 (clearCart) | 🟢 |
| US-C-09 | Step 2-1 (localStorage) | 🟢 |
| US-C-10 | Step 7-1 (OrderConfirmPage) | 🟢 |
| US-C-11 | Step 7-1 + Step 3-3 | 🟢 |
| US-C-12 | Step 7-1 (ErrorModal) | 🟢 |
| US-C-13 | Step 7-1 (CustomerOrderHistoryPage) | 🟢 |
| US-C-14 | Step 4-1 (OrderStatusBadge) | 🟢 |
| US-A-01 | Step 7-2 (AdminLoginPage) | 🟢 |
| US-A-02 | Step 2-2 (AuthContext) | 🟢 |
| US-A-03 | Step 7-2 (DashboardPage) | 🟢 |
| US-A-04 | Step 2-3 (SseContext) + Step 6-1 | 🟢 |
| US-A-05 | Step 6-3 (OrderDetailModal) | 🟢 |
| US-A-06 | Step 6-3 (OrderStatusControl) | 🟢 |
| US-A-07 | Step 6-3 (OrderDetailModal - 이용완료) | 🟢 |
| US-A-08 | Step 4-2 (ConfirmDialog) | 🟢 |
| US-A-09 | Step 7-2 (AdminOrderHistoryPage) | 🟢 |
| US-A-10 | Step 6-2 (MenuForm) | 🟢 |
| US-A-11 | Step 6-2 (MenuForm 수정 모드) | 🟢 |
| US-A-12 | Step 4-2 (ConfirmDialog) + Step 7-2 | 🟢 |
| US-A-13 | Step 7-2 (MenuManagePage) | 🟢 |
