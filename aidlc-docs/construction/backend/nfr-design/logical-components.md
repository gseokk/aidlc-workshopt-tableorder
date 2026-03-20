# Logical Components - Backend

## 컴포넌트 구성 개요

```
[Client]
   │
   ├── REST API (HTTP)
   │       ↓
   │   [Spring Security Filter Chain]
   │       ├── JwtAuthenticationFilter
   │       └── SecurityContextHolder
   │       ↓
   │   [Controller Layer]
   │       ↓
   │   [Service Layer]  ←→  [SseService]
   │       ↓                    ↓
   │   [Repository Layer]   [SSE Emitter Pool]
   │       ↓
   │   [MySQL 8.0]
   │
   └── SSE (HTTP/EventStream)
           ↓
       [SseController]
           ↓
       [SseService - Emitter Pool]
```

---

## 1. 인증 컴포넌트

### JwtProvider
- 역할: JWT 생성 및 검증 전담 유틸리티
- 의존성: 없음 (순수 유틸리티)
- 주요 기능:
  - `generateAdminToken(storeId, username)` → JWT String
  - `generateTableToken(tableId, storeId, sessionId)` → JWT String
  - `validateToken(token)` → Claims
  - `getTokenType(token)` → "ADMIN" | "TABLE"
- 설정: `JWT_SECRET` 환경변수, 만료 시간 상수

### JwtAuthenticationFilter
- 역할: 모든 요청에서 JWT 검증 및 SecurityContext 설정
- 타입: `OncePerRequestFilter`
- 처리 흐름:
  1. `Authorization: Bearer {token}` 헤더 추출
  2. JwtProvider로 토큰 검증
  3. Claims → `UsernamePasswordAuthenticationToken` 생성
  4. `SecurityContextHolder`에 저장
- 공개 경로는 필터 통과 (토큰 없어도 허용)

### SecurityConfig
- 역할: Spring Security 전체 설정
- 설정 항목:
  - CSRF 비활성화 (REST API)
  - Session Stateless
  - 경로별 권한 규칙 (`requestMatchers`)
  - JwtAuthenticationFilter 등록

---

## 2. API 컴포넌트

### AuthController
- 엔드포인트: `POST /api/auth/login`
- 인증: 불필요 (공개)
- 의존성: AuthService

### TableController
- 엔드포인트:
  - `POST /api/tables/login` (공개)
  - `POST /api/admin/tables/setup` (Admin JWT)
  - `POST /api/admin/tables/{tableId}/complete` (Admin JWT)
  - `GET /api/admin/tables/{tableId}/history` (Admin JWT)
- 의존성: TableService, AuthService

### MenuController
- 엔드포인트:
  - `GET /api/customer/menus` (Table Token)
  - `GET /api/customer/menus/categories` (Table Token)
  - `POST /api/admin/menus` (Admin JWT)
  - `PUT /api/admin/menus/{menuId}` (Admin JWT)
  - `DELETE /api/admin/menus/{menuId}` (Admin JWT)
  - `PATCH /api/admin/menus/{menuId}/order` (Admin JWT)
- 의존성: MenuService

### OrderController
- 엔드포인트:
  - `POST /api/customer/orders` (Table Token)
  - `GET /api/customer/orders/session` (Table Token)
  - `GET /api/admin/orders/table/{tableId}` (Admin JWT)
  - `PATCH /api/admin/orders/{orderId}/status` (Admin JWT)
  - `DELETE /api/admin/orders/{orderId}` (Admin JWT)
- 의존성: OrderService

### SseController
- 엔드포인트: `GET /api/sse/subscribe/{storeId}` (Admin JWT)
- 반환 타입: `SseEmitter`
- 의존성: SseService

---

## 3. 서비스 컴포넌트

### AuthService
- 역할: 인증 로직 전담
- 의존성: StoreRepository, TableRepository, TableSessionRepository, JwtProvider, PasswordEncoder
- 트랜잭션: `@Transactional` (tableLogin - 세션 생성 포함)

### TableService
- 역할: 테이블 및 세션 라이프사이클 관리
- 의존성: TableRepository, TableSessionRepository, OrderRepository, SseService
- 트랜잭션: `@Transactional`

### MenuService
- 역할: 메뉴 및 카테고리 CRUD
- 의존성: MenuRepository, MenuCategoryRepository
- 트랜잭션: `@Transactional` (쓰기), `@Transactional(readOnly=true)` (읽기)

### OrderService
- 역할: 주문 생성, 상태 변경, 삭제
- 의존성: OrderRepository, OrderItemRepository, MenuRepository, TableSessionRepository, SseService
- 트랜잭션: `@Transactional`

### SseService
- 역할: SSE Emitter 풀 관리 및 이벤트 발행
- 내부 상태: `ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>>`
  - Key: storeId
  - Value: 해당 매장의 활성 Emitter 목록
- 트랜잭션: 없음 (순수 이벤트 발행)
- Thread Safety: ConcurrentHashMap + CopyOnWriteArrayList로 보장

---

## 4. 데이터 접근 컴포넌트

### Repository 목록
| Repository | 주요 커스텀 메서드 |
|-----------|----------------|
| StoreRepository | `findByStoreIdentifier(String)` |
| TableRepository | `findByStoreIdAndTableNumber(Long, Integer)`, `findByIdAndStoreId(Long, Long)` |
| TableSessionRepository | `findByTableIdAndIsActiveTrue(Long)`, `findByTableIdAndIsActiveFalseAndStartedAtBetween(...)` |
| MenuCategoryRepository | `findByStoreIdOrderByDisplayOrder(Long)`, `findByStoreIdAndName(Long, String)` |
| MenuRepository | `findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(Long)`, `findByStoreIdAndCategoryIdAndIsDeletedFalse(...)` |
| OrderRepository | `findBySessionIdOrderByCreatedAtDesc(Long)` |
| OrderItemRepository | (기본 JPA 메서드만 사용) |

---

## 5. 초기화 컴포넌트

### DataInitializer
- 타입: `@Component` + `CommandLineRunner`
- 실행 시점: 애플리케이션 시작 시 1회
- 동작:
  ```
  1. StoreRepository.findByStoreIdentifier("store001") 조회
  2. 없으면: Store 엔티티 생성 및 저장
     - storeIdentifier: "store001"
     - name: "테이블오더 매장"
     - adminUsername: 환경변수 ADMIN_USERNAME (기본값: "admin")
     - adminPassword: bcrypt(환경변수 ADMIN_PASSWORD)
  3. 있으면: 스킵 (idempotent)
  ```
- 환경변수: `ADMIN_USERNAME`, `ADMIN_PASSWORD`

---

## 6. 공통 컴포넌트

### GlobalExceptionHandler
- 타입: `@RestControllerAdvice`
- 처리 예외: UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, MethodArgumentNotValidException, Exception

### ErrorResponse (DTO)
```java
record ErrorResponse(String error, String message) {}
record ValidationErrorResponse(String error, List<FieldError> fields) {}
record FieldError(String field, String message) {}
```

### CorsConfig
- 타입: `WebMvcConfigurer`
- 설정: 모든 Origin, 모든 메서드, 모든 헤더 허용

### SwaggerConfig
- 타입: `@Configuration`
- OpenAPI 메타데이터: 제목, 버전, 설명
- 접근 URL: `http://localhost:8080/swagger-ui.html`
