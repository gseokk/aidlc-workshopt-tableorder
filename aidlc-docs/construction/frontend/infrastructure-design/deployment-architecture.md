# Deployment Architecture - Frontend

## 전체 배포 구성도

### 개발 환경

```
[개발자 로컬 머신]

  Browser :3000
      |
  Vite Dev Server
  (frontend/ npm run dev)
      |
      | HTTP :8080
      | CORS: Allow localhost:3000
      v
  Spring Boot
  (backend/ ./gradlew bootRun)
      |
      | :3306
      v
  MySQL 8
  (Docker or local)
```

### 프로덕션 환경 (Docker Compose)

```
[서버]

  Browser :3000
      |
  +-------------------+
  | frontend container |
  | Nginx :80          |
  | /dist (React SPA)  |
  +-------------------+
      |
      | HTTP (Docker internal network)
      | http://backend:8080
      v
  +-------------------+
  | backend container  |
  | Spring Boot :8080  |
  +-------------------+
      |
      | :3306
      v
  +-------------------+
  | mysql container    |
  | MySQL 8 :3306      |
  | volume: mysql-data |
  +-------------------+
```

---

## Docker Compose 구성

```yaml
# docker-compose.yml (workspace root)
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: tableorder
      MYSQL_USER: tableorder
      MYSQL_PASSWORD: tableorder
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/tableorder
      SPRING_DATASOURCE_USERNAME: tableorder
      SPRING_DATASOURCE_PASSWORD: tableorder
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql-data:
```

---

## 빌드 및 실행 명령

### 개발 환경
```bash
# MySQL만 Docker로 실행
docker-compose up mysql -d

# Backend 실행
cd backend && ./gradlew bootRun

# Frontend 실행 (Mock 모드)
cd frontend && npm run dev
```

### 프로덕션 환경
```bash
# 전체 스택 빌드 및 실행
docker-compose up --build -d

# 로그 확인
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 컨테이너 간 통신

| 출발 | 목적지 | 프로토콜 | 포트 |
|------|--------|---------|------|
| Browser | frontend (Nginx) | HTTP | 3000 |
| frontend (Nginx) | - | - | - (직접 서빙) |
| Browser | backend | HTTP | 8080 |
| backend | mysql | TCP | 3306 |

> 프로덕션에서 Frontend는 빌드된 정적 파일을 Nginx가 서빙하며,  
> API 호출은 브라우저에서 `http://backend:8080`으로 직접 요청합니다.  
> (단, 브라우저는 Docker 내부 네트워크 접근 불가 → 실제 배포 시 도메인/IP 필요)

---

## 실제 배포 시 고려사항

현재는 로컬/개발 목적이므로 HTTP만 사용하지만, 실제 서버 배포 시:
- `VITE_API_BASE_URL`을 실제 서버 IP 또는 도메인으로 변경
- Backend CORS 설정에 실제 도메인 추가
- 필요 시 Nginx에서 SSL 적용
