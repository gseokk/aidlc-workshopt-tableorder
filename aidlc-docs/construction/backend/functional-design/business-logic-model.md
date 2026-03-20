# Business Logic Model - Backend

## AuthService

### login(storeIdentifier, username, password) → LoginResponse
```
1. StoreRepository.findByStoreIdentifier(storeIdentifier)
   → 없으면 throw UnauthorizedException("매장을 찾을 수 없습니다")
2. store.adminUsername.equals(username) 확인
   → 불일치 시 throw UnauthorizedException("인증 실패")
3. PasswordEncoder.matches(password, store.adminPassword) 확인
   → 불일치 시 throw UnauthorizedException("인증 실패")
4. generateAdminJwt(store.id, username) 호출
5. return LoginResponse(token, storeId, storeName)
```

### tableLogin(storeIdentifier, tableNumber, password) → TableLoginResponse
```
1. StoreRepository.findByStoreIdentifier(storeIdentifier)
   → 없으면 throw UnauthorizedException
2. TableRepository.findByStoreIdAndTableNumber(storeId, tableNumber)
   → 없으면 throw UnauthorizedException("테이블을 찾을 수 없습니다")
3. table.password.equals(password) 확인
   → 불일치 시 throw UnauthorizedException("비밀번호가 올바르지 않습니다")
4. TableSessionRepository.findActiveByTableId(tableId)
   → 없으면 새 TableSession 생성 및 저장
   → 있으면 기존 세션 재사용
5. generateTableToken(tableId, storeId, sessionId) 호출
6. return TableLoginResponse(token, tableId, tableNumber, sessionId)
```

### generateAdminJwt(storeId, username) → String
```
1. JWT Claims 구성: { storeId, username, type: "ADMIN" }
2. 만료 시간: 8시간
3. HS256 서명 후 토큰 반환
```

### generateTableToken(tableId, storeId, sessionId) → String
```
1. JWT Claims 구성: { tableId, storeId, sessionId, type: "TABLE" }
2. 만료 시간: 12시간
3. HS256 서명 후 토큰 반환
```

---

## TableService

### setupTable(storeId, tableNumber, password) → TableSetupResponse
```
1. TableRepository.findByStoreIdAndTableNumber(storeId, tableNumber)
   → 있으면 기존 테이블 비밀번호 업데이트
   → 없으면 새 TableEntity 생성 및 저장
2. return TableSetupResponse(tableId, tableNumber)
```

### completeTableSession(tableId, storeId) → void
```
1. TableRepository.findByIdAndStoreId(tableId, storeId)
   → 없으면 throw NotFoundException
2. TableSessionRepository.findActiveByTableId(tableId)
   → 없으면 throw NotFoundException("활성 세션이 없습니다")
3. session.isActive = false, session.completedAt = now() 업데이트
4. SseService.sendEvent(storeId, SESSION_COMPLETED, { tableId, sessionId })
```

### getTableHistory(tableId, storeId, from, to) → List<OrderHistoryResponse>
```
1. TableRepository.findByIdAndStoreId(tableId, storeId)
   → 없으면 throw NotFoundException
2. TableSessionRepository.findCompletedByTableIdAndDateRange(tableId, from, to)
3. 각 세션의 Order 목록 조회 (OrderRepository)
4. return List<OrderHistoryResponse> (세션별 주문 그룹핑)
```

### getOrCreateActiveSession(tableId) → TableSession
```
1. TableSessionRepository.findActiveByTableId(tableId)
   → 있으면 return 기존 세션
   → 없으면 새 TableSession(isActive=true, startedAt=now()) 생성 및 저장
```

---

## MenuService

### getMenusByCategory(storeId, categoryId) → List<MenuResponse>
```
1. categoryId가 null이면: MenuRepository.findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(storeId)
2. categoryId가 있으면: MenuRepository.findByStoreIdAndCategoryIdAndIsDeletedFalseOrderByDisplayOrder(storeId, categoryId)
3. return List<MenuResponse>
```

### getCategories(storeId) → List<CategoryResponse>
```
1. MenuCategoryRepository.findByStoreIdOrderByDisplayOrder(storeId)
2. return List<CategoryResponse>
```

### createMenu(storeId, request) → MenuResponse
```
1. findOrCreateCategory(storeId, request.categoryName) 호출
2. 해당 카테고리 내 마지막 displayOrder 조회 → +1
3. Menu 엔티티 생성 및 저장
4. return MenuResponse
```

### updateMenu(storeId, menuId, request) → MenuResponse
```
1. MenuRepository.findByIdAndStoreId(menuId, storeId)
   → 없거나 isDeleted=true이면 throw NotFoundException
2. 카테고리명 변경 시 findOrCreateCategory(storeId, request.categoryName) 호출
3. 메뉴 필드 업데이트 (name, price, description, imageUrl, category)
4. return MenuResponse
```

