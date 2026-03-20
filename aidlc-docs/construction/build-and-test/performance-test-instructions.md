# Performance Test Instructions

## 성능 요구사항 (NFR 기준)

| 항목 | 목표 |
|------|------|
| API 응답 시간 | 95th percentile < 500ms |
| 주문 생성 처리량 | 50 req/s 이상 |
| SSE 동시 연결 | 매장당 10개 이상 |
| 에러율 | < 1% |

---

## 도구 선택

### 옵션 A: k6 (권장 - 경량, JavaScript 기반)

```bash
# 설치
# Windows: choco install k6
# Mac: brew install k6
# Linux: https://k6.io/docs/get-started/installation/
```

### 옵션 B: Apache JMeter (GUI 지원)

```bash
# https://jmeter.apache.org/download_jmeter.cgi 에서 다운로드
```

---

## k6 부하 테스트 스크립트

### 1. 로그인 + 주문 생성 시나리오

`performance-tests/order-load-test.js` 파일 생성:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // 워밍업
    { duration: '1m',  target: 50 },  // 목표 부하
    { duration: '30s', target: 0 },   // 쿨다운
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],    // 에러율 < 1%
  },
};

const BASE_URL = 'http://localhost:8080';

export function setup() {
  // 관리자 로그인으로 token 획득
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    storeIdentifier: 'store001',
    username: 'admin',
    password: 'admin1234',
  }), { headers: { 'Content-Type': 'application/json' } });

  return { adminToken: loginRes.json('token') };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.adminToken}`,
  };

  // 메뉴 조회
  const menuRes = http.get(`${BASE_URL}/api/admin/menus`, { headers });
  check(menuRes, { 'menus status 200': (r) => r.status === 200 });

  // 주문 목록 조회
  const ordersRes = http.get(`${BASE_URL}/api/admin/orders`, { headers });
  check(ordersRes, { 'orders status 200': (r) => r.status === 200 });

  sleep(1);
}
```

### 2. 테스트 실행

```bash
# 전체 스택이 실행 중인 상태에서
k6 run performance-tests/order-load-test.js
```

### 3. 결과 예시

```
scenarios: (100.00%) 1 scenario, 50 max VUs
default: Up to 50 looping VUs for 2m0s

http_req_duration............: avg=120ms  p(95)=380ms
http_req_failed..............: 0.00%
http_reqs....................: 2450   (20.4/s)
```

---

## SSE 동시 연결 테스트

```bash
# 10개 SSE 연결 동시 생성 (bash)
for i in {1..10}; do
  curl -N http://localhost:8080/api/sse/orders \
    -H "Authorization: Bearer {admin_token}" &
done

# 연결 수 확인
docker-compose exec backend sh -c "ss -tn | grep 8080 | wc -l"
```

---

## 성능 최적화 포인트

성능 목표 미달 시 확인 항목:

| 증상 | 원인 | 해결 방법 |
|------|------|---------|
| DB 쿼리 느림 | N+1 문제 | `@EntityGraph` 또는 fetch join 적용 |
| 응답 시간 증가 | Connection Pool 부족 | `spring.datasource.hikari.maximum-pool-size` 증가 |
| SSE 연결 끊김 | Timeout 설정 | `SseEmitter` timeout 값 조정 |
| 메모리 증가 | SSE Emitter 누수 | `onCompletion`, `onTimeout` 핸들러 확인 |

---

## 결과 분석

테스트 완료 후 확인 항목:

```bash
# Backend 로그에서 느린 쿼리 확인
docker-compose logs backend | grep "Hibernate:"

# MySQL slow query 확인
docker-compose exec mysql mysql -u tableorder -ptableorder \
  -e "SHOW VARIABLES LIKE 'slow_query_log';"
```
