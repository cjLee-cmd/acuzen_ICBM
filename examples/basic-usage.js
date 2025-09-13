/**
 * Acuzen ICBM Basic Usage Example
 * 
 * 기본 사용법 예제
 * Basic usage example
 */

const AcuzenCore = require('../src/core/index');
const { logger, validate, apiResponse } = require('../src/utils/index');

// 예제 1: 기본 시스템 초기화
async function basicExample() {
    logger.info('=== 기본 예제 시작 (Basic Example Start) ===');
    
    try {
        // 코어 시스템 생성
        const core = new AcuzenCore({
            debug: true,
            name: 'Example Instance'
        });
        
        // 시스템 초기화
        logger.info('시스템 초기화 중... (Initializing system...)');
        const initResult = await core.initialize();
        logger.info('초기화 결과:', initResult);
        
        // 시스템 상태 확인
        const health = core.getHealthStatus();
        logger.info('시스템 상태:', health);
        
        // 시스템 종료
        await core.shutdown();
        logger.info('시스템이 안전하게 종료되었습니다.');
        
    } catch (error) {
        logger.error('예제 실행 중 오류 발생:', error.message);
    }
}

// 예제 2: 데이터 검증 및 API 응답 예제
function validationExample() {
    logger.info('=== 검증 예제 시작 (Validation Example Start) ===');
    
    // 테스트 데이터
    const testData = [
        { type: 'email', value: 'test@example.com', expected: true },
        { type: 'email', value: 'invalid-email', expected: false },
        { type: 'phone', value: '010-1234-5678', expected: true },
        { type: 'phone', value: '123-456-789', expected: false }
    ];
    
    testData.forEach(test => {
        const result = validate[test.type](test.value);
        const status = result === test.expected ? '✅' : '❌';
        logger.info(`${status} ${test.type} 검증: "${test.value}" => ${result}`);
    });
    
    // API 응답 예제
    logger.info('\n=== API 응답 예제 ===');
    
    const successResponse = apiResponse.success(
        { userId: 1, name: '홍길동' }, 
        '사용자 정보 조회 성공'
    );
    logger.info('성공 응답:', successResponse);
    
    const errorResponse = apiResponse.error('사용자를 찾을 수 없습니다', 404);
    logger.info('오류 응답:', errorResponse);
}

// 예제 3: 비동기 처리 예제
async function asyncExample() {
    logger.info('=== 비동기 예제 시작 (Async Example Start) ===');
    
    const { asyncUtils } = require('../src/utils/index');
    
    // 딜레이 예제
    logger.info('3초 대기 시작...');
    await asyncUtils.sleep(3000);
    logger.info('3초 대기 완료!');
    
    // 재시도 예제
    let attempt = 0;
    const flakyFunction = async () => {
        attempt++;
        logger.info(`시도 ${attempt}번째`);
        
        if (attempt < 3) {
            throw new Error('일시적 오류');
        }
        
        return '성공!';
    };
    
    try {
        const result = await asyncUtils.retry(flakyFunction, 5);
        logger.info('재시도 결과:', result);
    } catch (error) {
        logger.error('재시도 실패:', error.message);
    }
}

// 예제 4: 실제 사용 시나리오
async function realWorldScenario() {
    logger.info('=== 실제 시나리오 예제 (Real World Scenario) ===');
    
    try {
        // 시스템 초기화
        const core = new AcuzenCore({ debug: false });
        await core.initialize();
        
        // 사용자 데이터 시뮬레이션
        const userData = {
            email: 'user@acuzen.com',
            phone: '010-9876-5432',
            name: '김개발자'
        };
        
        // 데이터 검증
        const isEmailValid = validate.email(userData.email);
        const isPhoneValid = validate.phone(userData.phone);
        
        if (isEmailValid && isPhoneValid) {
            const response = apiResponse.success(
                userData, 
                '사용자 데이터가 유효합니다'
            );
            logger.info('검증 성공:', response);
        } else {
            const response = apiResponse.error('유효하지 않은 사용자 데이터', 400);
            logger.error('검증 실패:', response);
        }
        
        // 시스템 종료
        await core.shutdown();
        
    } catch (error) {
        logger.error('시나리오 실행 중 오류:', error.message);
    }
}

// 모든 예제 실행
async function runAllExamples() {
    console.log('🎯 Acuzen ICBM 예제 실행 시작\n');
    
    await basicExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    validationExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await asyncExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await realWorldScenario();
    
    console.log('\n🎉 모든 예제가 완료되었습니다!');
    console.log('📖 더 많은 정보는 docs/ 폴더를 참조하세요.');
}

// 스크립트로 직접 실행될 때
if (require.main === module) {
    runAllExamples().catch(error => {
        console.error('예제 실행 중 오류:', error);
        process.exit(1);
    });
}

module.exports = {
    basicExample,
    validationExample,
    asyncExample,
    realWorldScenario,
    runAllExamples
};