import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * 성능 테스트 스위트
 * 한국 약물감시 시스템의 주요 페이지와 기능에 대한 성능을 측정합니다.
 */

test.describe('한국 약물감시 시스템 성능 테스트', () => {
  
  test('대시보드 페이지 로드 성능', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Dashboard load time: ${loadTime}ms`);
    
    // 목표: 2초 이내
    expect(loadTime).toBeLessThan(2000);
    
    // 주요 컴포넌트 로드 확인
    await expect(page.getByText('약물감시 시스템 관리자')).toBeVisible();
    await expect(page.getByText('전체 보고된 사례')).toBeVisible();
  });

  test('데이터 입력 페이지 로드 성능', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`📝 Report page load time: ${loadTime}ms`);
    
    // 목표: 1.5초 이내
    expect(loadTime).toBeLessThan(1500);
    
    // ICSR 폼 로드 확인
    await expect(page.getByTestId('adverse-event-report')).toBeVisible();
  });

  test('사례 관리 페이지 로드 성능', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`📋 Cases page load time: ${loadTime}ms`);
    
    // 목표: 2초 이내
    expect(loadTime).toBeLessThan(2000);
    
    // 테이블 로드 확인
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('ICSR 폼 단계별 전환 성능', async ({ page }) => {
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle' });
    
    // 필수 필드 입력
    await page.getByLabel(/보고자 성명/).fill('성능테스트사용자');
    await page.getByLabel(/소속 기관/).fill('테스트병원');
    
    for (let step = 1; step <= 6; step++) {
      const startTime = Date.now();
      
      const nextButton = page.getByRole('button', { name: '다음' });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(100); // 전환 완료 대기
      }
      
      const transitionTime = Date.now() - startTime;
      console.log(`⏩ Step ${step} transition time: ${transitionTime}ms`);
      
      // 목표: 100ms 이내
      expect(transitionTime).toBeLessThan(100);
    }
  });

  test('검색 기능 응답성', async ({ page }) => {
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    
    const searchInput = page.getByTestId('input-search-cases');
    
    const startTime = Date.now();
    await searchInput.fill('타이레놀');
    await page.waitForTimeout(500); // 검색 결과 대기
    
    const searchTime = Date.now() - startTime;
    console.log(`🔍 Search response time: ${searchTime}ms`);
    
    // 목표: 500ms 이내
    expect(searchTime).toBeLessThan(500);
  });

  test('API 응답 시간 측정', async ({ page, request }) => {
    // 통계 API 성능
    const statsStart = Date.now();
    const statsResponse = await request.get(`${BASE_URL}/api/dashboard/stats`);
    const statsTime = Date.now() - statsStart;
    
    console.log(`📈 Stats API response time: ${statsTime}ms`);
    expect(statsResponse.status()).toBe(200);
    expect(statsTime).toBeLessThan(400);

    // 사례 목록 API 성능
    const casesStart = Date.now();
    const casesResponse = await request.get(`${BASE_URL}/api/cases`);
    const casesTime = Date.now() - casesStart;
    
    console.log(`📋 Cases API response time: ${casesTime}ms`);
    expect(casesResponse.status()).toBe(200);
    expect(casesTime).toBeLessThan(300);

    // 최근 사례 API 성능
    const recentStart = Date.now();
    const recentResponse = await request.get(`${BASE_URL}/api/dashboard/recent-cases`);
    const recentTime = Date.now() - recentStart;
    
    console.log(`📊 Recent cases API response time: ${recentTime}ms`);
    expect(recentResponse.status()).toBe(200);
    expect(recentTime).toBeLessThan(300);
  });

  test('ICSR 보고서 제출 성능', async ({ page }) => {
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle' });
    
    // 필수 정보 입력
    await page.getByLabel(/보고자 성명/).fill('성능테스트사용자');
    await page.getByLabel(/소속 기관/).fill('성능테스트병원');
    await page.getByLabel(/환자 나이/).fill('45');
    await page.getByLabel(/약물명/).fill('성능테스트약물');
    await page.getByLabel(/용법\/용량/).fill('1일 3회');
    await page.getByLabel(/부작용 반응/).fill('성능테스트반응');

    // 단계 진행
    for (let i = 0; i < 6; i++) {
      const nextButton = page.getByRole('button', { name: '다음' });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(50);
      }
    }

    // 제출 성능 측정
    const submitStart = Date.now();
    const submitButton = page.getByRole('button', { name: '보고서 제출' });
    await submitButton.click();
    
    // 제출 완료 메시지 대기
    await expect(page.getByText(/성공적으로 제출되었습니다/)).toBeVisible({ timeout: 10000 });
    
    const submitTime = Date.now() - submitStart;
    console.log(`📤 Report submission time: ${submitTime}ms`);
    
    // 목표: 2초 이내 (AI 분석 제외)
    expect(submitTime).toBeLessThan(2000);
  });

  test('메모리 사용량 모니터링', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // 초기 메모리 사용량
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // 여러 페이지 이동 후 메모리 사용량
    await page.goto(`${BASE_URL}/cases`);
    await page.goto(`${BASE_URL}/report`);
    await page.goto(`${BASE_URL}/`);
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    console.log(`🧠 Memory usage - Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB, Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB, Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    // 메모리 증가량이 50MB 이내인지 확인 (메모리 누수 검사)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('네트워크 리소스 크기 확인', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        size: parseInt(response.headers()['content-length'] || '0'),
        contentType: response.headers()['content-type']
      });
    });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // JavaScript 번들 크기 확인
    const jsFiles = responses.filter(r => r.contentType?.includes('javascript'));
    const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
    
    console.log(`📦 Total JavaScript size: ${(totalJsSize / 1024).toFixed(2)}KB`);
    
    // CSS 파일 크기 확인
    const cssFiles = responses.filter(r => r.contentType?.includes('css'));
    const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
    
    console.log(`🎨 Total CSS size: ${(totalCssSize / 1024).toFixed(2)}KB`);
    
    // 목표: JS < 1MB, CSS < 200KB
    expect(totalJsSize).toBeLessThan(1024 * 1024); // 1MB
    expect(totalCssSize).toBeLessThan(200 * 1024); // 200KB
  });

  test('동시 사용자 시뮬레이션', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    // 10개의 동시 브라우저 컨텍스트 생성
    for (let i = 0; i < 10; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }
    
    const startTime = Date.now();
    
    // 모든 페이지에서 동시에 대시보드 로드
    const loadPromises = pages.map(page => 
      page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    );
    
    await Promise.all(loadPromises);
    
    const totalTime = Date.now() - startTime;
    console.log(`👥 10 concurrent users load time: ${totalTime}ms`);
    
    // 동시 사용자 처리 시간이 단일 사용자의 3배를 넘지 않아야 함
    expect(totalTime).toBeLessThan(6000); // 6초 이내
    
    // 컨텍스트 정리
    for (const context of contexts) {
      await context.close();
    }
  });

});

/**
 * Core Web Vitals 측정
 * 실제 사용자 경험에 영향을 주는 핵심 메트릭을 측정합니다.
 */
test.describe('Core Web Vitals 측정', () => {
  
  test('LCP (Largest Contentful Paint) 측정', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    console.log(`🎯 LCP (Largest Contentful Paint): ${lcp}ms`);
    
    // 목표: 2.5초 이내
    expect(lcp as number).toBeLessThan(2500);
  });

  test('CLS (Cumulative Layout Shift) 측정', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // 페이지 상호작용 시뮬레이션
    await page.waitForTimeout(2000);
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
        // 2초 후 결과 반환
        setTimeout(() => resolve(clsValue), 2000);
      });
    });
    
    console.log(`📐 CLS (Cumulative Layout Shift): ${cls}`);
    
    // 목표: 0.1 이하
    expect(cls as number).toBeLessThan(0.1);
  });

});