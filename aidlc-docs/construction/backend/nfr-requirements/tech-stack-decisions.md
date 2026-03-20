# Tech Stack Decisions - Backend

## 확정된 기술 스택

| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|---------|
| Language | Java | 17 LTS | Record, Pattern Matching 등 최신 기능, LTS 안정성 |
| Framework | Spring Boot | 3.x | Spring Security 6, Jakarta EE 10, 최신 생태계 |
| ORM | Spring Data JPA + Hibernate | 6.x | 생산성, 표준 JPA 스펙 |
| Database | MySQL | 8.0 | 안정성, JSON 지원, 인덱스 성능 |
| Build Tool | Gradle | 8.x | 빠른 빌드, Kotlin DSL 지원 |
| Container | Docker + Docker Compose | latest | 로컬 개발 환경 일관성 |

---

## 핵심 라이브러리 결정

### 인증/보안
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Spring Security | 6.x (Boot 포함) | 인증/인가 Filter Chain |
| jjwt (io.jsonwebtoken) | 0.12.x | JWT 생성/검증 |
| Spring Boot Starter Security | Boot 포함 | Security 자동 설정 |

### API 문서화
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| springdoc-openapi-starter-webmvc-ui | 2.x | Swagger UI + OpenAPI 3.0 |

### 개발 편의
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Lombok | 1.18.x | Boilerplate 코드 제거 |
| Spring Boot DevTools | Boot 포함 | 개발 시 자동 재시작 |

### 테스트
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| JUnit 5 | Boot 포함 | 테스트 프레임워크 |
| Mockito | Boot 포함 | Mock 객체 생성 |
| AssertJ | Boot 포함 | 가독성 높은 assertion |
| H2 Database | Boot 포함 | Repository 테스트용 in-memory DB |
| Spring Boot Test | Boot 포함 | `@SpringBootTest`, MockMvc |

---

## 주요 Spring Boot 설정 결정

### application.yml 프로파일 전략
```
application.yml          # 공통 설정
application-dev.yml      # 개발 환경 (로컬, Docker Compose)
application-test.yml     # 테스트 환경 (H2, 로그 최소화)
```

### JPA 설정
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update        # 스키마 자동 업데이트
    show-sql: true            # 개발 시 SQL 출력
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 100  # N+1 방지
```

### 데이터베이스 초기화
- `ddl-auto: update` 사용 (스키마 자동 생성/업데이트)
- `DataInitializer` (`@Component` + `CommandLineRunner`): 초기 매장 데이터 삽입
  - 이미 존재하면 삽입 스킵 (idempotent)

### SSE 설정
```yaml
spring:
  mvc:
    async:
      request-timeout: 1800000  # 30분 (SSE 연결 유지)
```

### CORS 설정
```java
// WebMvcConfigurer 구현
registry.addMapping("/api/**")
    .allowedOrigins("*")
    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
    .allowedHeaders("*")
```

---

## 패키지 구조

```
com.tableorder/
├── config/
│   ├── SecurityConfig.java       # Spring Security 설정
│   ├── CorsConfig.java           # CORS 설정
│   └── SwaggerConfig.java        # OpenAPI 설정
├── controller/
│   ├── AuthController.java
│   ├── TableController.java
│   ├── MenuController.java
│   ├── OrderController.java
│   └── SseController.java
├── service/
│   ├── AuthService.java
│   ├── TableService.java
│   ├── MenuService.java
│   ├── OrderService.java
│   └── SseService.java
├── repository/
│   ├── StoreRepository.java
│   ├── TableRepository.java
│   ├── TableSessionRepository.java
│   ├── MenuCategoryRepository.java
│   ├── MenuRepository.java
│   ├── OrderRepository.java
│   └── OrderItemRepository.java
├── entity/
│   ├── Store.java
│   ├── TableEntity.java
│   ├── TableSession.java
│   ├── MenuCategory.java
│   ├── Menu.java
│   ├── Order.java
│   ├── OrderItem.java
│   └── OrderStatus.java          # Enum
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── TableLoginRequest.java
│   │   ├── TableSetupRequest.java
│   │   ├── MenuCreateRequest.java
│   │   ├── MenuUpdateRequest.java
│   │   ├── MenuOrderRequest.java
│   │   ├── OrderCreateRequest.java
│   │   └── OrderStatusRequest.java
│   └── response/
│       ├── LoginResponse.java
│       ├── TableLoginResponse.java
│       ├── TableSetupResponse.java
│       ├── CategoryResponse.java
│       ├── MenuResponse.java
│       ├── OrderResponse.java
│       ├── OrderItemResponse.java
│       └── OrderHistoryResponse.java
├── security/
│   ├── JwtFilter.java            # JWT 검증 Filter
│   ├── JwtProvider.java          # JWT 생성/검증 유틸
│   ├── AdminClaims.java          # 관리자 JWT Claims
│   └── TableClaims.java          # 테이블 토큰 Claims
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── UnauthorizedException.java
│   ├── ForbiddenException.java
│   ├── NotFoundException.java
│   └── BadRequestException.java
└── init/
    └── DataInitializer.java      # 초기 매장 데이터 삽입
```

---

## Docker Compose 서비스 구성

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: tableorder
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/tableorder
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```
