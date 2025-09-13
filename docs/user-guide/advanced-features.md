# 고급 기능 (Advanced Features)

Acuzen ICBM 프로젝트의 고급 기능들을 소개합니다.

## 🔧 설정 관리 (Configuration Management)

### 환경별 설정
```javascript
const config = require('../src/config');

// 개발 환경에서
if (config.env === 'development') {
    console.log('개발 모드로 실행 중');
}
```

### 환경 변수 사용
```bash
# .env 파일에서
NODE_ENV=production
DB_HOST=production-server.com
JWT_SECRET=super-secure-secret
```

## 🛡️ 보안 기능 (Security Features)

### JWT 토큰 관리
```javascript
const jwt = require('jsonwebtoken');
const config = require('../src/config');

// 토큰 생성
const token = jwt.sign(
    { userId: 123, email: 'user@acuzen.com' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
);

// 토큰 검증
const decoded = jwt.verify(token, config.jwt.secret);
```

### 데이터 암호화
```javascript
const bcrypt = require('bcryptjs');

// 비밀번호 해시화
const hashedPassword = await bcrypt.hash('password123', 12);

// 비밀번호 검증
const isValid = await bcrypt.compare('password123', hashedPassword);
```

## 📊 로깅 시스템 (Logging System)

### 구조화된 로깅
```javascript
const { logger } = require('../src/utils');

// 다양한 로그 레벨
logger.info('사용자 로그인', { userId: 123, ip: '192.168.1.1' });
logger.warn('비정상적인 접근 시도', { attempts: 5 });
logger.error('데이터베이스 연결 실패', error);
```

### 로그 설정
```javascript
// 프로덕션에서는 파일로 저장
if (process.env.NODE_ENV === 'production') {
    // logs/app.log 파일에 저장
    // 날짜별로 로테이션
    // 최대 14일간 보관
}
```

## 🔄 비동기 처리 (Async Processing)

### 재시도 메커니즘
```javascript
const { asyncUtils } = require('../src/utils');

// 실패 시 자동 재시도
const result = await asyncUtils.retry(async () => {
    // 불안정한 외부 API 호출
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('API 호출 실패');
    return response.json();
}, 3); // 최대 3번 재시도
```

### 배치 처리
```javascript
// 대량 데이터 처리
async function processBatchData(dataArray) {
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < dataArray.length; i += batchSize) {
        const batch = dataArray.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => processItem(item))
        );
        results.push(...batchResults);
        
        // 배치 간 딜레이
        await asyncUtils.sleep(1000);
    }
    
    return results;
}
```

## 🔍 데이터 검증 (Data Validation)

### 고급 검증 규칙
```javascript
const { validate } = require('../src/utils');

// 커스텀 검증 함수
const validateUser = (userData) => {
    const errors = [];
    
    if (!validate.email(userData.email)) {
        errors.push('유효하지 않은 이메일 형식');
    }
    
    if (!validate.phone(userData.phone)) {
        errors.push('유효하지 않은 전화번호 형식');
    }
    
    if (validate.isEmpty(userData.name)) {
        errors.push('이름은 필수 입력 항목입니다');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
```

### 스키마 기반 검증 (Joi 사용)
```javascript
const Joi = require('joi');

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/).required(),
    name: Joi.string().min(2).max(50).required(),
    age: Joi.number().integer().min(1).max(120)
});

const { error, value } = userSchema.validate(userData);
```

## 🚀 성능 최적화 (Performance Optimization)

### 캐싱 전략
```javascript
const cache = new Map();

async function getCachedData(key) {
    if (cache.has(key)) {
        return cache.get(key);
    }
    
    const data = await fetchFromDatabase(key);
    cache.set(key, data);
    
    // 5분 후 캐시 만료
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);
    
    return data;
}
```

### 연결 풀 관리
```javascript
const config = require('../src/config');

// 데이터베이스 연결 풀 설정
const pool = {
    min: config.database.pool.min,      // 최소 연결 수
    max: config.database.pool.max,      // 최대 연결 수
    acquire: config.database.pool.acquire, // 연결 획득 타임아웃
    idle: config.database.pool.idle     // 유휴 연결 타임아웃
};
```

## 🔧 확장성 (Scalability)

### 모듈러 구조
```javascript
// 새로운 모듈 추가
class PaymentModule {
    constructor(core) {
        this.core = core;
    }
    
    async processPayment(paymentData) {
        // 결제 처리 로직
    }
}

// 코어에 모듈 등록
core.registerModule('payment', new PaymentModule(core));
```

### 이벤트 기반 아키텍처
```javascript
const EventEmitter = require('events');

class AcuzenCore extends EventEmitter {
    async processUser(userData) {
        // 사용자 처리
        this.emit('user:created', userData);
    }
}

// 이벤트 리스너 등록
core.on('user:created', (userData) => {
    logger.info('새 사용자 생성됨', userData);
    // 추가 처리 (이메일 발송, 통계 업데이트 등)
});
```

## 📊 모니터링 (Monitoring)

### 헬스체크 엔드포인트
```javascript
app.get('/health', (req, res) => {
    const health = core.getHealthStatus();
    res.json(health);
});
```

### 메트릭 수집
```javascript
const metrics = {
    requestCount: 0,
    errorCount: 0,
    responseTime: []
};

// 미들웨어로 메트릭 수집
app.use((req, res, next) => {
    const start = Date.now();
    metrics.requestCount++;
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        metrics.responseTime.push(duration);
    });
    
    next();
});
```

## 🛠️ 개발 도구 (Development Tools)

### 디버깅
```javascript
// 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development') {
    // 자세한 에러 스택
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: err.message, stack: err.stack });
    });
}
```

### 핫 리로드
```javascript
if (process.env.NODE_ENV === 'development') {
    const chokidar = require('chokidar');
    
    chokidar.watch('./src').on('change', () => {
        console.log('파일 변경 감지, 서버 재시작...');
        // 서버 재시작 로직
    });
}
```

---

이러한 고급 기능들을 활용하여 견고하고 확장 가능한 애플리케이션을 구축할 수 있습니다.