### deleteMenu(storeId, menuId) → void
```
1. MenuRepository.findByIdAndStoreId(menuId, storeId)
   → 없으면 throw NotFoundException
2. menu.isDeleted = true (Soft Delete)
3. MenuRepository.save(menu)
```

### updateMenuOrder(storeId, menuId, newOrder) → void
```
1. MenuRepository.findByIdAndStoreId(menuId, storeId)
   → 없으면 throw NotFoundException
2. 동일 카테고리 내 메뉴 목록 조회 (displayOrder 오름차순)
3. 현재 위치에서 newOrder 위치로 이동
4. 영향받는 메뉴들의 displayOrder 재계산 (1부터 연속 정수)
5. 일괄 업데이트 (saveAll)
```

### findOrCreateCategory(storeId, categoryName) → MenuCategory [private]
```
1. MenuCategoryRepository.findByStoreIdAndName(storeId, categoryName)
   → 있으면 return 기존 카테고리
   → 없으면 새 MenuCategory 생성 및 저장 후 return
```

---

## OrderService

### createOrder(tableId, sessionId, items) → OrderResponse
```
1. TableSessionRepository.findById(sessionId)
   → 없거나 isActive=false이면 throw BadRequestException("유효하지 않은 세션")
2. 각 item의 menuId로 MenuRepository.findById() 조회
   → 없거나 isDeleted=true이면 throw NotFoundException("메뉴를 찾을 수 없습니다")
3. Order 엔티티 생성 (status=PENDING)
4. 각 item으로 OrderItem 생성:
   - menuName = menu.name (스냅샷)
   - menuPrice = menu.price (스냅샷)
   - subtotal = menuPrice * quantity
5. totalAmount = sum(subtotal)
6. Order + OrderItems 저장
7. SseService.sendEvent(storeId, ORDER_CREATED, OrderResponse)
8. return OrderResponse
```

### getSessionOrders(sessionId) → List<OrderResponse>
```
1. OrderRepository.findBySessionIdOrderByCreatedAtDesc(sessionId)
2. return List<OrderResponse>
```

### getTableOrders(tableId) → List<OrderResponse>
```
1. TableSessionRepository.findActiveByTableId(tableId)
   → 없으면 return empty list
2. OrderRepository.findBySessionIdOrderByCreatedAtDesc(session.id)
3. return List<OrderResponse>
```

### updateOrderStatus(orderId, storeId, newStatus) → OrderResponse
```
1. OrderRepository.findById(orderId)
   → 없으면 throw NotFoundException
2. 세션 → 테이블 → 매장 소속 확인 (storeId 검증)
   → 불일치 시 throw ForbiddenException
3. 상태 전이 유효성 검증:
   - PENDING → CONFIRMED: 허용
   - CONFIRMED → COMPLETED: 허용
   - 그 외: throw BadRequestException("유효하지 않은 상태 전이")
4. order.status = newStatus 업데이트
5. SseService.sendEvent(storeId, ORDER_STATUS_CHANGED, OrderResponse)
6. return OrderResponse
```

### deleteOrder(orderId, storeId) → void
```
1. OrderRepository.findById(orderId)
   → 없으면 throw NotFoundException
2. 세션 → 테이블 → 매장 소속 확인 (storeId 검증)
   → 불일치 시 throw ForbiddenException
3. OrderRepository.delete(order) (Cascade로 OrderItem도 삭제)
4. SseService.sendEvent(storeId, ORDER_DELETED, { orderId, tableId })
```

---

## SseService

### createEmitter(storeId) → SseEmitter
```
1. SseEmitter 생성 (timeout: 30분)
2. emitters.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>()).add(emitter)
3. emitter.onCompletion(() -> removeEmitter(storeId, emitter))
4. emitter.onTimeout(() -> removeEmitter(storeId, emitter))
5. emitter.onError(e -> removeEmitter(storeId, emitter))
6. return emitter
```

### sendEvent(storeId, eventType, payload) → void
```
1. emitters.getOrDefault(storeId, emptyList()) 조회
2. 각 emitter에 대해:
   try {
     emitter.send(SseEmitter.event().name(eventType).data(payload))
   } catch (Exception e) {
     removeEmitter(storeId, emitter)
   }
```

### removeEmitter(storeId, emitter) → void
```
1. emitters.get(storeId).remove(emitter)
2. 해당 storeId의 emitter 목록이 비어있으면 map에서 제거
```

---

## 공통 예외 처리

### GlobalExceptionHandler (@RestControllerAdvice)
| 예외 | HTTP 상태 | 응답 |
|------|---------|------|
| UnauthorizedException | 401 | `{ error: "UNAUTHORIZED", message }` |
| ForbiddenException | 403 | `{ error: "FORBIDDEN", message }` |
| NotFoundException | 404 | `{ error: "NOT_FOUND", message }` |
| BadRequestException | 400 | `{ error: "BAD_REQUEST", message }` |
| MethodArgumentNotValidException | 400 | `{ error: "VALIDATION_FAILED", fields: [...] }` |
| Exception (기타) | 500 | `{ error: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다" }` |
