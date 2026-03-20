# TDD Code Generation Plan - Backend

## Unit Context
- **Workspace Root**: /workspace
- **Project Type**: Greenfield (Monorepo)
- **Code Location**: `backend/` (workspace root)
- **Test Location**: `backend/src/test/java/com/tableorder/`
- **Stories**: US-C-01~05, US-C-10~14, US-A-01~13

---

## Plan Step 0: 프로젝트 구조 및 Skeleton 생성

### 0-1. 프로젝트 설정 파일
- [x] `backend/build.gradle` 생성 (의존성: Spring Boot 3, Security, JPA, MySQL, jjwt, Lombok, springdoc)
- [x] `backend/settings.gradle` 생성
- [x] `backend/src/main/resources/application.yml` 생성
- [x] `backend/src/main/resources/application-dev.yml` 생성
- [x] `backend/src/main/resources/application-test.yml` 생성
- [x] `backend/Dockerfile` 생성

### 0-2. Entity Skeleton
- [x] `Store.java`
- [x] `TableEntity.java`
- [x] `TableSession.java`
- [x] `MenuCategory.java`
- [x] `Menu.java`
- [x] `Order.java` + `OrderStatus.java`
- [x] `OrderItem.java`

### 0-3. Repository Skeleton
- [x] `StoreRepository.java`
- [x] `TableRepository.java`
- [x] `TableSessionRepository.java`
- [x] `MenuCategoryRepository.java`
- [x] `MenuRepository.java`
- [x] `OrderRepository.java`
- [x] `OrderItemRepository.java`

### 0-4. DTO Skeleton
- [x] Request DTOs (LoginRequest, TableLoginRequest, TableSetupRequest, MenuCreateRequest, MenuUpdateRequest, MenuOrderRequest, OrderCreateRequest, OrderItemRequest, OrderStatusRequest)
- [x] Response DTOs (LoginResponse, TableLoginResponse, TableSetupResponse, CategoryResponse, MenuResponse, OrderResponse, OrderItemResponse, OrderHistoryResponse)

### 0-5. Security Skeleton
- [x] `JwtProvider.java`
- [x] `JwtAuthenticationFilter.java`
- [x] `AdminClaims.java`, `TableClaims.java`
- [x] `SecurityConfig.java`

### 0-6. Exception Skeleton
- [x] `UnauthorizedException.java`, `ForbiddenException.java`, `NotFoundException.java`, `BadRequestException.java`
- [x] `GlobalExceptionHandler.java`
- [x] `ErrorResponse.java`

### 0-7. Service Skeleton (메서드 본문: throw new UnsupportedOperationException())
- [x] `AuthService.java`
- [x] `TableService.java`
- [x] `MenuService.java`
- [x] `OrderService.java`
- [x] `SseService.java`

### 0-8. Controller Skeleton
- [x] `AuthController.java`
- [x] `TableController.java`
- [x] `MenuController.java`
- [x] `OrderController.java`
- [x] `SseController.java`

### 0-9. Config & Init
- [x] `CorsConfig.java`
- [x] `SwaggerConfig.java`
- [x] `DataInitializer.java`
- [x] `TableOrderApplication.java` (main)

---

## Plan Step 1: Security Layer (TDD)

### 1-1. JwtProvider
- [x] TC-BE-001 관련: generateAdminToken() - RED-GREEN-REFACTOR
- [x] TC-BE-004 관련: generateTableToken() - RED-GREEN-REFACTOR
- [x] validateToken() - RED-GREEN-REFACTOR
- [x] getTokenType() - RED-GREEN-REFACTOR

---

## Plan Step 2: Service Layer (TDD)

### 2-1. AuthService
- [x] login() - TC-BE-001, 002, 003 - RED-GREEN-REFACTOR
- [x] tableLogin() - TC-BE-004, 005, 006 - RED-GREEN-REFACTOR

### 2-2. TableService
- [x] setupTable() - TC-BE-007, 008 - RED-GREEN-REFACTOR
- [x] completeTableSession() - TC-BE-009, 010 - RED-GREEN-REFACTOR
- [x] getOrCreateActiveSession() - RED-GREEN-REFACTOR
- [x] getTableHistory() - RED-GREEN-REFACTOR

### 2-3. MenuService
- [x] getMenusByCategory() - RED-GREEN-REFACTOR
- [x] getCategories() - RED-GREEN-REFACTOR
- [x] createMenu() - TC-BE-011, 012 - RED-GREEN-REFACTOR
- [x] updateMenu() - RED-GREEN-REFACTOR
- [x] deleteMenu() - TC-BE-013, 014 - RED-GREEN-REFACTOR
- [x] updateMenuOrder() - TC-BE-015 - RED-GREEN-REFACTOR

### 2-4. OrderService
- [x] createOrder() - TC-BE-016, 017, 018, 019 - RED-GREEN-REFACTOR
- [x] getSessionOrders() - RED-GREEN-REFACTOR
- [x] getTableOrders() - RED-GREEN-REFACTOR
- [x] updateOrderStatus() - TC-BE-020, 021, 022 - RED-GREEN-REFACTOR
- [x] deleteOrder() - TC-BE-023 - RED-GREEN-REFACTOR

### 2-5. SseService
- [x] createEmitter() - TC-BE-024 - RED-GREEN-REFACTOR
- [x] sendEvent() - TC-BE-025, 026 - RED-GREEN-REFACTOR
- [x] removeEmitter() - RED-GREEN-REFACTOR

---

## Plan Step 3: Repository Layer (TDD - @DataJpaTest)

- [x] TableSessionRepository - TC-BE-034, 035 - RED-GREEN-REFACTOR
- [x] MenuRepository - TC-BE-036, 037 - RED-GREEN-REFACTOR

---

## Plan Step 4: Controller Layer (TDD - MockMvc)

- [x] AuthController - TC-BE-027, 028 - RED-GREEN-REFACTOR
- [x] MenuController - TC-BE-029, 030, 031 - RED-GREEN-REFACTOR
- [x] OrderController - TC-BE-032, 033 - RED-GREEN-REFACTOR

---

## Plan Step 5: 추가 산출물

- [x] `.env.example` 파일 생성 (workspace root)
- [x] `backend/README.md` 생성
- [x] `docker-compose.yml` 업데이트 (frontend 설계와 통합)

---

## 진행 현황

| 단계 | 상태 | 테스트 |
|------|------|--------|
| Step 0: Skeleton | ✅ | - |
| Step 1: Security | ✅ | 4/4 |
| Step 2: Services | ✅ | 23/23 |
| Step 3: Repository | ✅ | 4/4 |
| Step 4: Controller | ✅ | 6/6 |
| Step 5: 추가 산출물 | ✅ | - |
| **합계** | **완료** | **37/37** |
