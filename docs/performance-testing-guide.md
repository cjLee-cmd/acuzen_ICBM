# 성능 테스트 실행 가이드

한국 약물감시 시스템의 성능 테스트를 실행하는 방법을 안내합니다.

## 🚀 빠른 시작

### 1. 사전 준비
```bash
# 필수 도구 설치
npm install -g lighthouse artillery

# 프로젝트 의존성 설치
npm install

# 개발 서버 실행 (별도 터미널)
npm run dev
```

### 2. 성능 테스트 실행

#### 전체 성능 테스트 실행
```bash
npm run perf:full
```

#### 개별 테스트 실행
```bash
# Playwright 기반 E2E 성능 테스트
npm run test:perf

# Artillery 기반 API 부하 테스트  
npm run test:load

# 빠른 API 부하 테스트
npm run test:load:quick

# Lighthouse 성능 분석
npm run perf:lighthouse

# 번들 크기 분석 (빌드 후)
npm run build
npm run perf:bundle
```

## 📊 테스트 결과 확인

### 1. 보고서 위치
```
reports/
├── lighthouse-report.html    # Lighthouse 성능 보고서
├── performance-test.html     # Playwright 테스트 결과
└── artillery-report.json     # Artillery 부하 테스트 결과
```

### 2. 주요 성능 지표

| 측정 항목 | 목표값 | 허용값 |
|-----------|--------|--------|
| 페이지 로드 시간 | < 2초 | < 3초 |
| API 응답 시간 | < 500ms | < 1초 |
| LCP (최대 콘텐츠풀 페인트) | < 2.5초 | < 4초 |
| CLS (누적 레이아웃 변경) | < 0.1 | < 0.25 |
| JavaScript 번들 크기 | < 1MB | < 2MB |
| 동시 사용자 (100명) | 정상 처리 | 응답시간 2배 이내 |

## 🔧 테스트 커스터마이징

### 1. Playwright 성능 테스트 설정
`tests/performance.spec.ts` 파일에서 다음 항목들을 수정할 수 있습니다:
- 성능 목표값 변경
- 테스트 시나리오 추가/수정
- 동시 사용자 수 조정

### 2. Artillery 부하 테스트 설정
`tests/artillery-config.yml` 파일에서 다음 항목들을 수정할 수 있습니다:
- 부하 테스트 단계별 사용자 수
- 테스트 지속 시간
- API 엔드포인트 및 테스트 시나리오

### 3. Lighthouse 설정
```bash
# 다른 페이지 테스트
lighthouse http://localhost:3000/cases --output=html --output-path=./reports/cases-page-report.html

# 모바일 성능 테스트
lighthouse http://localhost:3000 --emulated-form-factor=mobile --output=html
```

## 📈 성능 최적화 가이드

### 1. Frontend 최적화
- **코드 분할**: React.lazy()를 활용한 컴포넌트 지연 로딩
- **이미지 최적화**: WebP 형식 사용, 적절한 크기 조정
- **번들 최적화**: 불필요한 의존성 제거, Tree-shaking 활용
- **캐싱 전략**: Service Worker, Cache-Control 헤더 설정

### 2. Backend 최적화
- **데이터베이스 최적화**: 인덱스 생성, 쿼리 최적화
- **API 캐싱**: Redis 등을 활용한 응답 캐싱
- **압축**: gzip/brotli 압축 활성화
- **연결 풀링**: 데이터베이스 연결 풀 최적화

### 3. 모니터링 설정
- **APM 도구**: New Relic, DataDog 등 성능 모니터링 도구 연동
- **실시간 알람**: 임계값 초과 시 알람 설정
- **정기적 테스트**: CI/CD 파이프라인에 성능 테스트 통합

## 🚨 문제 해결

### 1. 일반적인 문제들

#### "lighthouse: command not found"
```bash
npm install -g lighthouse
```

#### "artillery: command not found"  
```bash
npm install -g artillery
```

#### 테스트 실패 시 확인사항
1. 서버가 실행 중인지 확인 (`npm run dev`)
2. 포트 충돌 확인 (기본 포트: 3000)
3. 데이터베이스 연결 상태 확인

### 2. 성능 기준 미달성 시 대응

#### API 응답 시간이 목표를 초과하는 경우
1. 데이터베이스 쿼리 최적화
2. 인덱스 추가 또는 수정
3. API 캐싱 구현
4. 데이터베이스 연결 풀 설정 검토

#### 페이지 로드 시간이 목표를 초과하는 경우
1. JavaScript/CSS 번들 크기 확인
2. 이미지 최적화 및 압축
3. 코드 분할 적용
4. CDN 활용 검토

#### 메모리 사용량이 과도한 경우
1. 메모리 누수 확인
2. 불필요한 객체 참조 제거
3. 가비지 컬렉션 최적화
4. 캐시 크기 조정

## 📋 정기적 성능 검토

### 월간 성능 리뷰
- [ ] 전체 성능 테스트 실행
- [ ] 성능 트렌드 분석
- [ ] 병목 지점 식별 및 개선 계획 수립
- [ ] 사용자 피드백 수집 및 분석

### 배포 전 성능 체크
- [ ] 모든 성능 테스트 통과 확인
- [ ] 새로운 기능의 성능 영향 분석
- [ ] 데이터베이스 마이그레이션 성능 테스트
- [ ] 모니터링 알람 임계값 검토

## 📞 지원 및 문의

성능 테스트 관련 문의나 문제가 있는 경우:
1. GitHub Issues에 문제 등록
2. 성능 테스트 결과 공유 (민감 정보 제외)
3. 환경 정보 포함 (OS, Node.js 버전 등)

---

**참고**: 이 가이드는 한국 약물감시 시스템에 특화되어 있습니다. 다른 프로젝트에 적용 시 적절한 수정이 필요할 수 있습니다.