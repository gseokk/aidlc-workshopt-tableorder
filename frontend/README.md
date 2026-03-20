# Table Order - Frontend

React 18 + TypeScript + Vite 기반 테이블오더 서비스 Frontend

## 기술 스택

- React 18, TypeScript, Vite
- TanStack Query v5 (서버 상태)
- React Context API (클라이언트 상태)
- Tailwind CSS + shadcn/ui
- Axios, React Router v6
- Vitest + React Testing Library

## 개발 환경 실행

```bash
npm install
npm run dev       # http://localhost:3000 (Mock 모드)
```

## 테스트 실행

```bash
npm run test      # 단일 실행
npm run test:watch  # watch 모드
```

## 빌드

```bash
npm run build
```

## 환경 변수

| 변수 | 개발 | 프로덕션 |
|------|------|---------|
| VITE_API_BASE_URL | http://localhost:8080 | http://backend:8080 |
| VITE_USE_MOCK | true | false |

## 라우트 구조

| 경로 | 설명 |
|------|------|
| /setup | 테이블 초기 설정 |
| /menu | 메뉴 주문 (고객) |
| /order/confirm | 주문 확인 |
| /orders | 주문 내역 (고객) |
| /admin/login | 관리자 로그인 |
| /admin/dashboard | 실시간 대시보드 |
| /admin/menus | 메뉴 관리 |
| /admin/orders/history | 과거 주문 내역 |
