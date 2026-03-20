# NFR Requirements - Backend

## 1. 성능 요구사항 (Performance)

### 응답 시간
| API 유형 | 목표 응답 시간 | 비고 |
|---------|------------|------|
| 일반 REST API (조회) | 200ms 이하 | DB 쿼리 포함 |
| 주문 생성 API | 200ms 이하 | SSE 이벤트 발행 포함 |
| SSE 연결 | 즉시 연결 | 초기 연결 지연 없음 |

### 동시 접속 규모
- 예상 테이블 수: 10개 이하
- 동시 접속자: 20명 이하 (고객 + 관리자)
- SSE 동시 연결: 최대 5개 (관리자 다중 탭 포함)
- DB Connection Pool: HikariCP 기본값 (최대 10개) 적용

### 성능 최적화 전략
- JPA N+1 문제 방지: `@EntityGraph` 또는 `JOIN FETCH` 사용
- 메뉴 목록 조회: 카테고리별 인덱스 활용
- 주문 조회: `session_id` 인덱스 활용

---

## 2. 가용성 및 신뢰성 (Availability & Reliability)

### 운영 환경
- 환경: 로컬/개발 환경 (Docker Compose, 단일 서버)
- 고가용성 요구사항 없음 (MVP 단계)
- 단일 장애점(SPOF) 허용

### 데이터 신뢰성
- 백업: MVP 단계 불필요
- 트랜잭션: Spring `@Transactional` 적용으로 데이터 일관성 보장
- SSE 연결 끊김 시: 클라이언트 재연결 후 REST API로 최신 상태 재조회

### 장애 처리
- SSE Emitter 오류 시 자동 제거 (다른 연결 영향 없음)
- DB 연결 실패 시 HTTP 500 응답 + 로그 출력
- 애플리케이션 재시작 시 SSE 연결 자동 재연결 (클라이언트 책임)

---

## 3. 보안 요구사항 (Security)

### 인증/인가
- 관리자: JWT (HS256, 8시간 만료)
- 고객: 테이블 토큰 (JWT, HS256, 12시간 만료)
- JWT Secret: 환경변수로 관리 (`JWT_SECRET`)
- Spring Security Filter Chain으로 API 경로별 권한 분리

### 네트워크 보안
- HTTPS: 불필요 (로컬/내부망 환경, HTTP 사용)
- CORS: 모든 Origin 허용 (`*`) - 개발 편의성 우선
- Rate Limiting: 불필요 (MVP 단계, 내부 네트워크)

### 데이터 보안
- 관리자 비밀번호: bcrypt 해시 저장
- 테이블 비밀번호: 평문 저장 (단순 PIN, MVP 수준)
- JWT Secret, DB 비밀번호: 환경변수 또는 Docker Compose `env_file`로 관리
- 민감 정보 로그 출력 금지

---

## 4. 로깅 및 모니터링 (Observability)

### 로깅
- 출력 방식: 콘솔 출력 (`docker logs`로 확인)
- 파일 저장: 불필요
- 로그 레벨:
  - 운영: `INFO`
  - 개발: `DEBUG` (application.yml 프로파일로 분리)
- 로그 포함 항목: 요청 메서드/경로, 응답 상태, 처리 시간, 예외 스택트레이스

### 헬스체크
- Spring Boot Actuator: 미사용
- Docker healthcheck: 미적용 (MVP 단계)

### 모니터링
- 별도 모니터링 도구 불필요 (MVP 단계)
- 예외 발생 시 콘솔 로그로 확인

---

## 5. 유지보수성 (Maintainability)

### API 문서화
- Swagger/OpenAPI: `springdoc-openapi` 라이브러리 사용
- 접근 URL: `http://localhost:8080/swagger-ui.html`
- 모든 Controller에 `@Operation`, `@ApiResponse` 어노테이션 적용

### 테스트 전략
- 목표 커버리지: Service 레이어 70% 이상
- 테스트 범위:
  - Unit Test: Service 레이어 (Mockito 사용)
  - Integration Test: Controller 레이어 (`@SpringBootTest` + MockMvc)
  - Repository Test: `@DataJpaTest` (H2 in-memory)
- 테스트 프레임워크: JUnit 5 + Mockito + AssertJ

### 코드 품질
- Java 17 기능 활용 (Record, Pattern Matching 등)
- Lombok 사용 (`@Getter`, `@Builder`, `@RequiredArgsConstructor`)
- 패키지 구조: 레이어별 분리 (controller, service, repository, entity, dto)

---

## 6. 확장성 (Scalability)

### 현재 단계 (MVP)
- 단일 인스턴스 운영
- 수평 확장 불필요
- SseService: 인메모리 `ConcurrentHashMap` 사용 (단일 인스턴스 한정)

### 향후 확장 고려사항 (구현 불필요, 참고용)
- 다중 인스턴스 시 SSE: Redis Pub/Sub으로 교체 필요
- 다중 매장 지원 시: 매장별 데이터 격리 강화
