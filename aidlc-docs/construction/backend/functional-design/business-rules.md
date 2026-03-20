# Business Rules - Backend

## 1. 인증/인가 규칙

### 관리자 인증 (JWT)
- BR-AUTH-01: 관리자 로그인은 `storeIdentifier` + `adminUsername` + `adminPassword` 조합으로 인증
- BR-AUTH-02: 비밀번호는 bcrypt로 검증 (`PasswordEncoder.matches()`)
- BR-AUTH-03: 로그인 성공 시 JWT 발급, 만료 시간 8시간
- BR-AUTH-04: JWT payload에 `storeId`, `username` 포함
- BR-AUTH-05: 모든 관리자 API는 `Authorization: Bearer {token}` 헤더 필수
- BR-AUTH-06: 만료된 JWT 요청 시 HTTP 401 응답

### 테이블 토큰 (고객 인증)
- BR-TABLE-01: 테이블 로그인은 `storeIdentifier` + `tableNumber` + `password` 조합으로 인증
- BR-TABLE-02: 테이블 비밀번호는 평문 비교 (`password.equals()`)
- BR-TABLE-03: 로그인 성공 시 테이블 토큰 발급, 만료 시간 12시간
- BR-TABLE-04: 테이블 토큰 payload에 `tableId`, `storeId`, `sessionId` 포함
- BR-TABLE-05: 모든 고객 API는 `Authorization: Bearer {token}` 헤더 필수
- BR-TABLE-06: 만료된 테이블 토큰 요청 시 HTTP 401 응답

### 권한 분리
- BR-AUTH-07: 관리자 API (`/api/admin/**`)는 관리자 JWT만 허용
- BR-AUTH-08: 고객 API (`/api/customer/**`)는 테이블 토큰만 허용
- BR-AUTH-09: 공개 API (`/api/auth/**`, `/api/tables/login`)는 인증 불필요

---

## 2. 테이블 세션 규칙

- BR-SESSION-01: 테이블당 활성 세션(`isActive=true`)은 최대 1개
- BR-SESSION-02: 테이블 로그인 시 활성 세션이 없으면 새 세션 생성
- BR-SESSION-03: 테이블 로그인 시 활성 세션이 있으면 기존 세션 재사용 (새 세션 미생성)
- BR-SESSION-04: 이용 완료 처리 시 `isActive=false`, `completedAt=now()` 업데이트
- BR-SESSION-05: 이용 완료 처리는 관리자만 가능 (Admin JWT 필요)
- BR-SESSION-06: 이용 완료 처리 시 SSE로 `SESSION_COMPLETED` 이벤트 발행
- BR-SESSION-07: 이용 완료 처리 시 SSE 이벤트를 고객 측에도 전달 (Frontend에서 장바구니 초기화)

---

## 3. 주문 처리 규칙

### 주문 생성
- BR-ORDER-01: 주문 생성은 활성 세션이 있는 테이블만 가능
- BR-ORDER-02: 주문 항목의 메뉴는 `isDeleted=false`인 메뉴만 허용
- BR-ORDER-03: 주문 항목 수량은 최소 1개 이상
- BR-ORDER-04: 주문 생성 시 `menuName`, `menuPrice` 스냅샷 저장
- BR-ORDER-05: `totalAmount` = 각 OrderItem의 `subtotal` 합계
- BR-ORDER-06: 주문 생성 시 SSE로 `ORDER_CREATED` 이벤트 발행
- BR-ORDER-07: 동일 세션 내 여러 주문 동시 생성 허용

### 주문 상태 변경
- BR-ORDER-08: 상태 변경 순서: `PENDING` → `CONFIRMED` → `COMPLETED`
- BR-ORDER-09: 역방향 상태 변경 불가 (COMPLETED → PENDING 불가)
- BR-ORDER-10: 상태 변경 시 SSE로 `ORDER_STATUS_CHANGED` 이벤트 발행
- BR-ORDER-11: 상태 변경은 관리자만 가능

