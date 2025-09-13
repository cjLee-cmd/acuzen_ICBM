# 한국 약물감시 시스템 성능 테스트 체크리스트

> **작성일**: 2025-09-14  
> **시스템**: 한국 약물감시 시스템 (Korean Drug Surveillance System)  
> **Tech Stack**: React 18 + TypeScript + Express.js + SQLite + OpenAI GPT-5

## 📋 테스트 개요

본 체크리스트는 약물감시 시스템의 전체적인 성능을 체계적으로 평가하기 위한 가이드입니다. ICSR(Individual Case Safety Report) 보고서 처리부터 AI 분석까지의 전 과정에서 성능 기준을 만족하는지 확인합니다.

---

## 🎯 성능 목표 기준

| 구분 | 목표 | 허용 범위 |
|------|------|-----------|
| 페이지 로드 시간 | < 2초 | < 3초 |
| API 응답 시간 | < 500ms | < 1초 |
| 데이터베이스 쿼리 | < 200ms | < 500ms |
| AI 분석 응답 | < 10초 | < 15초 |
| 동시 사용자 | 100명 | 200명 |
| 메모리 사용량 | < 512MB | < 1GB |

---

## 🌐 Frontend 성능 테스트

### 1. 페이지 로드 성능
- [ ] **대시보드 로드 시간** (/)
  - 목표: < 2초
  - 측정: Lighthouse, Network 탭
  - 포함 요소: 통계 차트, 최근 사례, 중요 사례
  
- [ ] **데이터 입력 페이지 로드** (/report)
  - 목표: < 1.5초
  - 7단계 ICSR 폼 초기화 시간 포함
  
- [ ] **사례 관리 페이지 로드** (/cases)
  - 목표: < 2초
  - 테이블 데이터 렌더링 포함
  
- [ ] **사용자 관리 페이지 로드** (/users)
  - 목표: < 1.5초 (Admin 전용)
  
- [ ] **감사 로그 페이지 로드** (/audit)
  - 목표: < 3초 (대량 로그 데이터)

### 2. 컴포넌트 렌더링 성능
- [ ] **ICSR 7단계 폼 렌더링**
  - 단계별 전환 시간: < 100ms
  - 폼 필드 입력 반응성: < 50ms
  - 유효성 검사 응답: < 200ms
  
- [ ] **테이블 컴포넌트 렌더링** (사례 목록)
  - 100개 행 렌더링: < 500ms
  - 정렬/필터링 응답: < 300ms
  - 페이지네이션 전환: < 200ms
  
- [ ] **차트 컴포넌트 렌더링** (대시보드)
  - 통계 차트 렌더링: < 1초
  - 데이터 업데이트 반영: < 500ms

### 3. 사용자 상호작용 응답성
- [ ] **버튼 클릭 응답**
  - 일반 버튼: < 50ms
  - 폼 제출: < 100ms
  - 사이드바 토글: < 100ms
  
- [ ] **검색 기능**
  - 실시간 검색 응답: < 300ms
  - 검색 결과 표시: < 500ms
  
- [ ] **모달/다이얼로그**
  - 모달 열기/닫기: < 200ms
  - 데이터 로드 포함 모달: < 1초

### 4. 네트워크 최적화
- [ ] **번들 크기 분석**
  - 초기 JS 번들: < 1MB
  - CSS 파일: < 200KB
  - 청크 분할 최적화 확인
  
- [ ] **리소스 캐싱**
  - 정적 자산 캐시 확인
  - API 응답 캐싱 전략
  - Service Worker 활용도

### 5. 메모리 및 CPU 사용량
- [ ] **메모리 사용량**
  - 초기 로드: < 100MB
  - 1시간 사용 후: < 200MB
  - 메모리 누수 확인
  
- [ ] **CPU 사용률**
  - 유휴 상태: < 5%
  - 일반 사용: < 30%
  - 폼 제출/차트 렌더링: < 70%

---

## ⚡ Backend API 성능 테스트

### 1. 인증 및 세션 관리
- [ ] **로그인 처리** (POST /api/auth/login)
  - 응답 시간: < 300ms
  - 세션 생성 시간 포함
  
- [ ] **세션 검증** (미들웨어)
  - 검증 시간: < 50ms per request
  - 세션 스토어 조회 성능

### 2. ICSR 보고서 처리
- [ ] **보고서 생성** (POST /api/reports)
  - 단일 보고서: < 500ms
  - 유효성 검사 포함 시간
  - 데이터베이스 삽입 성능
  
- [ ] **보고서 조회** (GET /api/reports)
  - 목록 조회 (50개): < 300ms
  - 필터링/정렬 포함: < 500ms
  
- [ ] **보고서 상세** (GET /api/reports/:id)
  - 단일 상세 조회: < 200ms
  - 관련 데이터 조인 포함

### 3. 사례 관리 API
- [ ] **사례 목록** (GET /api/cases)
  - 기본 목록 (20개): < 200ms
  - 페이지네이션 포함: < 300ms
  - 검색 필터 적용: < 500ms
  
