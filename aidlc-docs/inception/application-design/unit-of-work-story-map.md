# Unit of Work - Story Map

## Unit 1: Frontend

### Epic 1: 고객 인증 및 세션
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-01 | 테이블 초기 설정 (관리자 수행) | `pages/admin/DashboardPage` + `components/admin/TableCard` |
| US-C-02 | 자동 로그인 | `contexts/AuthContext` + `router/` |
| US-C-03 | 테이블 세션 라이프사이클 | `components/admin/TableCard` + `contexts/SseContext` |

### Epic 2: 메뉴 탐색
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-04 | 카테고리별 메뉴 조회 | `pages/customer/MenuPage` + `components/customer/CategoryTabs` |
| US-C-05 | 메뉴 상세 정보 확인 | `components/customer/MenuCard` |

### Epic 3: 장바구니
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-06 | 메뉴 장바구니 추가 | `contexts/CartContext` + `components/customer/MenuCard` |
| US-C-07 | 장바구니 수량 조절 | `pages/customer/CartPage` + `components/customer/CartItem` |
| US-C-08 | 장바구니 비우기 | `pages/customer/CartPage` |
| US-C-09 | 장바구니 로컬 저장 유지 | `contexts/CartContext` (localStorage) |

### Epic 4: 주문
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-10 | 주문 최종 확인 | `pages/customer/OrderConfirmPage` |
| US-C-11 | 주문 성공 플로우 | `pages/customer/OrderConfirmPage` + `services/customerApi` |
| US-C-12 | 주문 실패 처리 | `pages/customer/OrderConfirmPage` |

### Epic 5: 주문 내역 조회
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-13 | 현재 세션 주문 목록 조회 | `pages/customer/OrderHistoryPage` + `services/customerApi` |
| US-C-14 | 주문 상태 확인 | `components/customer/OrderStatusBadge` |

### Epic 6: 관리자 인증
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-01 | 매장 로그인 | `pages/admin/LoginPage` + `contexts/AuthContext` |
| US-A-02 | 세션 유지 및 자동 로그아웃 | `contexts/AuthContext` + `services/apiClient` |

### Epic 7: 실시간 주문 모니터링
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-03 | 그리드 대시보드 조회 | `pages/admin/DashboardPage` + `components/admin/TableCard` |
| US-A-04 | 신규 주문 실시간 수신 (SSE) | `contexts/SseContext` + `components/admin/TableCard` |
| US-A-05 | 주문 상세 보기 | `components/admin/OrderDetailModal` |
| US-A-06 | 주문 상태 변경 | `components/admin/OrderStatusControl` + `services/adminApi` |

### Epic 8: 테이블 관리
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-07 | 테이블 초기 설정 | `components/admin/TableCard` + `services/adminApi` |
| US-A-08 | 주문 삭제 | `components/admin/OrderDetailModal` + `components/common/ConfirmDialog` |
| US-A-09 | 과거 주문 내역 조회 | `pages/admin/AdminOrderHistoryPage` + `services/adminApi` |

### Epic 9: 메뉴 관리
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-10 | 메뉴 등록 | `pages/admin/MenuManagePage` + `components/admin/MenuForm` |
| US-A-11 | 메뉴 수정 | `pages/admin/MenuManagePage` + `components/admin/MenuForm` |
| US-A-12 | 메뉴 삭제 | `pages/admin/MenuManagePage` + `components/common/ConfirmDialog` |
| US-A-13 | 메뉴 노출 순서 조정 | `pages/admin/MenuManagePage` + `services/adminApi` |

---

## Unit 2: Backend

### Epic 1: 고객 인증 및 세션
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-01 | 테이블 초기 설정 | `TableController.setupTable` + `TableService.setupTable` |
| US-C-02 | 자동 로그인 | `TableController.tableLogin` + `AuthService.generateTableToken` |
| US-C-03 | 테이블 세션 라이프사이클 | `TableController.completeTableSession` + `TableService.completeTableSession` |

### Epic 2~5: 고객 기능
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-C-04, 05 | 메뉴 탐색 | `MenuController.getMenus` + `MenuService` |
| US-C-06~09 | 장바구니 | Frontend only (localStorage) |
| US-C-10~12 | 주문 | `OrderController.createOrder` + `OrderService.createOrder` |
| US-C-13, 14 | 주문 내역 | `OrderController.getSessionOrders` + `OrderService` |

### Epic 6: 관리자 인증
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-01 | 매장 로그인 | `AuthController.login` + `AuthService.login` |
| US-A-02 | 세션 유지 | `security/JwtFilter` + `AuthService.validateAdminJwt` |

### Epic 7: 실시간 주문 모니터링
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-03 | 그리드 대시보드 | `OrderController.getTableOrders` |
| US-A-04 | SSE 실시간 수신 | `SseController.subscribe` + `SseService` |
| US-A-05 | 주문 상세 | `OrderController.getTableOrders` (상세 포함) |
| US-A-06 | 주문 상태 변경 | `OrderController.updateOrderStatus` + `SseService.sendOrderEvent` |

### Epic 8: 테이블 관리
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-07 | 테이블 초기 설정 | `TableController.setupTable` |
| US-A-08 | 주문 삭제 | `OrderController.deleteOrder` + `OrderService.deleteOrder` |
| US-A-09 | 과거 주문 내역 | `TableController.getTableHistory` + `TableService.getTableHistory` |

### Epic 9: 메뉴 관리
| Story ID | Story | 구현 위치 |
|----------|-------|---------|
| US-A-10~13 | 메뉴 CRUD + 순서 | `MenuController` + `MenuService` |

---

## Story 커버리지 요약

| 구분 | 총 Story 수 | Frontend | Backend | 양쪽 모두 |
|------|-----------|---------|---------|---------|
| 고객 Epic (1~5) | 14 | 14 | 10 | 10 |
| 관리자 Epic (6~9) | 9 | 9 | 9 | 9 |
| **합계** | **23** | **23** | **19** | **19** |

> 장바구니 관련 Story (US-C-06~09) 4개는 Frontend(localStorage)에서만 처리되며 Backend API 불필요.
