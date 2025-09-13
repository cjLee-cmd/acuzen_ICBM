# 프로덕션 환경 관리자 계정 생성 가이드

## 보안 경고 ⚠️
프로덕션 환경에서는 보안상의 이유로 자동으로 기본 계정이 생성되지 않습니다.

## 프로덕션에서 첫 관리자 계정 생성하기

### 방법 1: 데이터베이스 직접 접근
1. Replit Database 패널에서 프로덕션 데이터베이스에 접속
2. 다음 SQL을 실행하여 관리자 계정 생성:

```sql
INSERT INTO users (id, email, name, password, role, organization, "isActive", "createdAt")
VALUES (
  gen_random_uuid(),
  'your-admin@company.com',
  '관리자 이름',
  '$2b$10$YourHashedPasswordHere',  -- bcrypt로 해시된 비밀번호
  'ADMIN',
  '귀하의 조직명',
  true,
  NOW()
);
```

### 방법 2: 개발환경에서 계정 생성 후 백업/복원
1. 개발환경에서 관리자 계정 생성
2. 해당 사용자 데이터를 프로덕션으로 이전

### 비밀번호 해시 생성하기
Node.js에서 bcrypt를 사용하여 비밀번호 해시 생성:

```javascript
const bcrypt = require('bcrypt');
const password = 'your-secure-password';
const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);
```

## 보안 권장사항
- 강력한 비밀번호 사용 (최소 12자, 대소문자/숫자/특수문자 포함)
- 첫 로그인 후 즉시 비밀번호 변경
- 불필요한 기본 계정들은 생성하지 않기
- 정기적인 비밀번호 변경

## 추가 사용자 생성
관리자로 로그인한 후 시스템 내의 "사용자 관리" 기능을 통해 안전하게 추가 사용자를 생성할 수 있습니다.