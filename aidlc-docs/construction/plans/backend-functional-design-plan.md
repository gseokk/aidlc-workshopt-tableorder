# Backend Functional Design Plan

## Unit: Backend (Spring Boot)

### 목표
Spring Boot 백엔드의 도메인 엔티티, 비즈니스 규칙, 서비스 레이어 로직을 상세 설계합니다.

---

## 실행 체크리스트

### Phase 1: 질문 수집 및 분석
- [x] Step 1: Unit Context 분석 (unit-of-work.md, unit-of-work-story-map.md 검토)
- [x] Step 2: Functional Design Plan 생성
- [x] Step 3: 질문 파일 생성 (`backend-functional-design-questions.md`)
- [x] Step 4: 사용자 답변 수집 및 모호성 분석

### Phase 2: 산출물 생성
- [x] Step 5: `domain-entities.md` 생성
  - [x] JPA Entity 설계 (Store, Table, TableSession, Menu, MenuCategory, Order, OrderItem)
  - [x] Entity 관계 다이어그램
  - [x] 필드 정의 및 제약 조건
- [x] Step 6: `business-rules.md` 생성
  - [x] 인증/인가 규칙
  - [x] 주문 처리 규칙
  - [x] 테이블 세션 규칙
  - [x] 메뉴 관리 규칙
  - [x] 유효성 검증 규칙
- [x] Step 7: `business-logic-model.md` 생성
  - [x] AuthService 로직 흐름
  - [x] TableService 로직 흐름
  - [x] MenuService 로직 흐름
  - [x] OrderService 로직 흐름
  - [x] SseService 로직 흐름
- [x] Step 8: 완료 메시지 및 승인 요청

---

## 참조 문서
- `aidlc-docs/inception/application-design/unit-of-work.md`
- `aidlc-docs/inception/application-design/component-methods.md`
- `aidlc-docs/inception/application-design/services.md`
- `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
- `aidlc-docs/inception/requirements/requirements.md`