- [ ] **사례 상세** (GET /api/cases/:id)
  - AI 분석 결과 포함: < 400ms
  - 관련 예측 데이터 조회 포함
  
- [ ] **사례 업데이트** (PUT /api/cases/:id)
  - 상태 변경: < 300ms
  - 감사 로그 생성 포함

### 4. AI 서비스 통합
- [ ] **AI 분석 요청** (POST /api/ai/analyze)
  - OpenAI GPT-5 호출: < 10초
  - 타임아웃 처리: 15초
  - 에러 복구 메커니즘
  
- [ ] **AI 예측 조회** (GET /api/predictions)
  - 예측 결과 목록: < 300ms
  - 신뢰도 점수 포함

### 5. 관리 기능 API
- [ ] **사용자 관리** (GET/POST/PUT /api/users)
  - 사용자 목록: < 200ms
  - 사용자 생성: < 400ms
  - 역할 권한 검증 포함
  
- [ ] **감사 로그** (GET /api/audit-logs)
  - 로그 목록 (100개): < 500ms
  - 날짜 범위 필터링: < 800ms
  
- [ ] **시스템 통계** (GET /api/dashboard/stats)
  - 실시간 통계: < 400ms
  - 복합 쿼리 최적화

### 6. 동시성 및 부하 테스트
- [ ] **동시 사용자 처리**
  - 10명 동시 접속: 정상 처리
  - 50명 동시 접속: 응답 시간 < 2x
  - 100명 동시 접속: 시스템 안정성
  
- [ ] **API 처리량 (throughput)**
  - GET 요청: > 1000 req/min
  - POST 요청: > 500 req/min
  - 복합 요청: > 200 req/min

---

## 🗄️ 데이터베이스 성능 테스트

### 1. 기본 CRUD 성능
- [ ] **INSERT 성능**
  - 단일 사례 삽입: < 50ms
  - 배치 삽입 (10개): < 200ms
  - 관련 테이블 동시 삽입: < 100ms
  
- [ ] **SELECT 성능**
  - 단일 레코드 조회: < 20ms
  - 복합 조건 검색: < 100ms
  - 조인 쿼리 (3 테이블): < 150ms
  
- [ ] **UPDATE 성능**
  - 단일 레코드 수정: < 30ms
  - 조건부 대량 수정: < 200ms
  - soft delete 처리: < 50ms
  
- [ ] **DELETE 성능**
  - 물리적 삭제: < 30ms
  - 논리적 삭제 (soft delete): < 50ms

### 2. 인덱스 최적화
- [ ] **기본 인덱스 성능**
  - Primary Key 조회: < 10ms
  - Foreign Key 조인: < 50ms
  - Unique 제약조건 확인: < 20ms
  
- [ ] **복합 인덱스 활용**
  - 날짜 범위 + 상태 검색: < 100ms
  - 약물명 + 심각도 검색: < 80ms
  - 사용자 + 권한 조회: < 50ms

### 3. 대용량 데이터 처리
- [ ] **데이터 볼륨별 성능**
  - 1,000건 데이터: 모든 쿼리 < 200ms
  - 10,000건 데이터: 조회 쿼리 < 500ms
  - 100,000건 데이터: 통계 쿼리 < 2초
  
- [ ] **페이지네이션 성능**
  - OFFSET/LIMIT 최적화
  - 커서 기반 페이지네이션 (필요시)

### 4. 트랜잭션 성능
- [ ] **단순 트랜잭션**
  - 보고서 생성 트랜잭션: < 100ms
  - 감사 로그 포함 트랜잭션: < 150ms
  
- [ ] **복합 트랜잭션**
  - 사용자 생성 + 권한 설정: < 200ms
  - 사례 업데이트 + AI 분석: < 500ms

### 5. 연결 및 풀링
- [ ] **데이터베이스 연결**
  - 연결 설정 시간: < 100ms
  - 연결 풀 효율성 확인
  - 연결 누수 모니터링
  
- [ ] **쿼리 캐싱**
  - 반복 쿼리 캐시 히트율: > 80%
  - 캐시 무효화 정책 검증

---

## 🔧 시스템 통합 성능 테스트

### 1. 전체 사용자 플로우 성능
- [ ] **ICSR 보고서 전체 플로우**
  - 폼 작성 → 제출 → AI 분석 → 결과 표시
  - 전체 플로우 시간: < 20초
  - 중간 단계별 응답성 확인
  
- [ ] **사례 검토 플로우**
  - 사례 검색 → 상세 조회 → 상태 변경 → 로그 확인
  - 전체 플로우 시간: < 10초
  
- [ ] **관리자 작업 플로우**
  - 사용자 생성 → 권한 설정 → 감사 로그 확인
  - 전체 플로우 시간: < 15초

