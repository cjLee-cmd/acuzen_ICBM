# API 문서 (API Documentation)

Acuzen ICBM 프로젝트의 API 문서입니다.

## API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/login` - 사용자 로그인
- `POST /api/auth/logout` - 사용자 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 사용자 관리 (User Management)
- `GET /api/users` - 사용자 목록 조회
- `GET /api/users/:id` - 특정 사용자 조회
- `POST /api/users` - 새 사용자 생성
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제

### 데이터 관리 (Data Management)
- `GET /api/data` - 데이터 목록 조회
- `POST /api/data` - 새 데이터 생성
- `PUT /api/data/:id` - 데이터 수정
- `DELETE /api/data/:id` - 데이터 삭제

## 응답 형식 (Response Format)

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 에러 코드 (Error Codes)

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 인증 방식 (Authentication)

Bearer Token을 사용한 JWT 인증:

```
Authorization: Bearer <token>
```

## 예제 (Examples)

### 사용자 로그인
```bash
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### 사용자 조회
```bash
curl -X GET /api/users \
  -H "Authorization: Bearer <token>"
```