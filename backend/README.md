# 테이블오더 서비스 - Backend

Spring Boot 3 기반 테이블오더 REST API 서버입니다.

## 기술 스택

- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA + SQLite 3
- SSE (Server-Sent Events)
- Gradle
- Springdoc OpenAPI (Swagger UI)

## 로컬 실행

### 사전 요구사항

- Java 17+ (https://adoptium.net - Temurin 17 LTS)
- SQLite는 별도 설치 불필요 (Gradle 의존성으로 자동 포함)

### 실행

```powershell
cd backend
./gradlew bootRun
```

첫 실행 시 `tableorder.db` 파일이 자동 생성되고, `DataInitializer`가 기본 매장 데이터를 생성합니다.

### API 문서

서버 실행 후 Swagger UI 접속:

```
http://localhost:8080/swagger-ui.html
```

## 테스트 실행

```powershell
cd backend
./gradlew test
```

테스트는 H2 인메모리 DB를 사용하므로 SQLite 파일과 무관하게 실행됩니다.

## DB 관리

| 항목 | 내용 |
|------|------|
| DB 파일 위치 | `backend/tableorder.db` |
| 초기화 방법 | 파일 삭제 후 재실행 |
| GUI 도구 | [DB Browser for SQLite](https://sqlitebrowser.org) |

## API 엔드포인트 요약

### 인증 (Auth)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | /api/auth/login | 관리자 로그인 | 없음 |
| POST | /api/auth/table-login | 테이블 로그인 | 없음 |

### 고객 API (Customer)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/customer/menus | 메뉴 목록 조회 | Table Token |
| POST | /api/customer/orders | 주문 생성 | Table Token |
| GET | /api/customer/orders | 현재 세션 주문 조회 | Table Token |

### 관리자 API (Admin)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/admin/orders | 전체 주문 조회 | Admin JWT |
| PATCH | /api/admin/orders/{id}/status | 주문 상태 변경 | Admin JWT |
| DELETE | /api/admin/orders/{id} | 주문 삭제 | Admin JWT |
| GET | /api/admin/menus | 메뉴 목록 조회 | Admin JWT |
| POST | /api/admin/menus | 메뉴 등록 | Admin JWT |
| PUT | /api/admin/menus/{id} | 메뉴 수정 | Admin JWT |
| DELETE | /api/admin/menus/{id} | 메뉴 삭제 | Admin JWT |
| PATCH | /api/admin/menus/{id}/order | 메뉴 순서 변경 | Admin JWT |
| GET | /api/admin/tables | 테이블 목록 조회 | Admin JWT |
| POST | /api/admin/tables/setup | 테이블 설정 | Admin JWT |
| POST | /api/admin/tables/{id}/complete | 테이블 세션 완료 | Admin JWT |
| GET | /api/sse/orders | SSE 연결 | Admin JWT |

## 초기 데이터

`DataInitializer`가 애플리케이션 시작 시 기본 매장 데이터를 생성합니다:

- Store identifier: `store001`
- Admin username: `admin`
- Admin password: `admin1234`
