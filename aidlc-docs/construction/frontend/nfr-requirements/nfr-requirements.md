# NFR Requirements - Frontend

---

## 성능 (Performance)

| 요구사항 | 목표값 | 비고 |
|---------|-------|------|
| 초기 페이지 로드 | 3초 이내 | Vite 번들 최적화 |
| 메뉴 화면 렌더링 | 1초 이내 | React Query 캐싱 활용 |
| SSE 이벤트 → UI 반영 | 2초 이내 | 요구사항 명시 |
| 장바구니 조작 응답 | 즉시 (동기) | localStorage 기반 |

### React Query 캐싱 전략
- 메뉴/카테고리: `staleTime` 5분 (자주 변경되지 않음)
- 주문 내역: `staleTime` 0 (항상 최신 데이터)
- 관리자 테이블 주문: 초기 로드 후 SSE로 실시간 업데이트

---

## 보안 (Security)

| 요구사항 | 구현 방법 |
|---------|---------|
| 토큰 저장 | localStorage (테이블 토큰, 관리자 JWT) |
| 토큰 자동 첨부 | Axios 인터셉터 (Authorization: Bearer) |
| 만료 토큰 처리 | 401 응답 시 자동 로그아웃 + 로그인 화면 이동 |
| 관리자 라우트 보호 | PrivateRoute 컴포넌트로 JWT 검증 |
| XSS 방지 | React 기본 이스케이프 + dangerouslySetInnerHTML 미사용 |

---

## 사용성 (Usability)

| 요구사항 | 구현 방법 |
|---------|---------|
| 터치 친화적 버튼 | 최소 44x44px (Tailwind: `min-h-11 min-w-11`) |
| 로딩 상태 표시 | React Query `isLoading` → Skeleton UI |
| 에러 피드백 | Toast (일반) / ErrorModal (중요) |
| 반응형 레이아웃 | Tailwind 반응형 클래스 (`sm:`, `md:`, `lg:`) |

---

## 신뢰성 (Reliability)

| 요구사항 | 구현 방법 |
|---------|---------|
| SSE 재연결 | EventSource 오류 시 3초 후 자동 재연결 (최대 5회) |
| API 재시도 | React Query `retry: 1` (1회 재시도) |
| 장바구니 영속성 | localStorage 동기화로 새로고침 후 복원 |
| 오프라인 감지 | `navigator.onLine` 체크, 오프라인 시 Toast 알림 |

---

## 유지보수성 (Maintainability)

| 요구사항 | 구현 방법 |
|---------|---------|
| TypeScript 엄격 모드 | `strict: true` in tsconfig.json |
| 코드 품질 | ESLint + Prettier |
| 컴포넌트 문서화 | JSDoc 주석 |
| 환경 변수 | `.env` 파일로 API URL 관리 |
