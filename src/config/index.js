/**
 * Acuzen ICBM Configuration
 * 
 * 시스템 설정 파일
 * System configuration file
 */

const config = {
    // 환경 설정
    env: process.env.NODE_ENV || 'development',
    
    // 서버 설정
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },
    
    // 데이터베이스 설정
    database: {
        type: process.env.DB_TYPE || 'postgresql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'acuzen_icbm',
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        
        // 연결 풀 설정
        pool: {
            min: 2,
            max: 10,
            acquire: 30000,
            idle: 10000
        }
    },
    
    // Redis 캐시 설정
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || null,
        db: process.env.REDIS_DB || 0
    },
    
    // JWT 설정
    jwt: {
        secret: process.env.JWT_SECRET || 'acuzen-icbm-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // API 설정
    api: {
        version: 'v1',
        prefix: '/api',
        rateLimitWindow: 15 * 60 * 1000, // 15분
        rateLimitMax: 100, // 요청 제한
        corsOrigin: process.env.CORS_ORIGIN || '*'
    },
    
    // 로깅 설정
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log',
        maxSize: '20m',
        maxFiles: '14d'
    },
    
    // 파일 업로드 설정
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        uploadPath: process.env.UPLOAD_PATH || './uploads'
    },
    
    // 외부 서비스 설정
    external: {
        // 이메일 서비스
        email: {
            service: process.env.EMAIL_SERVICE || 'gmail',
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        },
        
        // SMS 서비스 (예: 네이버 클라우드 플랫폼)
        sms: {
            serviceId: process.env.SMS_SERVICE_ID || '',
            secretKey: process.env.SMS_SECRET_KEY || '',
            accessKey: process.env.SMS_ACCESS_KEY || ''
        }
    },
    
    // 보안 설정
    security: {
        bcryptRounds: 12,
        sessionSecret: process.env.SESSION_SECRET || 'acuzen-session-secret',
        csrfProtection: true,
        helmetEnabled: true
    },
    
    // 개발 모드 설정
    development: {
        mockData: true,
        verboseLogging: true,
        hotReload: true
    },
    
    // 프로덕션 모드 설정
    production: {
        ssl: {
            enabled: process.env.SSL_ENABLED === 'true',
            cert: process.env.SSL_CERT_PATH || '',
            key: process.env.SSL_KEY_PATH || ''
        },
        compression: true,
        staticCaching: true
    }
};

// 환경별 설정 오버라이드
if (config.env === 'development') {
    Object.assign(config, config.development);
} else if (config.env === 'production') {
    Object.assign(config, config.production);
}

module.exports = config;