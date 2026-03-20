# Frontend Infrastructure Design Plan

## 실행 단계

- [x] Step 1: 설계 산출물 분석
- [x] Step 2: 인프라 설계 질문 수집
- [x] Step 3: 인프라 설계 산출물 생성
  - [x] infrastructure-design.md
  - [x] deployment-architecture.md

---

## 인프라 설계 질문

Frontend 배포 환경을 결정하기 위한 질문입니다.

---

### Q1. 배포 환경

Frontend 앱을 어떻게 서빙할 예정인가요?

A) Docker 컨테이너 (Nginx) - docker-compose에 포함  
B) Vite dev server - 개발 환경 전용, 프로덕션은 Nginx  
C) 정적 파일 호스팅 (S3, Netlify 등)  
D) 기타

[Answer]: B

---

### Q2. Nginx 리버스 프록시

Nginx를 사용할 경우, API 요청을 어떻게 처리할까요?

A) Nginx가 `/api/*` 요청을 backend 컨테이너로 프록시 (CORS 불필요)  
B) Frontend에서 직접 backend URL로 요청 (CORS 설정 필요)

[Answer]: B

---

### Q3. 개발 환경 포트 구성

로컬 개발 시 포트 구성을 확인합니다.

A) Frontend: 3000, Backend: 8080, MySQL: 3306 (기본값)  
B) 다른 포트 구성 사용

[Answer]: A

---

### Q4. 환경 분리

개발/프로덕션 환경 분리 방식은?

A) `.env.development` / `.env.production` 파일로 분리 (이미 결정됨)  
B) 추가적인 환경 분리 필요 (staging 등)

[Answer]: A

---

### Q5. HTTPS / SSL

프로덕션 환경에서 HTTPS 적용 계획이 있나요?

A) 지금은 HTTP만 (로컬/개발 목적)  
B) Nginx에서 SSL 종료 (Let's Encrypt 등)  
C) 로드밸런서/CDN에서 SSL 종료

[Answer]: A
