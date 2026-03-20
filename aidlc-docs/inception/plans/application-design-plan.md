# Application Design Plan

## 실행 체크리스트
- [x] Step 1: Context 분석 완료
- [x] Step 2: 컴포넌트 초안 식별
- [x] Step 3: 질문 생성
- [x] Step 4: 사용자 답변 수집
- [x] Step 5: 답변 분석 (모순 없음 확인)
- [x] Step 6: 설계 아티팩트 생성
  - [x] components.md
  - [x] component-methods.md
  - [x] services.md
  - [x] component-dependency.md
- [ ] Step 7: 승인

---

## 식별된 컴포넌트 초안

### Backend (Spring Boot)
```
Controller Layer
  - AuthController        : 관리자 로그인/로그아웃
  - TableController       : 테이블 자동 로그인, 세션 관리
  - MenuController        : 메뉴 CRUD
  - OrderController       : 주문 생성, 조회
  - SseController         : SSE 실시간 이벤트 스트림

Service Layer
  - AuthService           : JWT 발급/검증, 비밀번호 해싱
  - TableService          : 테이블 세션 라이프사이클
  - MenuService           : 메뉴 비즈니스 로직
  - OrderService          : 주문 처리, 상태 관리
  - SseService            : SSE 연결 관리, 이벤트 발행

Repository Layer
  - StoreRepository
  - TableRepository
  - TableSessionRepository
  - MenuRepository
  - MenuCategoryRepository
  - OrderRepository
  - OrderItemRepository
```

### Frontend - Customer (React)
```
Pages
  - MenuPage              : 메뉴 탐색 (기본 화면)
  - CartPage              : 장바구니
  - OrderConfirmPage      : 주문 확인
  - OrderHistoryPage      : 주문 내역

Components
  - CategoryTabs          : 카테고리 탭
  - MenuCard              : 메뉴 카드
  - CartItem              : 장바구니 아이템
  - OrderStatusBadge      : 주문 상태 배지

State/Context
  - CartContext           : 장바구니 상태 (localStorage)
  - AuthContext           : 테이블 세션 인증 상태
```

### Frontend - Admin (React)
```
Pages
  - LoginPage             : 관리자 로그인
  - DashboardPage         : 실시간 주문 모니터링
  - MenuManagePage        : 메뉴 관리
  - OrderHistoryPage      : 과거 주문 내역

Components
  - TableCard             : 테이블별 주문 카드
  - OrderDetailModal      : 주문 상세 모달
  - OrderStatusControl    : 주문 상태 변경 컨트롤
  - MenuForm              : 메뉴 등록/수정 폼

State/Context
  - AuthContext           : 관리자 JWT 인증 상태
  - SseContext            : SSE 연결 및 실시간 데이터
```

---

## 질문

### Question 1
Backend API 아키텍처 패턴을 어떻게 구성하시겠습니까?

A) Layered Architecture (Controller → Service → Repository) - 표준적이고 명확한 구조
B) Hexagonal Architecture (Port & Adapter) - 테스트 용이성 높음, 복잡도 증가
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
Customer Frontend와 Admin Frontend를 어떻게 구성하시겠습니까?

A) 단일 React 앱 (라우팅으로 고객/관리자 분리) - 하나의 프로젝트
B) 별도 React 앱 2개 (완전히 분리된 프로젝트)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
Backend API의 인증 방식을 어떻게 구성하시겠습니까?

A) 관리자: JWT Bearer Token / 고객 테이블: 별도 테이블 토큰 (각각 다른 인증 체계)
B) 관리자: JWT Bearer Token / 고객 테이블: JWT Bearer Token (동일 인증 체계, 역할 구분)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
SSE(Server-Sent Events) 연결을 어떻게 관리하시겠습니까?

A) 매장별 SSE 채널 (해당 매장의 모든 주문 이벤트를 하나의 채널로)
B) 관리자 세션별 SSE 채널 (로그인한 관리자마다 개별 채널)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

답변 완료 후 "완료"라고 알려주세요.
