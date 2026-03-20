# Logical Components - Frontend

NFR 요구사항을 충족하기 위해 추가되는 논리적 컴포넌트들입니다.

---

## 1. 라우트 보호 컴포넌트

### PrivateRoute (고객용)
```typescript
// 테이블 토큰 없으면 /setup으로 리다이렉트
const PrivateRoute = ({ children }) => {
  const { tableToken } = useAuthContext()
  return tableToken ? children : <Navigate to="/setup" />
}
```

### AdminPrivateRoute (관리자용)
```typescript
// JWT 없거나 만료 시 /admin/login으로 리다이렉트
const AdminPrivateRoute = ({ children }) => {
  const { adminToken, isAdminTokenExpired } = useAuthContext()
  if (!adminToken || isAdminTokenExpired()) return <Navigate to="/admin/login" />
  return children
}
```

---

## 2. 전역 에러 처리 컴포넌트

### ErrorBoundary
```typescript
class ErrorBoundary extends React.Component {
  // 예상치 못한 렌더링 오류 캐치
  // 에러 화면 + 새로고침 버튼 표시
}
```

### ToastProvider
```typescript
// 전역 Toast 상태 관리
// useToast() hook으로 어디서든 Toast 표시 가능
const ToastProvider = ({ children }) => { ... }
const useToast = () => { show, hide, toasts }
```

### ErrorModal
```typescript
// 중요 에러 모달 (주문 실패, 네트워크 오류)
// useErrorModal() hook으로 제어
```

---

## 3. 네트워크 상태 컴포넌트

### useOnlineStatus Hook
```typescript
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  // online/offline 이벤트 리스너
  // 오프라인 시 Toast 알림
  // 온라인 복귀 시 queryClient.invalidateQueries()
  return isOnline
}
```

---

## 4. API 클라이언트 (Axios 인스턴스)

### apiClient (공통 설정)
```typescript
// src/services/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// Request Interceptor: 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = getToken() // localStorage에서 읽기
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response Interceptor: 401 처리
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      window.location.href = isAdminRoute() ? '/admin/login' : '/setup'
    }
    return Promise.reject(error)
  }
)
```

---

## 5. React Query 설정

### QueryClient 설정
```typescript
// src/lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // 전역 mutation 에러 Toast 표시
        toast.error(getErrorMessage(error))
      },
    },
  },
})
```

### Query Keys 관리
```typescript
// src/lib/queryKeys.ts
export const queryKeys = {
  menus: (storeId: number, categoryId?: number) =>
    ['menus', storeId, categoryId] as const,
  categories: (storeId: number) =>
    ['categories', storeId] as const,
  sessionOrders: (sessionId: number) =>
    ['orders', 'session', sessionId] as const,
  tableOrders: (tableId: number) =>
    ['orders', 'table', tableId] as const,
  tableHistory: (tableId: number, from?: string, to?: string) =>
    ['orders', 'history', tableId, from, to] as const,
}
```

---

## 6. Skeleton UI 컴포넌트

```typescript
// 로딩 상태 표시용 Skeleton 컴포넌트
MenuCardSkeleton      // 메뉴 카드 로딩
TableCardSkeleton     // 테이블 카드 로딩
OrderListSkeleton     // 주문 목록 로딩
```

---

## 7. 전체 Provider 계층 구조

```
App
 +-- QueryClientProvider (React Query)
      +-- ErrorBoundary (전역 에러 캐치)
           +-- ToastProvider (전역 Toast)
                +-- AuthProvider (인증 상태)
                     +-- CartProvider (장바구니 - 고객 라우트에만)
                          +-- Router
                               +-- SseProvider (관리자 대시보드에만)
```
