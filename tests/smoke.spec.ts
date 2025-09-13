import { test, expect } from '@playwright/test';

// 기본 홈페이지 및 네비게이션 테스트
test.describe('홈페이지 및 기본 네비게이션', () => {
  test('홈 대시보드 로드 및 타이틀 확인', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Drug Surveillance System/i);
    await expect(page.getByText('약물감시 시스템 관리자')).toBeVisible();
    await page.screenshot({ path: 'test-results/home.png', fullPage: true });
  });

  test('사이드바 네비게이션 메뉴 존재', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('대시보드')).toBeVisible();
    await expect(page.getByText('사례 관리')).toBeVisible();
    await expect(page.getByText('AI 모델 관리')).toBeVisible();
    await expect(page.getByText('사용자 관리')).toBeVisible();
    await expect(page.getByText('감사 로그')).toBeVisible();
    await expect(page.getByText('시스템 모니터링')).toBeVisible();
    await expect(page.getByText('설정')).toBeVisible();
  });

  test('사이드바 토글 버튼 동작', async ({ page }) => {
    await page.goto('/');
    const toggleButton = page.getByRole('button', { name: 'Toggle Sidebar' });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
  });

  test('테마 토글 버튼 존재', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await expect(themeToggle).toBeVisible();
  });

  test('빠른 상태 위젯 표시', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('빠른 상태')).toBeVisible();
    await expect(page.getByText('시스템 상태')).toBeVisible();
    await expect(page.getByText('정상')).toBeVisible();
    await expect(page.getByText('대기 중인 사례')).toBeVisible();
    await expect(page.getByText('AI 신뢰도')).toBeVisible();
  });
});

// 사례 관리 페이지 테스트
test.describe('사례 관리 기능', () => {
  test('사례 관리 페이지 이동 및 로드', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '사례 관리' }).click();
    await expect(page).toHaveURL('/cases');
    await expect(page.getByRole('heading', { name: '사례 관리' })).toBeVisible();
    await expect(page.getByText('부작용 사례 관리 및 처리')).toBeVisible();
    await page.screenshot({ path: 'test-results/cases-page.png', fullPage: true });
  });

  test('새 사례 등록 버튼 존재', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByRole('button', { name: '새 사례 등록' })).toBeVisible();
  });

  test('사례 검색 기능', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByText('사례 검색')).toBeVisible();
    await expect(page.getByPlaceholder('약물명, 반응, 사례 ID로 검색...')).toBeVisible();
  });

  test('사례 목록 표시', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByText('CSE-2024-001')).toBeVisible();
    await expect(page.getByText('CSE-2024-002')).toBeVisible();
    await expect(page.getByText('Aspirin 100mg')).toBeVisible();
    await expect(page.getByText('Gastrointestinal bleeding')).toBeVisible();
  });

  test('심각도 표시', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByText('High')).toBeVisible();
    await expect(page.getByText('Medium')).toBeVisible();
  });

  test('AI 분석 결과 표시', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByText('AI 분석 결과')).toBeVisible();
    await expect(page.getByText('신뢰도: 92%')).toBeVisible();
    await expect(page.getByText('신뢰도: 87%')).toBeVisible();
  });

  test('사례 상세보기 및 처리 버튼', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByRole('button', { name: '상세보기' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '처리' }).first()).toBeVisible();
  });

  test('상태 필터 기능', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByText('모든 상태')).toBeVisible();
  });
});

// 사용자 관리 페이지 테스트
test.describe('사용자 관리 기능', () => {
  test('사용자 관리 페이지 이동 및 로드', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '사용자 관리' }).click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: '사용자 관리' })).toBeVisible();
    await expect(page.getByText('시스템 사용자 계정 관리')).toBeVisible();
    await page.screenshot({ path: 'test-results/users-page.png', fullPage: true });
  });

  test('새 사용자 추가 버튼 존재', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('button', { name: '새 사용자 추가' })).toBeVisible();
  });

  test('사용자 검색 기능', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('사용자 검색')).toBeVisible();
    await expect(page.getByPlaceholder('이름, 이메일, 조직으로 검색...')).toBeVisible();
  });

  test('역할 필터 기능', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('모든 역할')).toBeVisible();
  });

  test('사용자 목록 표시', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('관리자')).toBeVisible();
    await expect(page.getByText('김검토')).toBeVisible();
    await expect(page.getByText('이사용')).toBeVisible();
  });

  test('사용자 역할 표시', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('ADMIN')).toBeVisible();
    await expect(page.getByText('REVIEWER')).toBeVisible();
    await expect(page.getByText('USER')).toBeVisible();
  });

  test('사용자 상태 표시', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('활성')).toBeVisible();
    await expect(page.getByText('비활성')).toBeVisible();
  });

  test('이메일 주소 표시', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('admin@pharma.com')).toBeVisible();
    await expect(page.getByText('reviewer@pharma.com')).toBeVisible();
    await expect(page.getByText('user@pharma.com')).toBeVisible();
  });

  test('부서 정보 표시', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('시스템 관리부')).toBeVisible();
    await expect(page.getByText('약물안전부')).toBeVisible();
    await expect(page.getByText('임상연구부')).toBeVisible();
  });

  test('마지막 로그인 정보 표시', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('마지막 로그인')).toBeVisible();
    await expect(page.getByText('2024-01-15 10:30')).toBeVisible();
    await expect(page.getByText('2024-01-15 09:15')).toBeVisible();
    await expect(page.getByText('2024-01-10 14:22')).toBeVisible();
  });
});

// 네비게이션 테스트
test.describe('페이지 간 네비게이션', () => {
  test('모든 주요 페이지 네비게이션', async ({ page }) => {
    await page.goto('/');
    
    // 대시보드
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
    
    // 사례 관리
    await page.getByRole('link', { name: '사례 관리' }).click();
    await expect(page).toHaveURL('/cases');
    await expect(page.getByRole('heading', { name: '사례 관리' })).toBeVisible();
    
    // 사용자 관리
    await page.getByRole('link', { name: '사용자 관리' }).click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: '사용자 관리' })).toBeVisible();
    
    // 대시보드로 돌아가기
    await page.getByRole('link', { name: '대시보드' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
  });

  test('활성 네비게이션 표시', async ({ page }) => {
    await page.goto('/cases');
    const activeCasesLink = page.getByRole('link', { name: '사례 관리' });
    await expect(activeCasesLink).toHaveAttribute('class', /active/);
  });
});

// 반응형 및 접근성 테스트
test.describe('반응형 디자인 및 접근성', () => {
  test('모바일 뷰포트에서 사이드바 토글', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const toggleButton = page.getByRole('button', { name: 'Toggle Sidebar' });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
  });

  test('키보드 네비게이션 지원', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  });
});

// 오류 처리 테스트
test.describe('오류 처리 및 예외 상황', () => {
  test('존재하지 않는 페이지 처리', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // 404 페이지나 홈으로 리다이렉트 확인
  });
});

// 성능 테스트
test.describe('성능 및 로딩', () => {
  test('페이지 로딩 시간', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5초 이내 로딩
  });

  test('리소스 로딩 확인', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('Drug Surveillance System');
  });
});
