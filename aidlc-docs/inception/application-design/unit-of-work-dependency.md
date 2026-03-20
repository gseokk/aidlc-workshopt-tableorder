# Unit of Work Dependency

## Unit 간 의존성

```
Unit 1: Frontend
    |
    | REST API 호출 (HTTP)
    | SSE 구독 (EventSource)
    v
Unit 2: Backend
    |
    | JPA / JDBC
    v
  MySQL
```

## 의존성 매트릭스

| Unit | 의존 대상 | 의존 유형 | 방향 |
|------|---------|---------|------|
| Frontend | Backend API | Runtime (HTTP REST) | Frontend → Backend |
| Frontend | Backend SSE | Runtime (EventSource) | Frontend → Backend |
| Backend | MySQL | Runtime (JPA) | Backend → MySQL |
| Frontend | MySQL | 없음 (직접 접근 안 함) | - |

## 개발 순서 및 의존성 처리

### Phase 1: Frontend 개발 (Backend 없이)
```
Frontend (mock API)
  - msw(Mock Service Worker) 또는 로컬 mock 데이터 사용
  - API contract 정의 (request/response 타입)
  - UI 완성 및 검증
```

### Phase 2: Backend 개발
```
Backend
  - Frontend에서 정의한 API contract 기반으로 구현
  - MySQL 스키마 생성
  - API 엔드포인트 구현
```

### Phase 3: 통합
```
Frontend mock 제거 → 실제 Backend API 연결
Docker Compose로 전체 스택 실행
통합 테스트
```

## API Contract (Frontend ↔ Backend 인터페이스)

Frontend 개발 시 아래 contract를 mock으로 구현하고, Backend 개발 시 동일하게 구현합니다.

### 인증
```
POST /api/auth/login          관리자 로그인
POST /api/tables/login        테이블 자동 로그인
```

### 메뉴
```
GET  /api/menus               메뉴 목록 조회 (카테고리 필터)
GET  /api/menus/categories    카테고리 목록
POST /api/menus               메뉴 등록 (관리자)
PUT  /api/menus/{id}          메뉴 수정 (관리자)
DELETE /api/menus/{id}        메뉴 삭제 (관리자)
PATCH /api/menus/{id}/order   메뉴 순서 변경 (관리자)
```

### 주문
```
POST /api/orders              주문 생성 (고객)
GET  /api/orders/session      현재 세션 주문 조회 (고객)
GET  /api/orders/table/{id}   테이블 주문 조회 (관리자)
PATCH /api/orders/{id}/status 주문 상태 변경 (관리자)
DELETE /api/orders/{id}       주문 삭제 (관리자)
```

### 테이블
```
POST /api/tables/setup        테이블 초기 설정 (관리자)
POST /api/tables/{id}/complete 이용 완료 처리 (관리자)
GET  /api/tables/{id}/history 과거 주문 내역 (관리자)
```

### SSE
```
GET  /api/sse/subscribe/{storeId}  실시간 이벤트 구독 (관리자)
```
