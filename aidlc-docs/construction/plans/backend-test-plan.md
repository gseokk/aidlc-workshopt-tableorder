# Test Plan - Backend (TDD)

## Unit Overview
- **Unit**: backend (Spring Boot)
- **Test Framework**: JUnit 5 + Mockito + AssertJ + @DataJpaTest + MockMvc
- **Coverage Target**: Service 레이어 70% 이상

---

## AuthService Tests

### AuthService.login()
- **TC-BE-001**: 유효한 자격증명으로 로그인 성공
  - Given: 존재하는 매장, 올바른 username/password
  - When: login("store001", "admin", "password") 호출
  - Then: LoginResponse 반환, token 포함
  - Story: US-A-01 | Status: 🟢 Passed

- **TC-BE-002**: 존재하지 않는 매장으로 로그인 실패
  - Given: 없는 storeIdentifier
  - When: login("unknown", "admin", "password") 호출
  - Then: UnauthorizedException 발생
  - Story: US-A-01 | Status: 🟢 Passed

- **TC-BE-003**: 잘못된 비밀번호로 로그인 실패
  - Given: 존재하는 매장, 틀린 password
  - When: login("store001", "admin", "wrong") 호출
  - Then: UnauthorizedException 발생
  - Story: US-A-01 | Status: 🟢 Passed

### AuthService.tableLogin()
- **TC-BE-004**: 유효한 자격증명으로 테이블 로그인 성공 (신규 세션 생성)
  - Given: 존재하는 테이블, 올바른 password, 활성 세션 없음
  - When: tableLogin("store001", 1, "1234") 호출
  - Then: TableLoginResponse 반환, 새 세션 생성됨
  - Story: US-C-02 | Status: 🟢 Passed

- **TC-BE-005**: 테이블 로그인 성공 (기존 활성 세션 재사용)
  - Given: 존재하는 테이블, 올바른 password, 활성 세션 존재
  - When: tableLogin("store001", 1, "1234") 호출
  - Then: TableLoginResponse 반환, 기존 sessionId 포함
  - Story: US-C-02 | Status: 🟢 Passed

- **TC-BE-006**: 잘못된 테이블 비밀번호로 로그인 실패
  - Given: 존재하는 테이블, 틀린 password
  - When: tableLogin("store001", 1, "wrong") 호출
  - Then: UnauthorizedException 발생
  - Story: US-C-02 | Status: 🟢 Passed

---

## TableService Tests

### TableService.setupTable()
- **TC-BE-007**: 신규 테이블 설정
  - Given: 해당 번호의 테이블 없음
  - When: setupTable(storeId, 1, "1234") 호출
  - Then: 새 TableEntity 생성, TableSetupResponse 반환
  - Story: US-C-01 | Status: 🟢 Passed

- **TC-BE-008**: 기존 테이블 비밀번호 업데이트
  - Given: 이미 존재하는 테이블 번호
  - When: setupTable(storeId, 1, "newpass") 호출
  - Then: 기존 테이블 비밀번호 업데이트, 새 테이블 미생성
  - Story: US-C-01 | Status: 🟢 Passed

### TableService.completeTableSession()
- **TC-BE-009**: 활성 세션 완료 처리
  - Given: 활성 세션 존재
  - When: completeTableSession(tableId, storeId) 호출
  - Then: isActive=false, completedAt 설정, SSE 이벤트 발행
  - Story: US-C-03 | Status: 🟢 Passed

- **TC-BE-010**: 활성 세션 없을 때 완료 처리 실패
  - Given: 활성 세션 없음
  - When: completeTableSession(tableId, storeId) 호출
  - Then: NotFoundException 발생
  - Story: US-C-03 | Status: 🟢 Passed

---

## MenuService Tests

### MenuService.createMenu()
- **TC-BE-011**: 신규 카테고리로 메뉴 등록
  - Given: 해당 카테고리명 없음
  - When: createMenu(storeId, request) 호출
  - Then: 카테고리 자동 생성, 메뉴 저장, MenuResponse 반환
  - Story: US-A-10 | Status: 🟢 Passed

