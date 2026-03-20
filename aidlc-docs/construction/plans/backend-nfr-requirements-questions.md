# Backend NFR Requirements - 질문

Unit 2 (Backend) NFR Requirements를 위한 질문입니다.
`[Answer]:` 태그에 답변을 작성해 주세요.

> 기술 스택(Java 17, Spring Boot 3, MySQL 8, Docker Compose)은 이미 확정되어 있어
> 운영 환경 및 품질 요구사항 중심으로 질문합니다.

---

## 섹션 1: 성능 요구사항 (Performance)

**Q1. API 응답 시간 목표**

일반 REST API의 목표 응답 시간을 설정해 주세요.

A) 200ms 이하 (일반적인 웹 서비스 수준)
B) 500ms 이하 (허용 가능한 수준)
C) 1초 이하 (MVP 수준, 성능 최적화 후순위)

[Answer]: A

---

**Q2. 동시 접속 규모**

예상 동시 접속자 수를 선택해 주세요. (테이블 수 기준)

A) 소규모: 테이블 10개 이하, 동시 접속 20명 이하
B) 중규모: 테이블 30개 이하, 동시 접속 60명 이하
C) 대규모: 테이블 50개 이상, 동시 접속 100명 이상

[Answer]: A

---

## 섹션 2: 가용성 및 신뢰성 (Availability & Reliability)

**Q3. 운영 환경**

이 시스템은 어떤 환경에서 운영되나요?

A) 로컬/개발 환경만 (Docker Compose, 단일 서버)
B) 단일 서버 운영 (VPS, EC2 단일 인스턴스)
C) 클라우드 고가용성 (ECS, EKS 등 컨테이너 오케스트레이션)

[Answer]: A

---

**Q4. 데이터 백업 전략**

MySQL 데이터 백업이 필요한가요?

A) MVP 단계 - 백업 불필요 (개발/테스트 용도)
B) 일 1회 자동 백업 (mysqldump 또는 RDS 스냅샷)
C) 실시간 복제 (MySQL Replication)

[Answer]: A

---

## 섹션 3: 보안 요구사항 (Security)

**Q5. API Rate Limiting**

API 요청 제한이 필요한가요?

A) 불필요 (MVP 단계, 내부 네트워크 사용)
B) IP 기반 Rate Limiting (Spring 또는 Nginx 레벨)
C) 토큰 기반 Rate Limiting (사용자별 제한)

[Answer]: A

---

**Q6. HTTPS 적용**

HTTPS가 필요한가요?

A) 불필요 (로컬/내부망 환경, HTTP만 사용)
B) Nginx reverse proxy에서 SSL 종료 (Let's Encrypt)
C) 애플리케이션 레벨 HTTPS

[Answer]: A

---

## 섹션 4: 로깅 및 모니터링 (Observability)

**Q7. 로그 레벨 및 저장 방식**

운영 로그를 어떻게 관리할까요?

A) 콘솔 출력만 (Docker logs, 파일 저장 없음)
B) 파일 저장 (Logback, 일별 롤링)
C) 중앙 집중식 로깅 (ELK, CloudWatch 등)

[Answer]: A

---

**Q8. 헬스체크 엔드포인트**

Spring Boot Actuator 헬스체크가 필요한가요?

A) 필요 - `/actuator/health` 엔드포인트 활성화 (Docker healthcheck 연동)
B) 불필요 - 별도 헬스체크 없음
C) 필요 - 커스텀 헬스체크 엔드포인트 (`/health`)

[Answer]: B

---

## 섹션 5: 유지보수성 (Maintainability)

**Q9. API 문서화**

API 문서가 필요한가요?

A) Swagger/OpenAPI 자동 생성 (`springdoc-openapi`)
B) 별도 문서 불필요 (Frontend contracts 문서로 대체)
C) Postman Collection 파일 생성

[Answer]: A

---

**Q10. 테스트 커버리지 목표**

백엔드 테스트 커버리지 목표를 설정해 주세요.

A) 핵심 비즈니스 로직 위주 (Service 레이어 70% 이상)
B) 전체 코드 60% 이상 (Controller + Service + Repository)
C) MVP 수준 (주요 시나리오 통합 테스트 위주)

[Answer]: A

---

답변 완료 후 이 파일을 저장하면 NFR Requirements 산출물 생성을 시작합니다.
