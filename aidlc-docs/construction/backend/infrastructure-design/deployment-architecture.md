# Deployment Architecture - Backend

## 전체 배포 구성도

```
[개발자 로컬 머신]
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │  frontend    │    │   backend    │    │   mysql   │  │
│  │  (nginx:80)  │───▶│ (java:8080)  │───▶│  (:3306)  │  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│       :3000                :8080              :3306      │
│                                                          │
│  [tableorder-network (bridge)]                           │
│  [mysql_data volume]                                     │
└─────────────────────────────────────────────────────────┘
         ↑                    ↑
    브라우저 접속          API 직접 테스트
    localhost:3000      localhost:8080
```

---

## docker-compose.yml (전체)

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: tableorder-mysql
    environment:
      MYSQL_DATABASE: tableorder
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - tableorder-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tableorder-backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/tableorder?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_USERNAME: ${ADMIN_USERNAME:-admin}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - tableorder-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: tableorder-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - tableorder-network
    restart: unless-stopped

volumes:
  mysql_data:

networks:
  tableorder-network:
    driver: bridge
```

---

## 시작/종료 절차

### 최초 시작
```bash
# 1. 환경변수 파일 생성
cp .env.example .env
# .env 파일 편집 (비밀번호 설정)

# 2. 전체 빌드 및 시작
docker-compose up --build -d

# 3. 로그 확인
docker-compose logs -f backend
```

### 일반 시작/종료
```bash
# 시작
docker-compose up -d

# 종료 (데이터 보존)
docker-compose down

# 종료 + 데이터 삭제
docker-compose down -v
```

### 백엔드만 재빌드
```bash
docker-compose up --build -d backend
```

---

## 개발 환경 접근 정보

| 서비스 | URL | 용도 |
|-------|-----|------|
| Frontend | http://localhost:3000 | 고객/관리자 UI |
| Backend API | http://localhost:8080 | REST API |
| Swagger UI | http://localhost:8080/swagger-ui.html | API 문서 |
| MySQL | localhost:3306 | DB 직접 접근 (개발용) |

---

## 초기 데이터

애플리케이션 시작 시 `DataInitializer`가 자동 실행:

```
매장 정보:
  storeIdentifier: "store001"
  name: "테이블오더 매장"
  adminUsername: ${ADMIN_USERNAME} (기본값: "admin")
  adminPassword: bcrypt(${ADMIN_PASSWORD})
```

관리자 로그인 테스트:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeIdentifier":"store001","username":"admin","password":"your_password"}'
```

---

## .env.example 파일

```
# MySQL
MYSQL_ROOT_PASSWORD=change_me_mysql_password

# JWT (최소 32자 이상 랜덤 문자열)
JWT_SECRET=change_me_jwt_secret_key_minimum_32_characters

# 관리자 계정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me_admin_password
```
