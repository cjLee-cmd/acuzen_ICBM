import { test, expect } from '@playwright/test';

test('홈 대시보드 로드 및 타이틀 확인', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/Drug Surveillance System/i);
  await expect(page.getByText('약물감시 시스템 관리자')).toBeVisible();
  await page.screenshot({ path: 'test-results/home.png', fullPage: true });
});

test('사이드바 토글 버튼 존재', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('button-sidebar-toggle')).toBeVisible();
});
