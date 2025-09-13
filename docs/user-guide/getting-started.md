# Acuzen ICBM 시작하기 (Getting Started)

Acuzen ICBM 프로젝트에 오신 것을 환영합니다!

## 빠른 시작 (Quick Start)

### 1. 시스템 요구사항
- Node.js 16 이상
- npm 7 이상
- Git

### 2. 설치
```bash
# 저장소 클론
git clone https://github.com/cjLee-cmd/acuzen_ICBM.git

# 프로젝트 디렉토리로 이동
cd acuzen_ICBM

# 개발 환경 설정 (자동 설치 스크립트)
./scripts/setup.sh
```

### 3. 환경 설정
```bash
# .env 파일 편집
cp .env.example .env
# 필요한 환경 변수들을 설정하세요
```

### 4. 실행
```bash
# 개발 서버 시작
npm run dev

# 또는 프로덕션 모드
npm start
```

## 주요 기능 (Key Features)

### ✨ 현재 제공되는 기능
- 🏗️ **모듈러 아키텍처**: 확장 가능한 코어 시스템
- 🛡️ **보안**: JWT 인증, 데이터 암호화
- 📊 **로깅**: 구조화된 로그 시스템
- 🔧 **설정 관리**: 환경별 설정 분리
- 🧪 **테스트**: 단위 테스트 및 통합 테스트

### 🚧 개발 예정 기능
- RESTful API 서버
- 데이터베이스 연동
- 실시간 통신
- 관리자 대시보드

## 프로젝트 구조

```
acuzen_ICBM/
├── src/                    # 소스 코드
│   ├── core/              # 핵심 모듈
│   ├── utils/             # 유틸리티
│   └── config/            # 설정
├── docs/                   # 문서
├── tests/                  # 테스트
├── scripts/               # 스크립트
└── examples/              # 예제 코드
```

## 다음 단계 (Next Steps)

1. **문서 읽기**: `docs/` 폴더의 기술 문서들을 확인하세요
2. **예제 실행**: `examples/` 폴더의 예제들을 실행해보세요
3. **테스트 실행**: `npm test`로 모든 테스트를 실행하세요
4. **개발 시작**: 새로운 기능을 개발해보세요

## 도움이 필요하신가요?

- 📖 [기술 문서](docs/technical/README.md)
- 👥 [사용자 가이드](docs/user-guide/README.md)
- 🔌 [API 문서](docs/api/README.md)
- 🐛 [이슈 제보](https://github.com/cjLee-cmd/acuzen_ICBM/issues)

---

Happy coding! 🎉