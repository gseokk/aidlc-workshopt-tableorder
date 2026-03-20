# Infrastructure Design - Frontend

## 결정 사항 요약

| 항목 | 결정 |
|------|------|
| 개발 서버 | Vite dev server (포트 3000) |
| 프로덕션 서버 | Nginx (Docker 컨테이너) |
| API 통신 | 직접 호출 (CORS 설정 필요) |
| 포트 구성 | Frontend: 3000, Backend: 8080, MySQL: 3306 |
| 환경 분리 | `.env.development` / `.env.production` |
| HTTPS | 미적용 (HTTP only, 로컬/개발 목적) |

---

## 개발 환경 (Local)

```
개발자 브라우저
    |
    | :3000
    v
Vite Dev Server (frontend/)
    |
    | :8080 (VITE_API_BASE_URL=http://localhost:8080)
    v
Spring Boot (backend/)
    |
    | :3306
    v
MySQL 8
```

- Frontend: `npm run dev` → `http://localhost:3000`
- Backend: `./gradlew bootRun` → `http://localhost:8080`
- MySQL: Docker 또는 로컬 설치

### CORS 설정 필요
개발 환경에서 Frontend(3000) → Backend(8080) 직접 호출이므로 Backend에서 CORS 허용 필요:
```
Access-Control-Allow-Origin: http://localhost:3000
```

---

## 프로덕션 환경 (Docker Compose)

```
사용자 브라우저
    |
    | :3000
    v
Nginx (frontend 컨테이너)
  - React 빌드 결과물 서빙 (dist/)
  - SPA fallback: try_files $uri /index.html
    |
    | :8080 (VITE_API_BASE_URL=http://backend:8080)
    v
Spring Boot (backend 컨테이너)
    |
    | :3306
    v
MySQL 8 (mysql 컨테이너)
```

### Nginx 설정 (프로덕션)
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- API 요청은 Frontend에서 `http://backend:8080`으로 직접 호출
- Docker 내부 네트워크에서 컨테이너명으로 통신

---

## 환경 변수

```bash
# .env.development (로컬 개발)
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true

# .env.production (Docker 프로덕션)
VITE_API_BASE_URL=http://backend:8080
VITE_USE_MOCK=false
```

---

## Frontend Docker 설정

### Dockerfile (frontend/Dockerfile)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### nginx.conf (frontend/nginx.conf)
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
