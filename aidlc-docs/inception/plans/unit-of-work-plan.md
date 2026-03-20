# Unit of Work Plan

## 실행 체크리스트

### PART 1 - Planning
- [x] Step 1: Application Design 기반 Unit 초안 식별
- [x] Step 2: 질문 생성
- [x] Step 3: 사용자 답변 수집
- [x] Step 4: 답변 분석 (모순 없음 확인)
- [x] Step 5: 계획 승인

### PART 2 - Generation
- [x] Step 6: unit-of-work.md 생성
- [x] Step 7: unit-of-work-dependency.md 생성
- [x] Step 8: unit-of-work-story-map.md 생성
- [ ] Step 9: 완료 메시지 및 승인

---

## Unit 초안

Application Design에서 확정된 구조를 기반으로 아래 2개 Unit을 제안합니다.

```
Unit 1: backend
  - Spring Boot REST API
  - MySQL 데이터베이스
  - SSE 실시간 통신
  - JWT / 테이블 토큰 인증

Unit 2: frontend
  - 단일 React (TypeScript) 앱
  - 고객 주문 UI (/menu, /cart, /orders)
  - 관리자 대시보드 UI (/admin/*)
```

---

## 질문

### Question 1
프로젝트 디렉토리 구조를 어떻게 구성하시겠습니까?

A) Monorepo - 하나의 루트 아래 backend/, frontend/ 폴더로 구성
B) 별도 Repository - backend, frontend 각각 독립 프로젝트
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
Unit 개발 순서를 어떻게 하시겠습니까?

A) Backend 먼저 → Frontend 순서로 순차 개발
B) Frontend 먼저 → Backend 순서로 순차 개발
C) 동시 개발 (Backend/Frontend 병렬 진행)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

답변 완료 후 "완료"라고 알려주세요.