### 2. 시스템 리소스 모니터링
- [ ] **CPU 사용률**
  - 평균 사용률: < 50%
  - 피크 사용률: < 80%
  - CPU 스파이크 패턴 분석
  
- [ ] **메모리 사용량**
  - 서버 메모리: < 512MB
  - 프론트엔드 메모리: < 200MB
  - 메모리 누수 감지
  
- [ ] **디스크 I/O**
  - 데이터베이스 I/O: 모니터링
  - 로그 파일 I/O: 최적화
  - 임시 파일 정리

### 3. 네트워크 성능
- [ ] **대역폭 사용량**
  - API 응답 크기 최적화
  - 이미지/정적 자산 압축
  - CDN 활용 가능성
  
- [ ] **연결 관리**
  - Keep-alive 설정 최적화
  - 동시 연결 수 제한
  - 타임아웃 설정 적절성

### 4. 확장성 테스트
- [ ] **수직 확장 (Scale-up)**
  - CPU/메모리 증가 시 성능 향상 확인
  - 병목 지점 식별
  
- [ ] **수평 확장 (Scale-out)**
  - 로드 밸런싱 시나리오 (필요시)
  - 데이터베이스 분산 전략

---

## 📊 성능 측정 도구 및 방법

### 1. Frontend 성능 측정
```bash
# Lighthouse 성능 측정
npx lighthouse http://localhost:3000 --output=html --output-path=./reports/lighthouse-report.html

# 번들 분석
npx vite-bundle-analyzer

# 개발자 도구 활용
# - Performance 탭으로 렌더링 성능 측정
# - Network 탭으로 네트워크 성능 측정
# - Memory 탭으로 메모리 사용량 모니터링
```

### 2. Backend API 성능 측정
```bash
# API 부하 테스트 (Artillery)
npm install -g artillery
artillery quick --count 10 --num 100 http://localhost:3000/api/dashboard/stats

# 단일 API 성능 측정 (curl + time)
time curl -X GET http://localhost:3000/api/cases

# Node.js 프로파일링
node --prof server/index.js
```

### 3. 데이터베이스 성능 측정
```sql
-- SQLite 쿼리 성능 분석
.timer on
EXPLAIN QUERY PLAN SELECT * FROM cases WHERE severity = 'High';

-- 인덱스 사용률 확인
.schema cases
.indices cases
```

### 4. Playwright를 활용한 E2E 성능 테스트
```typescript
// tests/performance.spec.ts 예시
import { test, expect } from '@playwright/test';

test('페이지 로드 성능 측정', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000); // 2초 이내
  console.log(`Dashboard load time: ${loadTime}ms`);
});
```

### 5. 자동화된 성능 모니터링
```bash
# package.json에 성능 테스트 스크립트 추가
{
  "scripts": {
    "perf:frontend": "lighthouse http://localhost:3000 --output=json --output-path=./reports/perf-frontend.json",
    "perf:api": "artillery run tests/artillery-config.yml",
    "perf:e2e": "playwright test tests/performance.spec.ts",
    "perf:full": "npm run perf:frontend && npm run perf:api && npm run perf:e2e"
  }
}
```

---

## ✅ 성능 테스트 실행 체크리스트

### 테스트 준비
- [ ] 테스트 환경 설정 (로컬/스테이징)
- [ ] 테스트 데이터 준비 (다양한 케이스)
- [ ] 성능 측정 도구 설치 및 설정
- [ ] 베이스라인 성능 측정

### 테스트 실행
- [ ] Frontend 성능 테스트 실행
- [ ] Backend API 성능 테스트 실행
- [ ] 데이터베이스 성능 테스트 실행
- [ ] 시스템 통합 성능 테스트 실행

### 결과 분석
- [ ] 성능 측정 결과 수집
- [ ] 목표 대비 성능 평가
- [ ] 병목 지점 식별
- [ ] 개선 권장사항 도출

### 최적화 및 재테스트
- [ ] 식별된 병목 지점 최적화
- [ ] 최적화 후 재테스트 실행
- [ ] 성능 개선 효과 검증
- [ ] 성능 모니터링 지속 계획 수립

---

## 📈 성능 모니터링 및 알람

### 1. 실시간 모니터링 지표
- 응답 시간 추이
- 에러율 모니터링  
- 리소스 사용률 (CPU, 메모리, 디스크)
- 동시 접속자 수

### 2. 알람 임계값 설정
- API 응답 시간 > 1초
- 에러율 > 5%
- 메모리 사용률 > 80%
- 디스크 사용률 > 85%

### 3. 성능 트렌드 분석
- 일일/주간/월간 성능 리포트
- 사용량 증가에 따른 성능 영향 분석
- 계절성/시간대별 성능 패턴 파악

---

**📝 체크리스트 완료 시 다음 단계:**
1. 성능 테스트 결과 문서화
2. 병목 지점 개선 계획 수립
3. 지속적인 성능 모니터링 체계 구축
4. 정기적 성능 리뷰 일정 계획