- **TC-BE-012**: 기존 카테고리로 메뉴 등록
  - Given: 해당 카테고리명 이미 존재
  - When: createMenu(storeId, request) 호출
  - Then: 기존 카테고리 재사용, 메뉴 저장
  - Story: US-A-10 | Status: 🟢 Passed

### MenuService.deleteMenu()
- **TC-BE-013**: 메뉴 Soft Delete
  - Given: 존재하는 메뉴
  - When: deleteMenu(storeId, menuId) 호출
  - Then: isDeleted=true, 실제 삭제 안됨
  - Story: US-A-12 | Status: 🟢 Passed

- **TC-BE-014**: 존재하지 않는 메뉴 삭제 실패
  - Given: 없는 menuId
  - When: deleteMenu(storeId, menuId) 호출
  - Then: NotFoundException 발생
  - Story: US-A-12 | Status: 🟢 Passed

### MenuService.updateMenuOrder()
- **TC-BE-015**: 메뉴 순서 변경 시 일괄 재정렬
  - Given: 카테고리 내 메뉴 3개 (order: 1,2,3)
  - When: updateMenuOrder(storeId, menu2Id, 1) 호출
  - Then: menu2=1, menu1=2, menu3=3으로 재정렬
  - Story: US-A-13 | Status: 🟢 Passed

---

## OrderService Tests

### OrderService.createOrder()
- **TC-BE-016**: 유효한 주문 생성
  - Given: 활성 세션, 유효한 메뉴들
  - When: createOrder(tableId, sessionId, request) 호출
  - Then: Order + OrderItems 저장, totalAmount 계산, SSE 이벤트 발행
  - Story: US-C-10 | Status: 🟢 Passed

- **TC-BE-017**: 비활성 세션으로 주문 생성 실패
  - Given: 비활성 세션 (isActive=false)
  - When: createOrder(tableId, sessionId, request) 호출
  - Then: BadRequestException 발생
  - Story: US-C-12 | Status: 🟢 Passed

- **TC-BE-018**: 삭제된 메뉴로 주문 생성 실패
  - Given: isDeleted=true인 메뉴
  - When: createOrder(tableId, sessionId, request) 호출
  - Then: NotFoundException 발생
  - Story: US-C-12 | Status: 🟢 Passed

- **TC-BE-019**: 주문 생성 시 스냅샷 저장 확인
  - Given: 유효한 메뉴 (price=10000)
  - When: createOrder 호출 후 메뉴 가격 변경
  - Then: OrderItem.menuPrice는 주문 시점 가격(10000) 유지
  - Story: US-C-10 | Status: 🟢 Passed

### OrderService.updateOrderStatus()
- **TC-BE-020**: PENDING → CONFIRMED 상태 변경 성공
  - Given: PENDING 상태 주문
  - When: updateOrderStatus(orderId, storeId, CONFIRMED) 호출
  - Then: 상태 변경, SSE 이벤트 발행
  - Story: US-A-06 | Status: 🟢 Passed

- **TC-BE-021**: COMPLETED → PENDING 역방향 상태 변경 실패
  - Given: COMPLETED 상태 주문
  - When: updateOrderStatus(orderId, storeId, PENDING) 호출
  - Then: BadRequestException 발생
  - Story: US-A-06 | Status: 🟢 Passed

- **TC-BE-022**: 다른 매장 주문 상태 변경 시 권한 오류
  - Given: 다른 storeId 소속 주문
  - When: updateOrderStatus(orderId, wrongStoreId, CONFIRMED) 호출
  - Then: ForbiddenException 발생
  - Story: US-A-06 | Status: 🟢 Passed

### OrderService.deleteOrder()
- **TC-BE-023**: 주문 삭제 성공
  - Given: 존재하는 주문, 올바른 storeId
  - When: deleteOrder(orderId, storeId) 호출
  - Then: 주문 삭제, SSE 이벤트 발행
  - Story: US-A-08 | Status: 🟢 Passed

