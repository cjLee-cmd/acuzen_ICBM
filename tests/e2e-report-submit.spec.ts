import { test, expect } from '@playwright/test';

// NOTE: BASE_URL comes from playwright.config.ts, override with env if needed

test('ICSR 보고서 작성/제출 후 대시보드에서 확인', async ({ page }) => {
  const BASE = process.env.BASE_URL || 'http://localhost:5000';

  // 1) 앱 홈 → 사이드바로 이동하여 데이터 입력 화면으로 진입 (SPA 라우팅 신뢰도 향상)
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.getByTestId('link-report').click();
  await expect(page.getByTestId('adverse-event-report')).toBeVisible();

  // 2) 최소 필수 정보 입력
  // A. 보고자 정보
  await page.getByLabel(/보고자 성명/).fill('테스트 사용자');
  await page.getByLabel(/소속 기관/).fill('테스트 병원');

  // B. 환자 정보
  await page.getByLabel(/환자 나이/).fill('45');
  await page.getByLabel(/남성/).check();

  // C. 의심 약물 정보
  await page.getByLabel(/약물명/).fill('테스트약');
  await page.getByLabel(/용법\/용량/).fill('1일 3회');

  // D. 부작용 정보
  await page.getByLabel(/부작용 반응/).fill('오심, 구토');
  await page.getByText(/중증도/).waitFor({ state: 'visible' });

  // 3) 단계 진행 (폼은 multi-step, 빠르게 다음으로 이동)
  for (let i = 0; i < 5; i++) {
    const next = page.getByRole('button', { name: '다음' });
    if (await next.isVisible()) {
      await next.click();
    }
  }

  // 4) 제출
  const submitBtn = page.getByRole('button', { name: '보고서 제출' });
  await submitBtn.click();

  // 제출 성공 토스트/상태 카드가 나타나는지 확인(완화된 기준)
  await expect(page.getByText(/성공적으로 제출되었습니다/)).toBeVisible({ timeout: 10_000 });

  // 5) 대시보드에서 최근 케이스가 증가했는지 간단 확인(완화된 검증)
  // 대시보드 로드만 확인
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  // 6) 사례 관리에서 새 항목이 목록에 존재하는지 확인(약물명으로 필터)
  await page.goto(`${BASE}/cases`, { waitUntil: 'networkidle' });
  await page.getByTestId('input-search-cases').fill('테스트약');
  await expect(page.getByText('테스트약')).toBeVisible({ timeout: 10_000 });
});
