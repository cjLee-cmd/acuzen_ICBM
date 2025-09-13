/**
 * Acuzen ICBM Utilities
 * 
 * 공통으로 사용되는 유틸리티 함수들
 * Common utility functions for the project
 */

/**
 * 날짜 포맷팅
 * Format date to Korean locale
 */
const formatDate = (date = new Date()) => {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
};

/**
 * 로거 유틸리티
 * Logger utility for consistent logging
 */
const logger = {
    info: (message, data = null) => {
        console.log(`[INFO ${formatDate()}] ${message}`, data || '');
    },
    
    error: (message, error = null) => {
        console.error(`[ERROR ${formatDate()}] ${message}`, error || '');
    },
    
    warn: (message, data = null) => {
        console.warn(`[WARN ${formatDate()}] ${message}`, data || '');
    },
    
    debug: (message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG ${formatDate()}] ${message}`, data || '');
        }
    }
};

/**
 * 데이터 검증 유틸리티
 * Data validation utilities
 */
const validate = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    phone: (phone) => {
        const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
        return phoneRegex.test(phone);
    },
    
    isEmpty: (value) => {
        return value === null || value === undefined || value === '';
    },
    
    isObject: (value) => {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
};

/**
 * API 응답 포맷터
 * API response formatter
 */
const apiResponse = {
    success: (data = null, message = 'Success') => {
        return {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        };
    },
    
    error: (message = 'Error occurred', statusCode = 500) => {
        return {
            success: false,
            data: null,
            message,
            statusCode,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * 문자열 유틸리티
 * String utilities
 */
const stringUtils = {
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    truncate: (str, length = 100) => {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },
    
    slugify: (str) => {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
};

/**
 * 비동기 처리 유틸리티
 * Async utilities
 */
const asyncUtils = {
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    retry: async (fn, maxRetries = 3) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    await asyncUtils.sleep(1000 * (i + 1)); // 지수적 백오프
                }
            }
        }
        throw lastError;
    }
};

module.exports = {
    formatDate,
    logger,
    validate,
    apiResponse,
    stringUtils,
    asyncUtils
};