---

## SseService Tests

### SseService.createEmitter()
- **TC-BE-024**: Emitter 생성 및 Pool 등록
  - Given: storeId=1
  - When: createEmitter(1L) 호출
  - Then: SseEmitter 반환, Pool에 등록됨
  - Story: US-A-04 | Status: 🟢 Passed

### SseService.sendEvent()
- **TC-BE-025**: 이벤트 전송 성공
  - Given: storeId=1에 Emitter 2개 등록
  - When: sendEvent(1L, "ORDER_CREATED", payload) 호출
  - Then: 2개 Emitter 모두에 이벤트 전송
  - Story: US-A-04 | Status: 🟢 Passed

- **TC-BE-026**: 전송 실패한 Emitter 자동 제거
  - Given: storeId=1에 정상 Emitter 1개, 오류 Emitter 1개
  - When: sendEvent(1L, "ORDER_CREATED", payload) 호출
  - Then: 오류 Emitter 제거, 정상 Emitter는 유지
  - Story: US-A-04 | Status: 🟢 Passed

---

## Controller Integration Tests (MockMvc)

### AuthController
- **TC-BE-027**: POST /api/auth/login - 성공 (200)
  - Story: US-A-01 | Status: 🟢 Passed
- **TC-BE-028**: POST /api/auth/login - 실패 (401)
  - Story: US-A-01 | Status: 🟢 Passed

### MenuController
- **TC-BE-029**: GET /api/customer/menus - 인증 없이 접근 (401)
  - Story: US-C-04 | Status: 🟢 Passed
- **TC-BE-030**: GET /api/customer/menus - Table Token으로 접근 (200)
  - Story: US-C-04 | Status: 🟢 Passed
- **TC-BE-031**: POST /api/admin/menus - Admin JWT로 메뉴 등록 (201)
  - Story: US-A-10 | Status: 🟢 Passed

### OrderController
- **TC-BE-032**: POST /api/customer/orders - 주문 생성 (201)
  - Story: US-C-10 | Status: 🟢 Passed
- **TC-BE-033**: PATCH /api/admin/orders/{id}/status - 상태 변경 (200)
  - Story: US-A-06 | Status: 🟢 Passed

---

## Repository Tests (@DataJpaTest)

### TableSessionRepository
- **TC-BE-034**: findByTableIdAndIsActiveTrue - 활성 세션 조회
  - Status: 🟢 Passed
- **TC-BE-035**: 활성 세션 없을 때 Optional.empty() 반환
  - Status: 🟢 Passed

### MenuRepository
- **TC-BE-036**: isDeleted=true 메뉴는 조회 결과에서 제외
  - Status: 🟢 Passed
- **TC-BE-037**: displayOrder 오름차순 정렬 확인
  - Status: 🟢 Passed

---

## 요구사항 커버리지

| Story | 테스트 케이스 | 상태 |
|-------|------------|------|
| US-C-01 | TC-BE-007, 008 | 🟢 |
| US-C-02 | TC-BE-004, 005, 006 | 🟢 |
| US-C-03 | TC-BE-009, 010 | 🟢 |
| US-C-04 | TC-BE-029, 030 | 🟢 |
| US-C-10 | TC-BE-016, 019, 032 | 🟢 |
| US-C-12 | TC-BE-017, 018 | 🟢 |
| US-A-01 | TC-BE-001~003, 027, 028 | 🟢 |
| US-A-04 | TC-BE-024~026 | 🟢 |
| US-A-06 | TC-BE-020~022, 033 | 🟢 |
| US-A-08 | TC-BE-023 | 🟢 |
| US-A-10 | TC-BE-011, 012, 031 | 🟢 |
| US-A-12 | TC-BE-013, 014 | 🟢 |
| US-A-13 | TC-BE-015 | 🟢 |

**총 테스트 케이스: 37개 | 통과: 37개 ✅**
