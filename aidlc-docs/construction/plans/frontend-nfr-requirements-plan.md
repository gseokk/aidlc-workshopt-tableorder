# Frontend NFR Requirements Plan

## 실행 체크리스트
- [x] Step 1: Functional Design 분석 완료
- [x] Step 2: 질문 생성
- [x] Step 3: 사용자 답변 수집
- [x] Step 4: 답변 분석 (모순 없음 확인)
- [x] Step 5: 아티팩트 생성
  - [x] nfr-requirements.md
  - [x] tech-stack-decisions.md
- [ ] Step 6: 승인

---

## 질문

### Question 1
UI 컴포넌트 라이브러리를 사용하시겠습니까?

A) Tailwind CSS만 사용 (유틸리티 클래스, 커스텀 컴포넌트 직접 구현)
B) shadcn/ui + Tailwind CSS (headless 컴포넌트, 높은 커스터마이징)
C) Material UI (MUI) - 완성도 높은 컴포넌트 세트
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
Frontend 상태 관리를 어떻게 하시겠습니까?

A) React Context API만 사용 (이미 설계된 AuthContext, CartContext, SseContext)
B) Zustand 추가 (전역 상태 관리 라이브러리, 가볍고 간단)
C) React Query + Context API (서버 상태는 React Query, 클라이언트 상태는 Context)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 3
Mock API 구현 방식을 어떻게 하시겠습니까?

A) MSW (Mock Service Worker) - 네트워크 레벨 인터셉트, 실제 API와 동일한 방식
B) 로컬 mock 함수 - API 함수를 mock 데이터 반환 함수로 교체
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

답변 완료 후 "완료"라고 알려주세요.
