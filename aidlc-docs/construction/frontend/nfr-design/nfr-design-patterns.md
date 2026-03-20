# NFR Design Patterns - Frontend

---

## 1. 인증 패턴

### Token Guard Pattern (라우트 보호)
```
PrivateRoute (고객용)
  -> AuthContext.tableToken 존재 여부 확인
  -> 없으면 /setup 리다이렉트

AdminPrivateRoute (관리자용)
  -> AuthContext.adminToken 존재 + 만료 여부 확인
  -> 없거나 만료 시 /admin/login 리다이렉트
```

### Interceptor Pattern (토큰 자동 첨부)
```
Axios Request Interceptor
  -> Authorization: Bearer {token} 자동 첨부

Axios Response Interceptor
  -> 401 응답 감지
  -> AuthContext.logout() 호출
  -> 로그인 화면으로 리다이렉트
```

---

## 2. 서버 상태 관리 패턴 (React Query)

### Cache-First Pattern
```
메뉴/카테고리 조회
  staleTime: 5분
  gcTime: 10분
  -> 캐시 히트 시 즉시 반환, 백그라운드 갱신
```

### Always-Fresh Pattern
```
주문 내역 조회
  staleTime: 0
  -> 항상 서버에서 최신 데이터 조회
```

### Optimistic Update Pattern (주문 상태 변경)
```
관리자가 주문 상태 변경
  -> UI 즉시 업데이트 (낙관적)
  -> API 호출
  -> 실패 시 이전 상태로 롤백 + Toast 에러
```

---

## 3. 실시간 데이터 패턴 (SSE)

### Reconnection Pattern
```
SseContext
  connect(storeId)
    -> new EventSource(url)
    -> onerror: 3초 후 재연결 시도
    -> 최대 5회 재연결, 초과 시 에러 Toast + 수동 재연결 버튼 표시
    -> onopen: reconnectCount 초기화

  disconnect()
    -> eventSource.close()
    -> reconnectTimer 정리
```

### Hybrid Data Pattern (초기 로드 + 실시간 업데이트)
```
DashboardPage 마운트
  1. React Query로 초기 데이터 로드 (REST API)
  2. SSE 연결 수립
  3. SSE 이벤트 수신 시 React Query 캐시 직접 업데이트
     queryClient.setQueryData(['tableOrders', tableId], updater)
```

---

## 4. 에러 처리 패턴

### Error Boundary Pattern
```
App
  +-- ErrorBoundary (전역 예외 처리)
       -> 예상치 못한 렌더링 오류 캐치
       -> 에러 화면 표시 + 새로고침 버튼
```

### Tiered Error Handling Pattern
```
에러 심각도 분류:
  Critical (모달)
    - 주문 실패
    - 네트워크 완전 단절
    - 인증 만료

  Warning (Toast 3초)
    - API 일반 오류
    - 상태 변경 실패
    - 메뉴 저장 성공/실패
```

---

## 5. 성능 패턴

### Code Splitting Pattern
```
React.lazy() + Suspense
  -> 관리자 페이지 (/admin/*): 별도 청크로 분리
  -> 고객 페이지: 메인 청크
  -> 초기 로드 번들 크기 최소화
```

### Skeleton Loading Pattern
```
React Query isLoading 상태
  -> 메뉴 카드: MenuCardSkeleton
  -> 테이블 카드: TableCardSkeleton
  -> 주문 목록: OrderListSkeleton
```

---

## 6. 오프라인 감지 패턴

```
useOnlineStatus hook
  -> window.addEventListener('online'/'offline')
  -> 오프라인 감지 시 Toast 알림 ("네트워크 연결을 확인해 주세요")
  -> 온라인 복귀 시 React Query refetch 트리거
```
