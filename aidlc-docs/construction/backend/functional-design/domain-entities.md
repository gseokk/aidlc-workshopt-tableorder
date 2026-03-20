# Domain Entities - Backend

## 엔티티 관계 개요

```
Store (1) ──< Table (N)
Table (1) ──< TableSession (N)
TableSession (1) ──< Order (N)
Order (1) ──< OrderItem (N)
OrderItem (N) >── Menu (1)
Menu (N) >── MenuCategory (1)
Store (1) ──< MenuCategory (N)
Store (1) ──< Menu (N)
```

---

## 엔티티 상세 정의

### Store (매장)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 매장 ID |
| storeIdentifier | String | UNIQUE, NOT NULL | 매장 식별자 (로그인용, 예: "store001") |
| name | String | NOT NULL | 매장명 |
| adminUsername | String | NOT NULL | 관리자 계정명 |
| adminPassword | String | NOT NULL | 관리자 비밀번호 (bcrypt 해시) |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |

**초기화**: 애플리케이션 시작 시 `DataInitializer`로 단일 매장 데이터 삽입 (MVP)

---

### TableEntity (테이블)

> JPA 예약어 충돌 방지를 위해 클래스명 `TableEntity` 사용, DB 테이블명 `tables`

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 테이블 ID |
| store | Store | FK, NOT NULL | 소속 매장 |
| tableNumber | Integer | NOT NULL | 테이블 번호 |
| password | String | NOT NULL | 테이블 비밀번호 (평문 PIN) |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |

**유니크 제약**: `(store_id, tableNumber)` 복합 유니크

---

### TableSession (테이블 세션)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 세션 ID |
| table | TableEntity | FK, NOT NULL | 소속 테이블 |
| isActive | Boolean | NOT NULL, DEFAULT true | 활성 여부 |
| startedAt | LocalDateTime | NOT NULL | 세션 시작일시 |
| completedAt | LocalDateTime | NULL | 세션 완료일시 (null이면 진행 중) |

**활성 세션 조건**: `isActive = true`
**완료 처리**: `isActive = false`, `completedAt = now()`

---

### MenuCategory (메뉴 카테고리)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 카테고리 ID |
| store | Store | FK, NOT NULL | 소속 매장 |
| name | String | NOT NULL | 카테고리명 |
| displayOrder | Integer | NOT NULL, DEFAULT 0 | 표시 순서 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |

**유니크 제약**: `(store_id, name)` 복합 유니크
**자동 생성**: 메뉴 등록 시 동일 매장 내 카테고리명이 없으면 자동 생성, 있으면 재사용

---

### Menu (메뉴)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 메뉴 ID |
| store | Store | FK, NOT NULL | 소속 매장 |
| category | MenuCategory | FK, NOT NULL | 소속 카테고리 |
| name | String | NOT NULL | 메뉴명 |
| price | Integer | NOT NULL, >= 0 | 가격 (원) |
| description | String | NULL | 메뉴 설명 |
| imageUrl | String | NULL | 이미지 URL |
| displayOrder | Integer | NOT NULL, DEFAULT 0 | 표시 순서 |
| isDeleted | Boolean | NOT NULL, DEFAULT false | Soft Delete 플래그 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

**Soft Delete**: `isDeleted = true`로 숨김 처리, 기존 주문 데이터 보존
**조회 기본 조건**: `isDeleted = false`

---

### Order (주문)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 주문 ID |
| session | TableSession | FK, NOT NULL | 소속 세션 |
| status | OrderStatus | NOT NULL, DEFAULT PENDING | 주문 상태 |
| totalAmount | Integer | NOT NULL, >= 0 | 주문 총액 (원) |
| createdAt | LocalDateTime | NOT NULL | 주문일시 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

**OrderStatus Enum**:
```java
public enum OrderStatus {
    PENDING,    // 주문 접수 (신규)
    CONFIRMED,  // 주문 확인 (관리자 확인)
    COMPLETED   // 완료
}
```

---

### OrderItem (주문 항목)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, AUTO_INCREMENT | 주문 항목 ID |
| order | Order | FK, NOT NULL | 소속 주문 |
| menu | Menu | FK, NOT NULL | 주문 메뉴 (Soft Delete 메뉴도 참조 유지) |
| menuName | String | NOT NULL | 메뉴명 스냅샷 (삭제 후에도 이름 보존) |
| menuPrice | Integer | NOT NULL | 단가 스냅샷 |
| quantity | Integer | NOT NULL, >= 1 | 수량 |
| subtotal | Integer | NOT NULL | 소계 (menuPrice * quantity) |

**스냅샷 필드**: `menuName`, `menuPrice`는 주문 시점 값을 저장하여 메뉴 변경/삭제 후에도 주문 내역 보존

---

## JPA 공통 설정

### BaseEntity (공통 상속)
```java
@MappedSuperclass
public abstract class BaseEntity {
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate  
    private LocalDateTime updatedAt;
}
```

### 네이밍 전략
- DB 테이블명: snake_case (예: `menu_category`, `table_session`)
- JPA 엔티티명: PascalCase (예: `MenuCategory`, `TableSession`)
- `TableEntity` → DB 테이블명: `tables` (`@Table(name = "tables")`)
