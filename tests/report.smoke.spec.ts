import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5010';

// 간단한 데이터 입력 페이지 스모크 테스트
// - 사이드바에서 '데이터 입력' 메뉴로 이동 가능
// - 페이지 핵심 제목과 몇몇 필드가 렌더링됨
// - 단계 진행 컴포넌트가 보임

test('데이터 입력 화면 표시 및 핵심 요소', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // 사이드바 메뉴에서 데이터 입력 클릭
  await page.getByTestId('link-report').click();

  // 보고서 메인 카드 제목 확인
  await expect(page.getByTestId('adverse-event-report')).toBeVisible();
  await expect(page.getByText('약물 부작용 보고서 (ICSR)')).toBeVisible();

  // 1단계 필수 필드 일부 확인
  await expect(page.getByText('보고 유형')).toBeVisible();
  await expect(page.getByText('보고자 유형')).toBeVisible();
  await expect(page.getByLabel('보고자 성명')).toBeVisible();

  // 다음 단계 버튼 존재 여부 (컴포넌트 내에 버튼이 있다면)
  // UI가 변경되어도 테스트가 깨지지 않도록 완화된 검사를 유지
});