### 주문 삭제
- BR-ORDER-12: 모든 상태의 주문 삭제 가능 (관리자 권한)
- BR-ORDER-13: 주문 삭제 시 연관 OrderItem도 함께 삭제 (Cascade)
- BR-ORDER-14: 주문 삭제 시 SSE로 `ORDER_DELETED` 이벤트 발행

---

## 4. 메뉴 관리 규칙

### 메뉴 조회
- BR-MENU-01: 고객 메뉴 조회 시 `isDeleted=false` 메뉴만 반환
- BR-MENU-02: 메뉴 목록은 `displayOrder` 오름차순 정렬
- BR-MENU-03: 카테고리 필터 적용 시 해당 카테고리 메뉴만 반환

### 메뉴 등록/수정
- BR-MENU-04: 메뉴 등록 시 카테고리명으로 조회, 없으면 자동 생성
- BR-MENU-05: 동일 매장 내 카테고리명 중복 불가
- BR-MENU-06: 메뉴 가격은 0원 이상 (무료 메뉴 허용)
- BR-MENU-07: 메뉴 등록 시 `displayOrder`는 해당 카테고리 내 마지막 순서 + 1

### 메뉴 삭제
- BR-MENU-08: 메뉴 삭제는 Soft Delete (`isDeleted=true`)
- BR-MENU-09: Soft Delete된 메뉴는 고객 조회 API에서 제외
- BR-MENU-10: 기존 주문의 OrderItem은 Soft Delete 메뉴 참조 유지 (스냅샷으로 보존)

### 메뉴 순서 조정
- BR-MENU-11: 순서 변경 시 동일 카테고리 내 영향받는 메뉴들의 `displayOrder` 일괄 업데이트
- BR-MENU-12: `displayOrder`는 카테고리 내에서 1부터 연속된 정수 유지

---

## 5. SSE 이벤트 규칙

- BR-SSE-01: SSE 채널은 매장(storeId) 단위로 관리
- BR-SSE-02: 매장당 여러 SSE 연결 허용 (다중 탭 지원)
- BR-SSE-03: SSE 연결 시 `Last-Event-ID` 헤더 미지원 (재연결 시 REST API로 초기 데이터 재조회)
- BR-SSE-04: SSE 연결 타임아웃: 30분 (이후 클라이언트가 재연결)
- BR-SSE-05: 연결 오류/만료 시 해당 Emitter 자동 제거
- BR-SSE-06: 이벤트 전송 실패 시 해당 Emitter 제거 (다른 연결에는 영향 없음)

### SSE 이벤트 타입
| 이벤트명 | 발행 시점 | payload |
|---------|---------|---------|
| ORDER_CREATED | 신규 주문 생성 | OrderResponse |
| ORDER_STATUS_CHANGED | 주문 상태 변경 | OrderResponse |
| ORDER_DELETED | 주문 삭제 | `{ orderId, tableId }` |
| SESSION_COMPLETED | 테이블 이용 완료 | `{ tableId, sessionId }` |

---

## 6. 유효성 검증 규칙

### 공통
- BR-VALID-01: 필수 필드 누락 시 HTTP 400 응답 + 필드별 오류 메시지
- BR-VALID-02: 존재하지 않는 리소스 접근 시 HTTP 404 응답
- BR-VALID-03: 권한 없는 리소스 접근 시 HTTP 403 응답

### 주문 생성 유효성
- BR-VALID-04: `items` 배열 최소 1개 이상
- BR-VALID-05: 각 item의 `quantity` >= 1
- BR-VALID-06: 각 item의 `menuId`는 존재하고 `isDeleted=false`인 메뉴

### 메뉴 등록/수정 유효성
- BR-VALID-07: `name` 필수, 1~100자
- BR-VALID-08: `price` 필수, 0 이상 정수
- BR-VALID-09: `categoryName` 필수, 1~50자
