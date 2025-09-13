#!/usr/bin/env node

/**
 * Playwright 데모 스크립트
 * 약물감시 시스템의 주요 페이지들을 자동으로 순회하며 스크린샷을 캡처합니다.
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const SCREENSHOTS_DIR = join(__dirname, '../playwright-screenshots');

async function createScreenshotsDir() {
  try {
    await mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.warn('Screenshots directory already exists or could not be created');
  }
}

async function capturePageScreenshot(page, name, fullPage = true) {
  const filename = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ 
    path: filename, 
    fullPage,
    quality: 90
  });
  console.log(`✓ Screenshot saved: ${filename}`);
}

async function runDemo() {
  console.log('🚀 Starting Playwright demo for 약물감시 시스템...\n');

  await createScreenshotsDir();

  const browser = await chromium.launch({ 
    headless: false, // 브라우저를 보이게 실행
    slowMo: 1000 // 1초씩 지연하여 시각적으로 확인
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'ko-KR'
    });
    
    const page = await context.newPage();

    // 1. 홈 대시보드
    console.log('📊 Navigating to Dashboard...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '01-dashboard');

    // 2. 사례 관리 페이지
    console.log('📋 Navigating to Cases Management...');
    await page.getByRole('link', { name: '사례 관리' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '02-cases-management');

    // 3. AI 모델 관리 페이지 시도
    console.log('🤖 Attempting to navigate to AI Models...');
    await page.getByRole('link', { name: 'AI 모델 관리' }).click();
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '03-ai-models');

    // 4. 사용자 관리 페이지
    console.log('👥 Navigating to User Management...');
    await page.getByRole('link', { name: '사용자 관리' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '04-user-management');

    // 5. 감사 로그 페이지 시도
    console.log('📜 Attempting to navigate to Audit Logs...');
    await page.getByRole('link', { name: '감사 로그' }).click();
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '05-audit-logs');

    // 6. 시스템 모니터링 페이지 시도
    console.log('📈 Attempting to navigate to System Monitoring...');
    await page.getByRole('link', { name: '시스템 모니터링' }).click();
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '06-system-monitoring');

    // 7. 설정 페이지 시도
    console.log('⚙️ Attempting to navigate to Settings...');
    await page.getByRole('link', { name: '설정' }).click();
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '07-settings');

    // 8. 사이드바 토글 테스트
    console.log('🎛️ Testing sidebar toggle...');
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
    await page.waitForTimeout(1000);
    await capturePageScreenshot(page, '08-sidebar-collapsed');

    // 9. 테마 토글 테스트
    console.log('🌙 Testing theme toggle...');
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await page.waitForTimeout(1000);
    await capturePageScreenshot(page, '09-dark-theme');

    // 10. 다시 대시보드로
    console.log('🏠 Returning to Dashboard...');
    await page.getByRole('link', { name: '대시보드' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await capturePageScreenshot(page, '10-dashboard-final');

    console.log('\n✅ Demo completed successfully!');
    console.log(`📸 All screenshots saved to: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error during demo:', error);
  } finally {
    await browser.close();
  }
}

// 스크립트가 직접 실행될 때만 데모 실행
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDemo().catch(console.error);
}

export { runDemo };