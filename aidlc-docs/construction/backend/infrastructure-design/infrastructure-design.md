# Infrastructure Design - Backend

## 인프라 개요

로컬/개발 환경 기준 Docker Compose 단일 서버 구성.
모든 서비스는 동일 Docker 네트워크 내에서 통신.

---

## 컴포넌트 → 인프라 매핑

| 논리 컴포넌트 | 인프라 서비스 | 비고 |
|-------------|------------|------|
| Spring Boot 애플리케이션 | Docker Container (openjdk:17-slim) | 포트 8080 |
| MySQL 데이터베이스 | Docker Container (mysql:8.0) | 포트 3306 |
| SSE Emitter Pool | JVM 인메모리 (ConcurrentHashMap) | 외부 서비스 불필요 |
| JWT 토큰 저장 | Stateless (클라이언트 보관) | 서버 저장 불필요 |
| 로그 | Docker stdout/stderr | `docker logs` 명령으로 확인 |
| API 문서 | Spring Boot 내장 (springdoc-openapi) | `/swagger-ui.html` |

---

## 서비스별 인프라 상세

### Spring Boot 컨테이너

```
이미지: openjdk:17-slim (또는 eclipse-temurin:17-jre-alpine)
빌드: Gradle bootJar → JAR 파일 → Docker 이미지
포트: 8080 (호스트) → 8080 (컨테이너)
환경변수:
  SPRING_PROFILES_ACTIVE=dev
  SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/tableorder
  SPRING_DATASOURCE_USERNAME=root
  SPRING_DATASOURCE_PASSWORD=${MYSQL_ROOT_PASSWORD}
  JWT_SECRET=${JWT_SECRET}
  ADMIN_USERNAME=${ADMIN_USERNAME}
  ADMIN_PASSWORD=${ADMIN_PASSWORD}
헬스체크: 없음 (MVP)
재시작 정책: unless-stopped
의존성: mysql 서비스 healthy 후 시작
```

### MySQL 컨테이너

```
이미지: mysql:8.0
포트: 3306 (호스트) → 3306 (컨테이너)
환경변수:
  MYSQL_DATABASE=tableorder
  MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
볼륨: mysql_data:/var/lib/mysql (데이터 영속성)
문자셋: utf8mb4 (한글 지원)
헬스체크: mysqladmin ping
```

---

## 네트워크 구성

```
Docker Network: tableorder-network (bridge)

  [frontend:80]  ←HTTP→  [backend:8080]  ←JDBC→  [mysql:3306]

호스트 포트 매핑:
  localhost:3000  →  frontend:80
  localhost:8080  →  backend:8080
  localhost:3306  →  mysql:3306 (개발 시 직접 접근용)
```

---

## 환경변수 관리

### `.env` 파일 (workspace root, gitignore 대상)
```
MYSQL_ROOT_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_key_min_32_chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### 환경별 Spring 프로파일
| 프로파일 | 활성화 조건 | 주요 설정 |
|---------|-----------|---------|
| dev | Docker Compose 실행 | MySQL, DEBUG 로그, show-sql |
| test | `./gradlew test` | H2 in-memory, 로그 최소화 |

---

## 스토리지 설계

### MySQL 데이터베이스
- 데이터베이스명: `tableorder`
- 문자셋: `utf8mb4`, Collation: `utf8mb4_unicode_ci`
- 스키마 관리: `spring.jpa.hibernate.ddl-auto=update` (자동 생성/업데이트)
- 볼륨: `mysql_data` (Docker named volume, 컨테이너 재시작 시 데이터 보존)

### 파일 스토리지
- 메뉴 이미지: URL 저장 방식 (외부 이미지 URL 참조)
- 별도 파일 스토리지 서비스 불필요

---

## 빌드 파이프라인

```
소스 코드 (backend/)
    ↓
./gradlew bootJar
    ↓
build/libs/tableorder-backend.jar
    ↓
docker build -t tableorder-backend .
    ↓
docker-compose up
```

### Dockerfile (backend/)
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Multi-stage Build (선택적)
```dockerfile
FROM gradle:8-jdk17-alpine AS builder
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
