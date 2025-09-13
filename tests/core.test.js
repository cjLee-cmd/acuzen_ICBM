/**
 * Acuzen ICBM Test Suite
 * 
 * 핵심 모듈 테스트
 * Core module tests
 */

const AcuzenCore = require('../src/core/index');
const { logger, validate, apiResponse } = require('../src/utils/index');

// 테스트 설정
const testConfig = {
    debug: true,
    name: 'Test Instance'
};

describe('Acuzen ICBM Core Tests', () => {
    let coreInstance;

    beforeEach(() => {
        coreInstance = new AcuzenCore(testConfig);
    });

    afterEach(async () => {
        if (coreInstance && coreInstance.initialized) {
            await coreInstance.shutdown();
        }
    });

    test('Should create core instance with config', () => {
        expect(coreInstance.config.name).toBe('Test Instance');
        expect(coreInstance.config.debug).toBe(true);
        expect(coreInstance.initialized).toBe(false);
    });

    test('Should initialize system successfully', async () => {
        const result = await coreInstance.initialize();
        
        expect(result.success).toBe(true);
        expect(coreInstance.initialized).toBe(true);
    });

    test('Should return health status', async () => {
        await coreInstance.initialize();
        const health = coreInstance.getHealthStatus();
        
        expect(health.status).toBe('healthy');
        expect(health.version).toBe('2.0.0');
        expect(health.timestamp).toBeDefined();
    });

    test('Should shutdown gracefully', async () => {
        await coreInstance.initialize();
        await coreInstance.shutdown();
        
        expect(coreInstance.initialized).toBe(false);
    });
});

describe('Utility Functions Tests', () => {
    test('Should validate email correctly', () => {
        expect(validate.email('test@example.com')).toBe(true);
        expect(validate.email('invalid-email')).toBe(false);
        expect(validate.email('')).toBe(false);
    });

    test('Should validate Korean phone number', () => {
        expect(validate.phone('010-1234-5678')).toBe(true);
        expect(validate.phone('01012345678')).toBe(true);
        expect(validate.phone('123-456-789')).toBe(false);
    });

    test('Should check empty values', () => {
        expect(validate.isEmpty('')).toBe(true);
        expect(validate.isEmpty(null)).toBe(true);
        expect(validate.isEmpty(undefined)).toBe(true);
        expect(validate.isEmpty('value')).toBe(false);
        expect(validate.isEmpty(0)).toBe(false);
    });

    test('Should format API success response', () => {
        const response = apiResponse.success({ id: 1 }, 'Data retrieved');
        
        expect(response.success).toBe(true);
        expect(response.data.id).toBe(1);
        expect(response.message).toBe('Data retrieved');
        expect(response.timestamp).toBeDefined();
    });

    test('Should format API error response', () => {
        const response = apiResponse.error('Not found', 404);
        
        expect(response.success).toBe(false);
        expect(response.data).toBe(null);
        expect(response.message).toBe('Not found');
        expect(response.statusCode).toBe(404);
        expect(response.timestamp).toBeDefined();
    });
});

// 통합 테스트 예제
describe('Integration Tests', () => {
    test('Should handle complete workflow', async () => {
        const core = new AcuzenCore({ debug: false });
        
        // 초기화
        const initResult = await core.initialize();
        expect(initResult.success).toBe(true);
        
        // 상태 확인
        const health = core.getHealthStatus();
        expect(health.status).toBe('healthy');
        
        // 종료
        await core.shutdown();
        expect(core.initialized).toBe(false);
    });
});

// 성능 테스트 예제
describe('Performance Tests', () => {
    test('Should initialize within reasonable time', async () => {
        const start = Date.now();
        const core = new AcuzenCore();
        
        await core.initialize();
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(5000); // 5초 이내
        
        await core.shutdown();
    });
});

// 모킹 테스트 예제
describe('Mocked Tests', () => {
    test('Should handle initialization errors', async () => {
        const core = new AcuzenCore();
        
        // 데이터베이스 설정 메서드를 모킹하여 에러 발생시키기
        const originalSetupDatabase = core._setupDatabase;
        core._setupDatabase = jest.fn().mockRejectedValue(new Error('Database connection failed'));
        
        await expect(core.initialize()).rejects.toThrow('Database connection failed');
        
        // 원래 메서드 복구
        core._setupDatabase = originalSetupDatabase;
    });
});

console.log('테스트 파일이 생성되었습니다. Jest나 Mocha 같은 테스트 프레임워크를 사용하여 실행하세요.');
console.log('Test file created. Run with Jest or Mocha test framework.');