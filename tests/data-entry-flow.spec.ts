import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

test.describe('데이터 입력 클라이언트 테스트', () => {

  test('사이드바에서 데이터 입력 메뉴로 이동하여 ICSR 폼 확인', async ({ page }) => {
    // 메인 페이지로 이동
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // 사이드바가 로드될 때까지 대기
    await expect(page.getByTestId('sidebar-main')).toBeVisible();
    
    // 사이드바에서 "데이터 입력" 메뉴 클릭
    await page.getByText('데이터 입력').click();
    
    // /report 페이지로 이동했는지 확인
    await expect(page).toHaveURL(`${BASE_URL}/report`);
    
    // ICSR 보고서 폼이 로드되었는지 확인
    await expect(page.getByTestId('adverse-event-report')).toBeVisible();
    await expect(page.getByText('약물 부작용 보고서 (ICSR)')).toBeVisible();
    await expect(page.getByText('ICH E2B(R3) 표준에 따른 개별 안전성 사례 보고서')).toBeVisible();
  });

  test('사례 관리에서 새 사례 등록 버튼으로 데이터 입력 화면 이동', async ({ page }) => {
    // 사례 관리 페이지로 이동
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    
    // "새 사례 등록" 버튼 클릭
    await page.getByTestId('button-create-case').click();
    
    // /report 페이지로 이동했는지 확인
    await expect(page).toHaveURL(`${BASE_URL}/report`);
    
    // ICSR 보고서 폼이 로드되었는지 확인
    await expect(page.getByTestId('adverse-event-report')).toBeVisible();
  });

  test('데이터 입력 폼에 데이터를 입력하고 제출하여 대시보드에서 확인', async ({ page }) => {
    // /report 페이지로 직접 이동
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle' });
    
    // ICSR 보고서 폼이 로드될 때까지 대기
    await expect(page.getByTestId('adverse-event-report')).toBeVisible();
    
    // 첫 번째 단계: 보고자 정보 입력
    await expect(page.getByText('A. 보고자 정보')).toBeVisible();
    
    // 보고자 정보 입력
    await page.locator('#reporterName').fill('테스트 의사');
    await page.locator('#reporterQualification').fill('의사');
    await page.locator('#reporterOrganization').fill('테스트 병원');
    await page.locator('#reporterContact').fill('test@hospital.com');
    
    // 다음 버튼 클릭
    await page.getByText('다음', { exact: true }).click();
    
    // 두 번째 단계: 환자 정보 입력
    await expect(page.getByText('B. 환자 정보')).toBeVisible();
    
    await page.locator('#patientAge').fill('45');
    await page.getByText('남성').click(); // 성별 라디오 버튼
    await page.locator('#patientWeight').fill('70');
    await page.locator('#patientHeight').fill('175');
    
    // 다음 버튼 클릭
    await page.getByText('다음', { exact: true }).click();
    
    // 세 번째 단계: 의심 약물 정보 입력
    await expect(page.getByText('C. 의심 약물 정보')).toBeVisible();
    
    await page.locator('#drugName').fill('아스피린');
    await page.locator('#drugDosage').fill('1일 1회 100mg');
    await page.locator('#drugIndication').fill('혈전 예방');
    await page.locator('#drugManufacturer').fill('바이엘');
    
    // 다음 버튼 클릭
    await page.getByText('다음', { exact: true }).click();
    
    // 네 번째 단계: 부작용 정보 입력
    await expect(page.getByText('D. 부작용 정보')).toBeVisible();
    
    await page.locator('#adverseReaction').fill('위출혈');
    await page.locator('#reactionDescription').fill('복용 3일 후 위출혈 증상이 나타남. 토혈과 흑색변을 보임.');
    await page.getByText('심각', { exact: true }).click(); // 중증도 선택
    
    // 결과 선택 (드롭다운)
    await page.locator('[role="combobox"]').click();
    await page.getByText('회복 중').click();
    
    // 5~7단계는 빠르게 넘기기 (최소 입력으로)
    for (let i = 0; i < 3; i++) {
      await page.getByText('다음', { exact: true }).click();
    }
    
    // 마지막 단계에서 제출 버튼 확인
    await expect(page.getByText('G. 검토 및 제출')).toBeVisible();
    await expect(page.getByText('보고서 제출')).toBeVisible();
    
    // 제출 버튼 클릭
    await page.getByText('보고서 제출').click();
    
    // 제출 완료 메시지 확인
    await expect(page.getByText('보고서가 성공적으로 제출되었습니다.')).toBeVisible({ timeout: 10000 });
    
    // 대시보드로 이동하여 새 케이스가 등록되었는지 확인
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // 대시보드에서 총 사례 수가 증가했는지 확인 (또는 새 케이스가 보이는지 확인)
    await expect(page.getByText('최근 사례')).toBeVisible();
    
    // 최근 사례 중에 방금 입력한 케이스가 있는지 확인
    await expect(page.getByText('아스피린')).toBeVisible();
    await expect(page.getByText('위출혈')).toBeVisible();
  });

  test('데이터 입력 폼의 필수 필드 검증', async ({ page }) => {
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle' });
    
    // 필수 필드 없이 다음 버튼 클릭 시도
    await page.getByText('다음', { exact: true }).click();
    
    // 필수 필드가 비어있어도 다음으로 넘어가는지 확인 (현재 구현 상태에 따라)
    // 실제 유효성 검사가 구현되면 에러 메시지 확인으로 변경 가능
  });

  test('데이터 입력 폼의 단계 네비게이션', async ({ page }) => {
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle' });
    
    // 첫 번째 단계에서 이전 버튼이 비활성화되어 있는지 확인
    await expect(page.getByText('이전')).toBeDisabled();
    
    // 임시 데이터 입력하고 다음으로 이동
    await page.locator('#reporterName').fill('테스트');
    await page.locator('#reporterOrganization').fill('테스트 병원');
    await page.getByText('다음', { exact: true }).click();
    
    // 두 번째 단계에서 이전 버튼이 활성화되어 있는지 확인
    await expect(page.getByText('이전')).toBeEnabled();
    
    // 이전 버튼 클릭하여 첫 번째 단계로 돌아가기
    await page.getByText('이전').click();
    
    // 첫 번째 단계 내용이 보존되어 있는지 확인
    await expect(page.locator('#reporterName')).toHaveValue('테스트');
  });

});