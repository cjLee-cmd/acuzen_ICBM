# Playwright 사용 가이드

## 개요
이 프로젝트는 Playwright를 사용하여 약물감시 시스템의 E2E 테스트와 자동화된 스크린샷 캡처를 지원합니다.

## 설치 및 설정

### 1. Playwright 설치
```bash
npm run playwright:install
```

### 2. 의존성 설치
```bash
npm install
```

## 사용법

### 개발 서버 실행
먼저 개발 서버를 실행해야 합니다:
```bash
npm run dev
```

### Playwright 테스트 실행
```bash
# 헤드리스 모드로 테스트 실행
npm test

# 브라우저를 띄워서 테스트 실행 (시각적 확인)
npm run test:headed

# Playwright UI 모드로 테스트 실행
npm run test:ui

# 테스트 리포트 보기
npm run test:report
```

### 데모 스크립트 실행
자동화된 스크린샷 캡처와 함께 전체 시스템 데모를 실행:
```bash
npm run playwright:demo
```

이 명령어는:
- 브라우저를 시각적으로 띄워서 실행
- 모든 주요 페이지를 자동으로 탐색
- 각 페이지의 스크린샷을 캡처
- `playwright-screenshots/` 디렉토리에 결과 저장

## 테스트 구조

### 테스트 파일
- `tests/smoke.spec.ts` - 주요 스모크 테스트 (50개 시나리오)

### 테스트 카테고리
1. **홈페이지 및 기본 네비게이션** (6개 테스트)
   - 홈 대시보드 로드 및 타이틀 확인
   - 사이드바 네비게이션 메뉴 존재
   - 사이드바 토글 버튼 동작
   - 테마 토글 버튼 존재
   - 빠른 상태 위젯 표시

2. **사례 관리 기능** (9개 테스트)
   - 사례 관리 페이지 이동 및 로드
   - 새 사례 등록 버튼 존재
   - 사례 검색 기능
   - 사례 목록 표시
   - 심각도 표시
   - AI 분석 결과 표시
   - 사례 상세보기 및 처리 버튼
   - 상태 필터 기능

3. **사용자 관리 기능** (12개 테스트)
   - 사용자 관리 페이지 이동 및 로드
   - 새 사용자 추가 버튼 존재
   - 사용자 검색 기능
   - 역할 필터 기능
   - 사용자 목록 표시
   - 사용자 역할 표시
   - 사용자 상태 표시
   - 이메일 주소 표시
   - 부서 정보 표시
   - 마지막 로그인 정보 표시

4. **페이지 간 네비게이션** (2개 테스트)
   - 모든 주요 페이지 네비게이션
   - 활성 네비게이션 표시

5. **반응형 디자인 및 접근성** (2개 테스트)
   - 모바일 뷰포트에서 사이드바 토글
   - 키보드 네비게이션 지원

6. **오류 처리 및 예외 상황** (1개 테스트)
   - 존재하지 않는 페이지 처리

7. **성능 및 로딩** (2개 테스트)
   - 페이지 로딩 시간
   - 리소스 로딩 확인

## 설정 파일

### playwright.config.ts
- 테스트 설정 및 웹 서버 자동 시작 구성
- 포트: 5000 (애플리케이션 기본 포트와 일치)
- 스크린샷 및 비디오 캡처 설정

### 출력 디렉토리
- `test-results/` - Playwright 테스트 결과
- `playwright-screenshots/` - 데모 스크립트 스크린샷
- `playwright-report/` - HTML 테스트 리포트

## GitHub Pages 배포

GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다:
- 트리거: `main` 브랜치 push
- 빌드: Vite 클라이언트 빌드
- 배포: GitHub Pages에 정적 파일 배포

### 설정 파일
- `.github/workflows/pages.yml` - GitHub Actions 워크플로
- `vite.config.ts` - GitHub Pages 배포용 base path 설정

## 스크린샷 예시

데모 스크립트 실행 시 다음과 같은 스크린샷들이 생성됩니다:
1. `01-dashboard.png` - 홈 대시보드
2. `02-cases-management.png` - 사례 관리 페이지
3. `03-ai-models.png` - AI 모델 관리 페이지
4. `04-user-management.png` - 사용자 관리 페이지
5. `05-audit-logs.png` - 감사 로그 페이지
6. `06-system-monitoring.png` - 시스템 모니터링 페이지
7. `07-settings.png` - 설정 페이지
8. `08-sidebar-collapsed.png` - 사이드바 축소 상태
9. `09-dark-theme.png` - 다크 테마 모드
10. `10-dashboard-final.png` - 최종 대시보드 상태

## 문제 해결

### Playwright 브라우저 설치 실패
```bash
# 브라우저 수동 설치
npx playwright install chromium
```

### 포트 충돌
기본적으로 포트 5000을 사용합니다. 다른 포트를 사용하려면:
```bash
BASE_URL=http://localhost:3000 npm test
```

### 스크린샷이 저장되지 않는 경우
`test-results/` 및 `playwright-screenshots/` 디렉토리가 자동으로 생성되지만, 권한 문제가 있을 수 있습니다:
```bash
mkdir -p test-results playwright-screenshots
chmod 755 test-results playwright-screenshots
```