# 기여 가이드라인 (Contributing Guidelines)

Acuzen ICBM 프로젝트에 기여해 주셔서 감사합니다! 

## 🤝 기여 방법 (How to Contribute)

### 1. 이슈 제보 (Reporting Issues)
- 버그를 발견했거나 개선사항이 있다면 [GitHub Issues](https://github.com/cjLee-cmd/acuzen_ICBM/issues)에서 제보해주세요
- 이슈 제목을 명확하게 작성해주세요
- 재현 가능한 단계를 포함해주세요
- 환경 정보(OS, Node.js 버전 등)를 포함해주세요

### 2. 풀 리퀘스트 (Pull Requests)

#### 준비 작업
```bash
# 1. 저장소 포크
# GitHub에서 Fork 버튼 클릭

# 2. 로컬에 클론
git clone https://github.com/YOUR_USERNAME/acuzen_ICBM.git
cd acuzen_ICBM

# 3. 개발 환경 설정
./scripts/setup.sh

# 4. 새로운 브랜치 생성
git checkout -b feature/amazing-feature
```

#### 개발 과정
```bash
# 1. 코드 작성
# 2. 테스트 작성 및 실행
npm test

# 3. 린트 검사
npm run lint

# 4. 커밋
git add .
git commit -m "feat: add amazing feature"

# 5. 푸시
git push origin feature/amazing-feature

# 6. GitHub에서 Pull Request 생성
```

## 📝 코딩 컨벤션 (Coding Conventions)

### JavaScript 스타일
- **ES6+** 문법 사용
- **Standard JS** 스타일 가이드 따르기
- **camelCase** 변수명 사용
- **PascalCase** 클래스명 사용

```javascript
// ✅ 좋은 예
class UserManager {
    constructor(config) {
        this.apiUrl = config.apiUrl;
        this.isEnabled = true;
    }
    
    async createUser(userData) {
        return await this.api.post('/users', userData);
    }
}

// ❌ 피해야 할 예
class user_manager {
    constructor(Config) {
        this.API_URL = Config.api_url;
        this.is_enabled = true;
    }
    
    createUser(user_data, callback) {
        // 콜백 패턴 대신 Promise/async-await 사용
    }
}
```

### 주석 작성
```javascript
/**
 * 사용자 인증을 처리합니다
 * Handles user authentication
 * 
 * @param {Object} credentials - 인증 정보
 * @param {string} credentials.email - 이메일 주소
 * @param {string} credentials.password - 비밀번호
 * @returns {Promise<Object>} 인증 결과
 */
async function authenticate(credentials) {
    // 구현...
}
```

### 에러 핸들링
```javascript
// ✅ 적절한 에러 핸들링
async function processData(data) {
    try {
        const result = await apiCall(data);
        return result;
    } catch (error) {
        logger.error('데이터 처리 중 오류 발생', { error: error.message, data });
        throw new ProcessingError('데이터 처리 실패', error);
    }
}

// ❌ 에러 무시
async function processData(data) {
    try {
        return await apiCall(data);
    } catch (error) {
        // 에러를 무시하지 마세요
    }
}
```

## 🧪 테스트 가이드라인 (Testing Guidelines)

### 단위 테스트
```javascript
describe('UserValidator', () => {
    test('should validate valid email', () => {
        expect(validate.email('test@example.com')).toBe(true);
    });
    
    test('should reject invalid email', () => {
        expect(validate.email('invalid-email')).toBe(false);
    });
});
```

### 통합 테스트
```javascript
describe('User API Integration', () => {
    let core;
    
    beforeEach(async () => {
        core = new AcuzenCore();
        await core.initialize();
    });
    
    afterEach(async () => {
        await core.shutdown();
    });
    
    test('should create and retrieve user', async () => {
        // 테스트 구현
    });
});
```

### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 감시 모드로 실행
npm run test:watch

# 커버리지 포함 실행
npm run test:coverage
```

## 📦 커밋 메시지 (Commit Messages)

### 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 도구 변경 등

### 예시
```bash
feat(auth): add JWT token refresh functionality

사용자의 액세스 토큰이 만료되었을 때 자동으로 갱신하는 기능을 추가했습니다.

Closes #123
```

## 📋 PR 체크리스트 (PR Checklist)

풀 리퀘스트를 생성하기 전에 다음 항목들을 확인해주세요:

- [ ] 코드가 프로젝트의 스타일 가이드를 준수하나요?
- [ ] 모든 테스트가 통과하나요?
- [ ] 새로운 기능에 대한 테스트를 작성했나요?
- [ ] 문서가 업데이트되었나요?
- [ ] 린트 검사를 통과했나요?
- [ ] 커밋 메시지가 컨벤션을 따르나요?
- [ ] Breaking change가 있다면 문서화되었나요?

## 🏷️ 라벨 시스템 (Label System)

이슈와 PR에 사용되는 라벨들:

- `bug` - 버그 수정
- `enhancement` - 기능 개선
- `feature` - 새로운 기능
- `documentation` - 문서 관련
- `good first issue` - 초보자에게 적합
- `help wanted` - 도움 요청
- `priority: high` - 높은 우선순위
- `priority: low` - 낮은 우선순위

## 👥 코드 리뷰 (Code Review)

### 리뷰 요청
- 적절한 리뷰어를 지정해주세요
- PR 설명을 자세히 작성해주세요
- 스크린샷이나 GIF를 포함해주세요 (UI 변경 시)

### 리뷰 기준
- 코드의 정확성
- 성능 고려사항
- 보안 취약점
- 테스트 커버리지
- 코드 가독성
- 문서화 수준

## 🎯 우선순위 (Priorities)

현재 프로젝트의 우선순위:

1. **코어 기능 안정화** - 핵심 모듈의 안정성 향상
2. **API 개발** - RESTful API 구현
3. **데이터베이스 연동** - PostgreSQL/MongoDB 연동
4. **보안 강화** - 인증/권한 시스템 개선
5. **모니터링** - 로깅 및 메트릭 수집
6. **문서화** - 사용자 가이드 및 API 문서 완성

## 📞 커뮤니케이션 (Communication)

- **GitHub Issues**: 버그 제보, 기능 요청
- **GitHub Discussions**: 일반적인 질문, 아이디어 토론
- **Email**: 보안 이슈나 민감한 사항

## 🙏 감사의 말 (Acknowledgments)

모든 기여자들에게 감사드립니다! 여러분의 기여가 이 프로젝트를 더욱 발전시킵니다.

---

더 자세한 정보가 필요하시면 [개발자 가이드](docs/technical/README.md)를 참조해주세요.