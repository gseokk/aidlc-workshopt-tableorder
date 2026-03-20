# Integration Test Instructions

## 목적

Frontend ↔ Backend ↔ MySQL 간 실제 연동을 검증합니다.
Docker Compose로 전체 스택을 실행한 후 수동 또는 자동화 테스트를 수행합니다.

---

## 사전 준비

### 1. 전체 스택 실행 (로컬)

`build-instructions.md` 참고하여 아래 순서로 실행:

```powershell
# 창 1: Backend (SQLite DB 자동 생성)
cd backend
./gradlew bootRun

# 창 2: Frontend
cd frontend
npm run dev
```

서비스 접속 확인:
- Backend: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:5173

### 2. Backend 초기 데이터 확인

`DataInitializer`가 자동으로 기본 매장 데이터를 생성합니다:
- Store identifier: `store001`
- Admin username: `admin`
- Admin password: `admin1234`

> SQLite DB 파일: `backend/tableorder.db` (첫 실행 시 자동 생성)

---

## 통합 테스트 시나리오

### 시나리오 1: 관리자 로그인 → 메뉴 등록 → 조회

```bash
# Step 1: 관리자 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeIdentifier":"store001","username":"admin","password":"admin1234"}'

# 응답에서 token 추출
# {"token":"eyJ...","storeId":1,"storeName":"..."}

# Step 2: 메뉴 등록 (token 사용)
curl -X POST http://localhost:8080/api/admin/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"아메리카노","price":4500,"categoryName":"커피","imageUrl":"","description":"","isAvailable":true}'

# Step 3: 메뉴 조회 (관리자)
curl -X GET http://localhost:8080/api/admin/menus \
  -H "Authorization: Bearer {token}"
```

기대 결과:
- 로그인: `200 OK`, token 반환
- 메뉴 등록: `201 Created`, MenuResponse 반환
- 메뉴 조회: `200 OK`, 등록된 메뉴 포함

---

### 시나리오 2: 테이블 설정 → 고객 로그인 → 주문 생성

```bash
# Step 1: 테이블 설정 (관리자)
curl -X POST http://localhost:8080/api/admin/tables/setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"tableNumber":1,"password":"1234"}'

# Step 2: 테이블 로그인 (고객)
curl -X POST http://localhost:8080/api/auth/table-login \
  -H "Content-Type: application/json" \
  -d '{"storeIdentifier":"store001","tableNumber":1,"password":"1234"}'

# 응답에서 tableToken, sessionId 추출

# Step 3: 메뉴 조회 (고객)
curl -X GET http://localhost:8080/api/customer/menus \
  -H "Authorization: Bearer {table_token}"

# Step 4: 주문 생성 (고객)
curl -X POST http://localhost:8080/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {table_token}" \
  -d '{"items":[{"menuId":1,"quantity":2}]}'
```

기대 결과:
- 테이블 설정: `200 OK`
- 테이블 로그인: `200 OK`, tableToken + sessionId 반환
- 메뉴 조회: `200 OK`, 메뉴 목록 반환
- 주문 생성: `201 Created`, OrderResponse 반환

---

### 시나리오 3: 주문 상태 변경 흐름 (PENDING → CONFIRMED → COMPLETED)

```bash
# Step 1: 주문 목록 조회 (관리자)
curl -X GET http://localhost:8080/api/admin/orders \
  -H "Authorization: Bearer {admin_token}"

# Step 2: PENDING → CONFIRMED
curl -X PATCH http://localhost:8080/api/admin/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"status":"CONFIRMED"}'

# Step 3: CONFIRMED → COMPLETED
curl -X PATCH http://localhost:8080/api/admin/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"status":"COMPLETED"}'
```

기대 결과:
- 각 상태 변경: `200 OK`, 변경된 상태 반환
- 역방향 변경 시도 (COMPLETED → PENDING): `400 Bad Request`

---

### 시나리오 4: SSE 연결 및 실시간 이벤트 수신

```bash
# SSE 연결 (별도 터미널)
curl -N http://localhost:8080/api/sse/orders \
  -H "Authorization: Bearer {admin_token}"

# 다른 터미널에서 주문 생성 → SSE 이벤트 수신 확인
```

기대 결과:
- SSE 연결 유지
- 주문 생성 시 `ORDER_CREATED` 이벤트 수신
- 상태 변경 시 `ORDER_STATUS_CHANGED` 이벤트 수신

---

### 시나리오 5: Frontend ↔ Backend 연동

브라우저에서 직접 확인:

1. http://localhost:3000 접속
2. 관리자 로그인 (`store001` / `admin` / `admin1234`)
3. 테이블 설정 (테이블 번호: 1, 비밀번호: 1234)
4. 별도 탭에서 고객 화면 접속 → 테이블 로그인
5. 메뉴 주문 → 관리자 화면에서 실시간 주문 수신 확인

---

## 인증 오류 시나리오 검증

```bash
# 토큰 없이 접근 → 401
curl -X GET http://localhost:8080/api/customer/menus

# 잘못된 토큰 → 401
curl -X GET http://localhost:8080/api/customer/menus \
  -H "Authorization: Bearer invalid-token"

# 고객 토큰으로 관리자 API 접근 → 403
curl -X GET http://localhost:8080/api/admin/orders \
  -H "Authorization: Bearer {table_token}"
```

---

## 테스트 환경 정리

Backend와 Frontend 실행 중인 PowerShell 창에서 `Ctrl+C`로 종료.

SQLite DB 초기화가 필요한 경우:

```powershell
# Backend 종료 후 DB 파일 삭제
Remove-Item backend/tableorder.db
# 다시 실행하면 DataInitializer가 초기 데이터 재생성
```
