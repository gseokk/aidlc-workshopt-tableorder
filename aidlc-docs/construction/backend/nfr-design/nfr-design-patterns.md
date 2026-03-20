# NFR Design Patterns - Backend

## 1. 보안 패턴 (Security Patterns)

### JWT Filter Chain 패턴
Spring Security Filter Chain에서 요청별 인증 처리:

```
HTTP Request
    ↓
JwtAuthenticationFilter (OncePerRequestFilter)
    ├── Authorization 헤더 추출
    ├── Bearer 토큰 파싱
    ├── JwtProvider.validateToken()
    │       ├── 서명 검증 (HS256)
    │       ├── 만료 시간 확인
    │       └── 토큰 타입 확인 (ADMIN / TABLE)
    ├── Claims → SecurityContext 저장
    │       ├── AdminClaims: storeId, username
    │       └── TableClaims: tableId, storeId, sessionId
    └── FilterChain.doFilter()
```

### 경로별 권한 분리 패턴
```
공개 경로 (인증 불필요):
  POST /api/auth/login
  POST /api/tables/login

관리자 전용 (Admin JWT):
  /api/admin/**
  GET /api/sse/subscribe/**

고객 전용 (Table Token):
  /api/customer/**
```

### 매장 소속 검증 패턴 (Resource Ownership)
모든 관리자 API에서 리소스가 요청한 매장 소속인지 검증:
```java
// Service 레이어에서 storeId 교차 검증
Order order = orderRepository.findById(orderId)
    .orElseThrow(NotFoundException::new);
if (!order.getSession().getTable().getStore().getId().equals(storeId)) {
    throw new ForbiddenException();
}
```

---

## 2. 성능 패턴 (Performance Patterns)

### N+1 방지 패턴
연관 엔티티 조회 시 `JOIN FETCH` 또는 `@EntityGraph` 사용:

```java
// 주문 조회 시 OrderItem + Menu 함께 로드
@Query("SELECT o FROM Order o JOIN FETCH o.items i JOIN FETCH i.menu WHERE o.session.id = :sessionId")
List<Order> findBySessionIdWithItems(@Param("sessionId") Long sessionId);

// 메뉴 조회 시 Category 함께 로드
@EntityGraph(attributePaths = {"category"})
List<Menu> findByStoreIdAndIsDeletedFalse(Long storeId);
```

### 인덱스 전략
```sql
-- 자주 사용되는 조회 패턴에 인덱스 적용
CREATE INDEX idx_table_store ON tables(store_id);
CREATE INDEX idx_session_table ON table_sessions(table_id, is_active);
CREATE INDEX idx_order_session ON orders(session_id);
CREATE INDEX idx_menu_store_category ON menus(store_id, category_id, is_deleted, display_order);
```

### Batch Fetch Size 패턴
`default_batch_fetch_size: 100` 설정으로 컬렉션 조회 최적화:
- 여러 세션의 주문 목록 조회 시 IN 쿼리로 배치 처리

---

## 3. 신뢰성 패턴 (Reliability Patterns)

### 트랜잭션 경계 패턴
```
Service 메서드 = 하나의 트랜잭션 단위

@Transactional
createOrder():
  1. 세션 검증
  2. 메뉴 검증
  3. Order 저장
  4. OrderItem 저장
  → 모두 성공 시 commit, 하나라도 실패 시 rollback

@Transactional(readOnly = true)  ← 조회 전용 최적화
getMenusByCategory():
  1. 메뉴 목록 조회
```

### SSE 연결 안정성 패턴
```
CopyOnWriteArrayList<SseEmitter> 사용:
  - 동시 읽기/쓰기 안전
  - 이벤트 전송 중 연결 추가/제거 가능

Emitter 생명주기 관리:
  onCompletion → removeEmitter()
  onTimeout    → removeEmitter()
  onError      → removeEmitter()

이벤트 전송 실패 처리:
  try { emitter.send(...) }
  catch (IOException) { removeEmitter() }  ← 실패한 연결만 제거
```

### 전역 예외 처리 패턴
```
@RestControllerAdvice GlobalExceptionHandler:

비즈니스 예외 → 적절한 HTTP 상태 코드 + 구조화된 에러 응답
  UnauthorizedException → 401
  ForbiddenException    → 403
  NotFoundException     → 404
  BadRequestException   → 400

유효성 검증 실패 → 400 + 필드별 오류 메시지
  MethodArgumentNotValidException → { error, fields: [{field, message}] }

예상치 못한 예외 → 500 + 일반 메시지 (스택트레이스 숨김)
  Exception → { error: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다" }
```

---

## 4. 유지보수성 패턴 (Maintainability Patterns)

### DTO 변환 패턴
Entity ↔ DTO 변환을 Service 레이어에서 담당:
```
Controller → Service (Request DTO 전달)
Service    → Repository (Entity 조작)
Service    → Controller (Response DTO 반환)

Entity는 Controller에 노출하지 않음
```

### 환경별 설정 분리 패턴
```
application.yml        # 공통 (포트, JPA 공통 설정)
application-dev.yml    # 개발 (MySQL, DEBUG 로그, show-sql: true)
application-test.yml   # 테스트 (H2, 로그 최소화, ddl-auto: create-drop)
```

### Soft Delete 패턴
```java
// 메뉴 조회 시 항상 isDeleted=false 조건 포함
@Where(clause = "is_deleted = false")  // Hibernate 필터 또는
// Repository 메서드명으로 명시적 처리
findByStoreIdAndIsDeletedFalse(Long storeId)
```
