import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

test.describe('약물 부작용 데이터 입력 클라이언트 E2E 테스트', () => {
  
  test('데이터 입력 페이지 접근 및 폼 존재 확인', async ({ page }) => {
    // 1. 홈페이지로 이동
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Drug Surveillance System/i);
    
    // 2. 사이드바에서 "데이터 입력" 메뉴 찾고 클릭
    await expect(page.getByText('데이터 입력')).toBeVisible();
    await page.getByText('데이터 입력').click();
    
    // 3. 데이터 입력 페이지로 이동했는지 확인
    await expect(page).toHaveURL(`${BASE_URL}/report`);
    
    // 4. ICSR 폼이 존재하는지 확인
    await expect(page.getByTestId('adverse-event-report')).toBeVisible();
    await expect(page.getByText('약물 부작용 보고서 (ICSR)')).toBeVisible();
    await expect(page.getByText('ICH E2B(R3) 표준에 따른 개별 안전성 사례 보고서')).toBeVisible();
    
    // 5. 초기 단계가 1단계인지 확인
    await expect(page.getByText('단계 1 / 7: 보고자 정보')).toBeVisible();
  });

  test('ICSR 폼 단계별 데이터 입력 및 제출', async ({ page }) => {
    // 1. 데이터 입력 페이지로 직접 이동
    await page.goto(`${BASE_URL}/report`);
    await expect(page.getByTestId('adverse-event-report')).toBeVisible();
    
    // 2. 1단계: 보고자 정보 입력
    await expect(page.getByText('A. 보고자 정보')).toBeVisible();
    
    // 보고 유형 선택
    await page.getByRole('combobox').first().click();
    await page.getByText('자발적 보고').click();
    
    // 보고자 유형 선택  
    await page.getByRole('combobox').nth(1).click();
    await page.getByText('의료진').click();
    
    // 보고자 성명
    await page.getByLabel('보고자 성명 *').fill('홍길동');
    
    // 자격/직책
    await page.getByLabel('자격/직책').fill('내과 전문의');
    
    // 소속 기관
    await page.getByLabel('소속 기관 *').fill('서울대학교병원');
    
    // 연락처
    await page.getByLabel('연락처').fill('02-1234-5678');
    
    // 다음 단계로
    await page.getByText('다음').click();
    
    // 3. 2단계: 환자 정보 입력
    await expect(page.getByText('B. 환자 정보')).toBeVisible();
    
    // 환자 나이
    await page.getByLabel('환자 나이 *').fill('45');
    
    // 성별 선택
    await page.getByLabel('남성').check();
    
    // 체중
    await page.getByLabel('체중 (kg)').fill('70');
    
    // 신장
    await page.getByLabel('신장 (cm)').fill('175');
    
    // 과거 병력
    await page.getByLabel('과거 병력').fill('고혈압, 당뇨병');
    
    // 다음 단계로
    await page.getByText('다음').click();
    
    // 4. 3단계: 의심 약물 정보 입력
    await expect(page.getByText('C. 의심 약물 정보')).toBeVisible();
    
    // 약물명
    await page.getByLabel('약물명 *').fill('아스피린');
    
    // 용법/용량
    await page.getByLabel('용법/용량 *').fill('1일 1회, 1회 100mg');
    
    // 투여 경로 선택
    await page.getByRole('combobox').first().click();
    await page.getByText('경구').click();
    
    // 적응증
    await page.getByLabel('적응증').fill('혈전 예방');
    
    // 제조회사
    await page.getByLabel('제조회사').fill('바이엘코리아');
    
    // 배치 번호
    await page.getByLabel('배치 번호').fill('LOT123456');
    
    // 다음 단계로
    await page.getByText('다음').click();
    
    // 5. 4단계: 부작용 정보 입력
    await expect(page.getByText('D. 부작용 정보')).toBeVisible();
    
    // 부작용명
    await page.getByLabel('부작용명 *').fill('위장 출혈');
    
    // 부작용 상세 설명
    await page.getByLabel('부작용 상세 설명 *').fill('복용 2주 후 검은색 변이 관찰되었으며, 내시경 검사 결과 위장 출혈이 확인됨.');
    
    // 중증도 선택
    await page.getByLabel('심각').check();
    
    // 중대성 선택
    await page.getByLabel('중대한 부작용').check();
    
    // 결과 선택
    await page.getByRole('combobox').first().click();
    await page.getByText('회복 중').click();
    
    // 다음 단계들을 빠르게 진행 (5-6단계는 선택사항이므로 빠르게)
    await page.getByText('다음').click(); // 5단계로
    await page.getByText('다음').click(); // 6단계로
    await page.getByText('다음').click(); // 7단계로
    
    // 6. 7단계: 검토 및 제출
    await expect(page.getByText('검토 및 제출')).toBeVisible();
    
    // 제출 버튼 확인 및 클릭
    await expect(page.getByText('보고서 제출')).toBeVisible();
    await page.getByText('보고서 제출').click();
    
    // 7. 제출 완료 메시지 확인
    await expect(page.getByText('보고서가 성공적으로 제출되었습니다.')).toBeVisible({ timeout: 10000 });
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'tests/screenshots/data-input-success.png' });
  });

  test('제출된 데이터가 대시보드에 반영되는지 확인', async ({ page }) => {
    // 1. 먼저 데이터 입력을 완료 (간단한 버전)
    await page.goto(`${BASE_URL}/report`);
    
    // 빠른 데이터 입력
    await page.getByRole('combobox').first().click();
    await page.getByText('자발적 보고').click();
    await page.getByRole('combobox').nth(1).click();
    await page.getByText('의료진').click();
    await page.getByLabel('보고자 성명 *').fill('테스트 의사');
    await page.getByLabel('소속 기관 *').fill('테스트 병원');
    await page.getByText('다음').click();
    
    // 환자 정보
    await page.getByLabel('환자 나이 *').fill('30');
    await page.getByLabel('남성').check();
    await page.getByText('다음').click();
    
    // 약물 정보
    await page.getByLabel('약물명 *').fill('테스트 약물');
    await page.getByLabel('용법/용량 *').fill('1일 2회');
    await page.getByText('다음').click();
    
    // 부작용 정보
    await page.getByLabel('부작용명 *').fill('테스트 부작용');
    await page.getByLabel('부작용 상세 설명 *').fill('테스트용 부작용 설명');
    await page.getByLabel('중등도').check();
    await page.getByRole('combobox').first().click();
    await page.getByText('회복').click();
    
    // 나머지 단계들 빠르게 진행
    await page.getByText('다음').click(); // 5단계로
    await page.getByText('다음').click(); // 6단계로  
    await page.getByText('다음').click(); // 7단계로
    
    // 제출
    await page.getByText('보고서 제출').click();
    await expect(page.getByText('보고서가 성공적으로 제출되었습니다.')).toBeVisible({ timeout: 10000 });
    
    // 2. 대시보드로 이동해서 데이터 확인
    await page.getByText('대시보드').click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
    
    // 3. 대시보드에서 새로운 케이스가 보이는지 확인
    await expect(page.getByText('총 사례 수')).toBeVisible();
    
    // 최근 사례 목록에서 방금 입력한 데이터 찾기
    await expect(page.getByText('최근 사례')).toBeVisible();
    
    // 사례 관리 페이지로 가서 더 자세히 확인
    await page.getByText('사례 관리').click();
    await expect(page).toHaveURL(`${BASE_URL}/cases`);
    
    // 입력한 테스트 데이터가 목록에 있는지 확인
    await expect(page.getByText('테스트 약물')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('테스트 부작용')).toBeVisible();
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'tests/screenshots/dashboard-after-input.png' });
  });

  test('사이드바 네비게이션 테스트', async ({ page }) => {
    // 홈페이지 시작
    await page.goto(BASE_URL);
    
    // 사이드바 토글 버튼이 있는지 확인
    await expect(page.getByTestId('button-sidebar-toggle')).toBeVisible();
    
    // "데이터 입력" 메뉴가 올바른 위치에 있는지 확인 (대시보드 다음)
    const sidebarItems = page.locator('[data-testid^="link-"]');
    await expect(sidebarItems.nth(0)).toHaveAttribute('data-testid', 'link-home');
    await expect(sidebarItems.nth(1)).toHaveAttribute('data-testid', 'link-report');
    await expect(sidebarItems.nth(2)).toHaveAttribute('data-testid', 'link-cases');
    
    // 데이터 입력 메뉴 클릭 테스트
    await page.getByText('데이터 입력').click();
    await expect(page).toHaveURL(`${BASE_URL}/report`);
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'tests/screenshots/sidebar-navigation.png' });
  });
});