# Unit Test Execution Instructions

## TDD 적용 현황

두 Unit 모두 TDD 방식으로 개발되었습니다. 코드 생성 단계에서 모든 테스트가 작성 및 검증되었습니다.

| Unit | 테스트 프레임워크 | 테스트 수 | 상태 |
|------|----------------|---------|------|
| Backend (Spring Boot) | JUnit 5 + Mockito + AssertJ | 37개 | 🟢 All Passed |
| Frontend (React + Vite) | Vitest + Testing Library | - | 🟢 Passed |

---

## Backend 단위 테스트

### 테스트 실행

```bash
cd backend
./gradlew test
```

### 특정 테스트 클래스만 실행

```bash
# Service 테스트만
./gradlew test --tests "com.tableorder.service.*"

# 특정 클래스
./gradlew test --tests "com.tableorder.service.OrderServiceTest"

# Repository 테스트만
./gradlew test --tests "com.tableorder.repository.*"

# Controller 테스트만
./gradlew test --tests "com.tableorder.controller.*"
```

### 테스트 결과 확인

```
# 콘솔 출력 예시
BUILD SUCCESSFUL
37 tests completed, 0 failed
```

HTML 리포트 위치: `backend/build/reports/tests/test/index.html`

### 테스트 커버리지 확인 (JaCoCo 추가 시)

```bash
./gradlew test jacocoTestReport
# 리포트: backend/build/reports/jacoco/test/html/index.html
```

### Backend 테스트 케이스 목록

| 테스트 클래스 | TC | 커버 기능 |
|-------------|-----|---------|
| JwtProviderTest | 4 | Token 생성/검증 |
| AuthServiceTest | 6 | 관리자/테이블 로그인 |
| TableServiceTest | 4 | 테이블 설정/세션 완료 |
| MenuServiceTest | 5 | 메뉴 CRUD, 순서 변경 |
| OrderServiceTest | 8 | 주문 생성/상태 변경/삭제 |
| SseServiceTest | 3 | SSE Emitter 관리 |
| AuthControllerTest | 2 | 로그인 API (MockMvc) |
| MenuControllerTest | 3 | 메뉴 API (MockMvc) |
| OrderControllerTest | 2 | 주문 API (MockMvc) |
| TableSessionRepositoryTest | 2 | 활성 세션 조회 (@DataJpaTest) |
| MenuRepositoryTest | 2 | Soft Delete, 정렬 (@DataJpaTest) |
| **합계** | **37** | |

---

## Frontend 단위 테스트

### 테스트 실행

```bash
cd frontend
npm run test
```

### Watch 모드 (개발 중)

```bash
npm run test:watch
```

### UI 모드

```bash
npm run test:ui
```

### 테스트 결과 확인

```
# 콘솔 출력 예시
Test Files  X passed
Tests       X passed
```

---

## 실패 시 대응

### Backend 테스트 실패

1. 실패 로그 확인:
   ```bash
   ./gradlew test --info 2>&1 | grep -A 10 "FAILED"
   ```

2. H2 인메모리 DB 설정 확인 (`application-test.yml`)

3. `@SpringBootTest` 테스트는 전체 컨텍스트 로드 - 포트 충돌 여부 확인

### Frontend 테스트 실패

1. `jsdom` 환경 설정 확인 (`vite.config.ts` 또는 `vitest.config.ts`)

2. `@testing-library/jest-dom` import 확인
