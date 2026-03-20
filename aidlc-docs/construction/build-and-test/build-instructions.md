# Build Instructions

> Docker 없이 Windows 로컬 환경에서 실행하는 방법입니다.
> DB는 SQLite를 사용하므로 별도 DB 서버 설치가 필요 없습니다.

---

## 1. 사전 요구사항 설치

### Java 17 (Backend)

1. https://adoptium.net 접속
2. "Temurin 17 (LTS)" 다운로드 → `.msi` 설치
3. 설치 시 "Set JAVA_HOME" 옵션 체크
4. 확인:
   ```powershell
   java -version
   # openjdk version "17.x.x"
   ```

### Node.js 18+ (Frontend)

1. https://nodejs.org 접속
2. "LTS" 버전 다운로드 → `.msi` 설치
3. 확인:
   ```powershell
   node --version
   # v18.x.x 이상
   ```

> SQLite는 별도 설치 불필요 - Gradle 의존성으로 자동 포함됩니다.

---

## 2. Backend 실행

SQLite DB 파일은 `backend/` 디렉토리에 `tableorder.db`로 자동 생성됩니다.

### 빌드 및 실행

```powershell
cd backend

# 빌드 (테스트 제외)
./gradlew clean build -x test

# 실행
./gradlew bootRun
```

또는 jar 직접 실행:

```powershell
./gradlew clean build -x test
java -jar build/libs/tableorder-backend-0.0.1-SNAPSHOT.jar
```

성공 시 출력:
```
Started TableOrderApplication in X.XXX seconds
```

접속 확인:
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

> 첫 실행 시 `DataInitializer`가 자동으로 기본 매장 데이터를 생성합니다.
> - Store identifier: `store001` / Admin: `admin` / Password: `admin1234`

---

## 3. Frontend 실행

새 PowerShell 창에서:

```powershell
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

성공 시 출력:
```
VITE v5.x.x  ready in XXX ms
Local:   http://localhost:5173/
```

접속: http://localhost:5173

> Backend가 `localhost:8080`에서 실행 중이어야 합니다.

---

## 4. 실행 순서 요약

```
1. PowerShell 창 1: cd backend && ./gradlew bootRun
2. PowerShell 창 2: cd frontend && npm install && npm run dev
3. 브라우저: http://localhost:5173
```

---

## 5. SQLite DB 관리

### DB 파일 위치

```
backend/tableorder.db
```

### DB 초기화 (데이터 리셋)

```powershell
# Backend 종료 후
Remove-Item backend/tableorder.db
# 다시 실행하면 DataInitializer가 초기 데이터 재생성
```

### DB 내용 확인 (선택사항)

SQLite 브라우저 도구: https://sqlitebrowser.org (DB Browser for SQLite)

---

## 6. 빌드 문제 해결

### Gradle Wrapper 실행 오류

```powershell
# PowerShell 실행 정책 문제 시
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 또는 gradlew.bat 사용
.\gradlew.bat bootRun
```

### 포트 충돌 (8080)

```powershell
# 8080 포트 사용 프로세스 확인
netstat -ano | findstr :8080

# PID로 프로세스 종료
taskkill /PID {PID} /F
```

### Frontend - CORS 오류

`frontend/.env.local` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### SQLite - DB 잠금 오류

SQLite는 단일 프로세스만 쓰기 가능합니다. Backend 인스턴스가 하나만 실행 중인지 확인하세요.
