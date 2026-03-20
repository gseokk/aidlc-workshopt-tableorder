# Tech Stack Decisions - Frontend

---

## 확정된 기술 스택

| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|---------|
| 언어 | TypeScript | 5.x | 타입 안전성, IDE 지원 |
| 프레임워크 | React | 18.x | 컴포넌트 기반, 생태계 |
| 빌드 도구 | Vite | 5.x | 빠른 HMR, 간단한 설정 |
| 라우팅 | React Router | 6.x | SPA 라우팅 표준 |
| UI 라이브러리 | shadcn/ui | latest | headless + 높은 커스터마이징 |
| CSS | Tailwind CSS | 3.x | 유틸리티 클래스, 빠른 개발 |
| 서버 상태 관리 | TanStack Query (React Query) | 5.x | 캐싱, 로딩/에러 처리 자동화 |
| 클라이언트 상태 | React Context API | (내장) | 인증, 장바구니, SSE 상태 |
| HTTP 클라이언트 | Axios | 1.x | 인터셉터, 에러 처리 |
| Mock API | 로컬 mock 함수 | - | 간단한 구현, 빠른 전환 |
| 패키지 매니저 | npm | - | 기본 표준 |

---

## 상태 관리 분리 전략

```
서버 상태 (React Query)          클라이언트 상태 (Context API)
  - 메뉴 목록                      - AuthContext
  - 카테고리 목록                     (테이블 토큰, 관리자 JWT)
  - 주문 내역 (고객)                - CartContext
  - 테이블 주문 목록 (관리자)          (장바구니 items, localStorage)
  - 과거 주문 내역                  - SseContext
                                    (SSE 연결, 실시간 주문 데이터)
```

---

## Mock API 전략

```typescript
// src/services/customerApi.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const getMenus = async (categoryId?: number): Promise<Menu[]> => {
  if (USE_MOCK) return mockMenus.filter(m => !categoryId || m.categoryId === categoryId)
  return apiClient.get('/api/menus', { params: { categoryId } })
}
```

- `.env.development`: `VITE_USE_MOCK=true`
- `.env.production`: `VITE_USE_MOCK=false`
- mock 데이터: `src/services/mock/data/` 폴더에 관리

---

## 주요 패키지 목록

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.0.0",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "latest",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "latest",
    "postcss": "latest",
    "eslint": "latest",
    "prettier": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

---

## 환경 변수

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true

# .env.production
VITE_API_BASE_URL=http://backend:8080
VITE_USE_MOCK=false
```
