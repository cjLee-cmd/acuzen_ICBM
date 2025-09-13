import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5010';

test('홈 대시보드 로드 및 타이틀 확인', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/Drug Surveillance System/i);
  await expect(page.getByText('약물감시 시스템 관리자')).toBeVisible();
});

test('사이드바 토글 버튼 존재', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByTestId('button-sidebar-toggle')).toBeVisible();
});
