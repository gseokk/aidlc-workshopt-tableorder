# Backend Functional Design - 질문

Unit 2 (Backend) Functional Design을 위한 질문입니다.
`[Answer]:` 태그에 답변을 작성해 주세요.

---

## 섹션 1: 도메인 모델 (Domain Model)

**Q1. Store(매장) 엔티티 초기 데이터 설정 방식**

매장 정보(Store)는 어떻게 생성되나요?

A) 애플리케이션 시작 시 `data.sql` 또는 `DataInitializer`로 단일 매장 데이터 삽입 (MVP 단일 매장)
B) 관리자가 별도 API로 매장을 등록하는 방식
C) `application.yml`에 매장 정보를 설정값으로 관리

[Answer]: A

---

**Q2. Table 엔티티의 비밀번호 관리**

테이블 비밀번호는 어떻게 저장하나요?

A) 평문 저장 (단순 PIN 코드, 보안 낮음)
B) bcrypt 해시 저장 (보안 높음, 관리자가 설정 시 해시 처리)
C) 단방향 해시 (SHA-256 등)

[Answer]: A

---

**Q3. TableSession 설계**

테이블 세션의 상태 관리 방식을 선택해 주세요.

A) `status` 필드 사용 (ACTIVE / COMPLETED) + `completedAt` timestamp
B) `isActive` boolean 필드 + `completedAt` timestamp
C) `startedAt` / `completedAt` 만으로 관리 (completedAt이 null이면 활성)

[Answer]: B

---

**Q4. Order 상태 Enum 정의**

주문 상태 값을 확인해 주세요. 아래 중 사용할 상태를 선택하거나 수정해 주세요.

현재 설계:
- `PENDING` - 주문 접수 (신규)
- `CONFIRMED` - 주문 확인 (관리자 확인)
- `COMPLETED` - 완료

A) 위 3가지 상태 사용
B) `PENDING` → `PREPARING` → `SERVED` → `COMPLETED` (4단계)
C) `PENDING` → `COMPLETED` (2단계, 단순화)
D) 직접 정의: [Answer]:에 상태 목록 작성

[Answer]: A

---

**Q5. MenuCategory 관리 방식**

카테고리는 어떻게 관리되나요?

A) 관리자가 카테고리 CRUD API로 직접 관리 (별도 CategoryController 필요)
B) 메뉴 등록 시 카테고리명을 입력하면 자동 생성/재사용
C) 초기 데이터로 고정 카테고리 삽입 (변경 불가)

[Answer]: B

---

## 섹션 2: 비즈니스 규칙 (Business Rules)

**Q6. 테이블 토큰 만료 정책**

테이블 토큰(고객용)의 만료 시간을 설정해 주세요.

A) 만료 없음 (세션 완료 시까지 유효)
B) 24시간 만료
C) 세션 기반 (TableSession이 COMPLETED 되면 토큰 무효화)
D) 12시간 만료

[Answer]: D

---

**Q7. 동시 주문 처리**

같은 테이블에서 여러 주문을 동시에 생성할 수 있나요?

A) 가능 - 각 주문은 독립적으로 처리 (세션 내 여러 주문 허용)
B) 불가 - 이전 주문이 COMPLETED 상태여야 새 주문 가능
C) 가능하지만 PENDING 상태 주문이 있으면 경고 표시 (차단하지는 않음)

[Answer]: A

---

**Q8. 주문 삭제 규칙**

관리자가 주문을 삭제할 수 있는 조건은?

A) 모든 상태의 주문 삭제 가능
B) PENDING 상태만 삭제 가능 (COMPLETED는 삭제 불가)
C) PENDING, CONFIRMED 상태만 삭제 가능

[Answer]: A

---

**Q9. 메뉴 삭제 시 기존 주문 처리**

이미 주문된 메뉴를 삭제하면 어떻게 처리하나요?

A) Soft Delete - `isDeleted` 플래그로 숨김 처리 (기존 주문 데이터 보존)
B) Hard Delete - 실제 삭제 (기존 주문의 메뉴 정보는 snapshot으로 보존)
C) 삭제 불가 - 주문 내역이 있는 메뉴는 삭제 대신 비활성화만 가능

[Answer]: A

---

**Q10. 관리자 JWT 만료 시간**

관리자 JWT 토큰의 만료 시간을 설정해 주세요.

A) 1시간 (보안 강화)
B) 8시간 (업무 시간 기준)
C) 24시간
D) 7일 (Refresh Token 없이 장기 유지)

[Answer]: B

---

## 섹션 3: 서비스 로직 (Service Logic)

**Q11. SSE 연결 관리 - 다중 탭/브라우저**

관리자가 여러 탭에서 동시에 접속하면?

A) 매장당 하나의 SSE 연결만 허용 (새 연결 시 기존 연결 종료)
B) 매장당 여러 SSE 연결 허용 (모든 탭에 이벤트 전송)
C) 관리자 계정당 하나의 SSE 연결 허용

[Answer]: B

---

**Q12. 초기 데이터 로드 (관리자 로그인 후)**

관리자가 로그인하면 현재 활성 주문 데이터를 어떻게 가져오나요?

A) SSE 연결 후 서버에서 현재 상태 스냅샷을 첫 번째 SSE 이벤트로 전송
B) 관리자가 별도 REST API로 초기 데이터 조회 후 SSE로 실시간 업데이트 수신
C) SSE 연결 시 자동으로 현재 활성 주문 전체를 응답에 포함

[Answer]: B

---

**Q13. 메뉴 순서(displayOrder) 관리**

메뉴 순서 조정 방식을 선택해 주세요.

A) `displayOrder` 정수 필드 - 순서 변경 시 영향받는 메뉴들의 순서 일괄 업데이트
B) `displayOrder` 정수 필드 - 드래그앤드롭으로 두 메뉴의 순서만 swap
C) Linked List 방식 - `prevMenuId`, `nextMenuId` 참조

[Answer]: A

---

**Q14. 테이블 이용 완료 처리 시 장바구니**

관리자가 테이블 이용 완료 처리 시, 고객의 장바구니는?

A) 백엔드에서 처리 불필요 (장바구니는 Frontend localStorage만 관리)
B) 세션 완료 이벤트를 SSE로 고객에게도 전송하여 Frontend에서 장바구니 초기화
C) 별도 처리 없음 (고객이 다음 접속 시 자동 로그인 실패로 자연스럽게 처리)

[Answer]: B

---

## 섹션 4: 인프라 및 보안

**Q15. CORS 설정**

허용할 Origin을 설정해 주세요.

A) 개발: `http://localhost:3000`, 운영: 환경변수로 설정
B) 모든 Origin 허용 (`*`) - 개발 편의성 우선
C) 특정 도메인만 허용 (도메인 직접 지정)

[Answer]: B

---

**Q16. 데이터베이스 초기화 전략**

Spring Boot 시작 시 DB 초기화 방식을 선택해 주세요.

A) `spring.jpa.hibernate.ddl-auto=create-drop` (개발용, 매번 초기화)
B) `spring.jpa.hibernate.ddl-auto=update` (개발용, 스키마 자동 업데이트)
C) Flyway 마이그레이션 (운영 수준, 버전 관리)
D) `spring.jpa.hibernate.ddl-auto=validate` + `schema.sql` 수동 관리

[Answer]: B

---

답변 완료 후 이 파일을 저장하면 Functional Design 산출물 생성을 시작합니다.
