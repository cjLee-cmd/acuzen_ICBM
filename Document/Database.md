# 데이터베이스 설계 및 연동 문서

본 문서는 약물감시 시스템의 데이터베이스 종류, 구조(스키마), 테이블 간 관계, 애플리케이션 연계 방식, 운용상의 주의점과 확장 전략을 정리합니다. 코드 수정 없이 이해/운영/확장을 위한 참고 자료입니다.

최종 업데이트: 2025-09-13

---

## 1) DB 종류와 선택 배경

- 종류: SQLite (로컬 파일 DB) + Drizzle ORM + better-sqlite3 드라이버
- 연결 파일: 기본 `./dev.db` (환경변수 `DATABASE_URL`에 `file:` 스킴 포함 시 해당 경로 사용). WAL 모드 활성화
  - 설정 위치: `server/db.ts`
- ORM/스키마: Drizzle ORM을 사용하며, 타입/스키마는 `shared/schema.ts`에서 단일 소스로 관리합니다. Zod 스키마(`drizzle-zod`)로 입력 검증을 일원화합니다.
- 선택 이유(현 구조 기준)
  - 개발/데모 환경에서 빠른 시작과 간단한 배포
  - 단일 파일로 관리가 쉬우며, Drizzle 기반으로 이식성 확보(Postgres 등으로 마이그레이션 용이)

운영 고려
- 프로덕션에선 동시성/확장성/백업/복구 요구에 따라 RDBMS(PostgreSQL 등)로의 전환을 권장합니다. 세션 저장소 역시 파일/메모리 기반이 아닌 영속 스토어를 사용해야 합니다.

---

## 2) 스키마 개요(테이블 목록)

스키마 정의 파일: `shared/schema.ts`

- users: 사용자 계정/권한 관리
- cases: 부작용(ADR) 사례 관리(소프트 삭제 포함)
- ai_predictions: AI 분석 결과(예측/권고/신뢰도 등)
- audit_logs: 감사 로그(규제/보안 추적)
- ai_models: 운영 중인 AI 모델 메타 정보

관계 요약
- users (1) — (∞) cases: `cases.reporterId → users.id`
- users (1) — (∞) ai_predictions (리뷰어): `ai_predictions.reviewerId → users.id`
- cases (1) — (∞) ai_predictions: `ai_predictions.caseId → cases.id`
- users (1) — (∞) audit_logs: `audit_logs.userId → users.id`
- cases (1) — (1) users (삭제자): `cases.deletedBy → users.id`

---

## 3) 테이블 상세

### 3.1 users (사용자)
- id (TEXT, PK)
- email (TEXT, UNIQUE, NOT NULL)
- name (TEXT, NOT NULL)
- password (TEXT, NOT NULL) — bcrypt 해시 저장
- role (TEXT, NOT NULL, default USER) — USER | REVIEWER | ADMIN
- organization (TEXT)
- isActive (BOOLEAN, NOT NULL, default true)
- lastLoginAt (TIMESTAMP)
- createdAt (TIMESTAMP, NOT NULL)
- updatedAt (TIMESTAMP, NOT NULL)

인덱스/제약
- email 고유 제약

비고
- 애플리케이션 레벨에서 비밀번호 해시/검증 수행(`storage.hashPassword/verifyPassword`).

### 3.2 cases (부작용 사례)
- id (TEXT, PK)
- caseNumber (TEXT, UNIQUE, NOT NULL) — `CSE-YYYY-XXXXXX` 포맷으로 앱이 생성
- patientAge (INTEGER, NOT NULL)
- patientGender (TEXT, NOT NULL)
- drugName (TEXT, NOT NULL)
- drugDosage (TEXT)
- adverseReaction (TEXT, NOT NULL)
- reactionDescription (TEXT)
- severity (TEXT, NOT NULL) — Low | Medium | High | Critical
- status (TEXT, NOT NULL, default "검토 필요") — 긴급 | 검토 필요 | 처리중 | 완료
- reporterId (TEXT, NOT NULL, FK → users.id)
- dateReported (TIMESTAMP, NOT NULL)
- dateOfReaction (TIMESTAMP)
- concomitantMeds (TEXT, JSON 문자열)
- medicalHistory (TEXT)
- outcome (TEXT)
- isDeleted (BOOLEAN, NOT NULL, default false)
- deletedAt (TIMESTAMP)
- deletedBy (TEXT, FK → users.id)
- deletionReason (TEXT)
- createdAt (TIMESTAMP, NOT NULL)
- updatedAt (TIMESTAMP, NOT NULL)

업무 규칙(저장소 계층에서 보강)
- reporterId는 수정 불가(컴플라이언스 목적)
- 소프트 삭제: isDeleted=true와 함께 삭제 메타 기록
- 목록 조회 시 기본적으로 isDeleted=false만 조회(관리자 옵션 시 포함 가능)

### 3.3 ai_predictions (AI 예측)
- id (TEXT, PK)
- caseId (TEXT, NOT NULL, FK → cases.id)
- modelName (TEXT, NOT NULL)
- modelVersion (TEXT, NOT NULL)
- confidence (REAL, NOT NULL)
- prediction (TEXT, NOT NULL, JSON 문자열) — severity/recommendations/analysisTimestamp
- recommendation (TEXT) — 요약 문자열(화면 표출용)
- processingTime (REAL)
- humanReviewed (BOOLEAN, NOT NULL, default false)
- reviewerId (TEXT, FK → users.id)
- reviewNotes (TEXT)
- createdAt (TIMESTAMP, NOT NULL)

조회/정렬
- 최근 생성 순(createdAt desc)으로 주로 조회

### 3.4 audit_logs (감사 로그)
- id (TEXT, PK)
- userId (TEXT, FK → users.id)
- action (TEXT, NOT NULL)
- resource (TEXT, NOT NULL)
- resourceId (TEXT)
- details (TEXT, JSON 문자열)
- ipAddress (TEXT)
- userAgent (TEXT)
- severity (TEXT, NOT NULL, default INFO) — INFO | WARNING | HIGH
- timestamp (TIMESTAMP, NOT NULL)

활용
- 규제/보안 추적(중요 변경에 대해 HIGH 레벨 사용)

### 3.5 ai_models (AI 모델)
- id (TEXT, PK)
- name (TEXT, NOT NULL)
- version (TEXT, NOT NULL)
- status (TEXT, NOT NULL, default Active)
- accuracy (REAL)
- avgResponseTime (INTEGER)
- totalPredictions (INTEGER, NOT NULL, default 0)
- lastUpdated (TIMESTAMP, NOT NULL)
- createdAt (TIMESTAMP, NOT NULL)

용도
- 운영 중인 모델 메타/성능 추적, 화면에서 모델 목록 제공

---

## 4) 관계 다이어그램(개념적)

```
users ──< cases
  │        │
  │        └──────< ai_predictions
  │                   ▲
  └──< audit_logs     │
           ▲          │
           └──── reviewerId (users)

cases ── deletedBy ──> users
```

---

## 5) 애플리케이션 연계(DAO/저장소, 라우팅)

- DB 연결: `server/db.ts`
  - `better-sqlite3`로 파일 DB 접속, WAL 모드 설정 → Drizzle(`drizzle-orm/better-sqlite3`)로 래핑
- 저장소 계층: `server/storage.ts`
  - 책임: CRUD 캡슐화, 컴플라이언스 제약(예: reporterId 불변), 소프트 삭제 처리, 감사 로그/예측 기록화 지원
  - ID 생성: `crypto.randomBytes(16).toString('hex')`
  - 시간 처리: 생성/수정 시 `new Date()`를 Drizzle가 TIMESTAMP로 매핑
- 라우팅: `server/routes.ts`
  - 사용자/사례/AI/감사/모델 API를 제공하며, 역할 기반 접근 제어와 일부 감사 로깅을 수행
  - 목록/상세에서 삭제 여부/권한에 따라 접근 통제

---

## 6) 마이그레이션/스키마 관리

- Drizzle Kit 설정: `drizzle.config.ts`
  - dialect: sqlite, schema: `./shared/schema.ts`, out: `./migrations`
- 명령: `npm run db:push` (drizzle-kit push)
- 버전 관리: `migrations/`에 스냅샷 및 저널 파일 존재

권장 워크플로
1) `shared/schema.ts`에서 스키마 변경
2) drizzle-kit으로 마이그레이션 생성/적용
3) `server/seed.ts`로 초기 데이터 점검(필요 시 보강)

---

## 7) 컴플라이언스/보안 설계 포인트

- 소프트 삭제(cases): 기록 보존과 규제 준수를 위한 필드 제공(isDeleted/deletedAt/deletedBy/deletionReason)
- 감사 로그(audit_logs): 사용자/액션/리소스/상세/심각도/시간을 구조적으로 보관
- 최소 로그 전략: API 응답 본문은 기본 로깅하지 않음(PII 노출 방지)
- 권한/역할: USER/REVIEWER/ADMIN으로 라우트별 접근 통제
- 세션: express-session 기반(개발은 MemoryStore), 운영은 영속 스토어 권장

---

## 8) 인덱스/성능/확장 고려

- 현재 고유/참조 제약 외에 추가 인덱스는 정의되어 있지 않음
  - 후보: `cases(status)`, `cases(createdAt)`, `ai_predictions(caseId, createdAt)` 복합 인덱스
- WAL 모드로 읽기/쓰기 동시성 향상(로컬 단일 인스턴스 기준)
- 대용량/동접 확장 시 권장
  - PostgreSQL 전환 + 적절한 인덱스/파티셔닝 전략
  - 장기 보관 감사 로그/예측 테이블의 아카이빙 정책 수립

---

## 9) 데이터 무결성/검증

- DB 제약: NOT NULL/UNIQUE/FOREIGN KEY로 1차 방어
- 앱 검증: Zod 스키마(`insert*/update*`)로 입력 검증, storage 계층에서 필드 불변성 보강
- 날짜/숫자 파싱: API 레벨에서 일관된 포맷(JSON/TIMESTAMP) 유지

---

## 10) 백업/복구/운영 팁

- SQLite 파일 백업: 애플리케이션 중단 뒤 스냅샷 권장(WAL 모드 동작 고려)
- 점검
  - 용량 증가 모니터링(dev.db)
  - 정기 무결성 점검(`PRAGMA integrity_check`)
- 환경 분리
  - 개발: SQLite(현 구성)
  - 운영: PostgreSQL + 관리형 백업 + 고가용성 고려

---

## 11) Postgres 전환 가이드(요약)

- Drizzle는 다중 드라이버 지원 → 스키마 정의 대부분 재사용 가능
- 작업 순서
  1) 연결 드라이버를 `drizzle-orm/postgres-js` 등으로 교체
  2) 스키마 타입 불일치(REAL, TIMESTAMP 등)와 제약/인덱스 재검토
  3) 마이그레이션 생성/적용 → 데이터 이행 스크립트 작성
  4) 세션 저장소를 Postgres 기반(`connect-pg-simple`)으로 전환

---

## 12) 예시 질의(Drizzle 스타일)

- 최근 사례 5건
```ts
const cases = await db.select().from(schema.cases)
  .where(eq(schema.cases.isDeleted, false))
  .orderBy(desc(schema.cases.createdAt))
  .limit(5);
```

- 특정 사례의 예측 내역
```ts
const predictions = await db.select().from(schema.aiPredictions)
  .where(eq(schema.aiPredictions.caseId, caseId))
  .orderBy(desc(schema.aiPredictions.createdAt));
```

- 감사 로그(중요도 HIGH만 최근 50건)
```ts
const logs = await db.select().from(schema.auditLogs)
  .where(eq(schema.auditLogs.severity, 'HIGH'))
  .orderBy(desc(schema.auditLogs.timestamp))
  .limit(50);
```

---

## 13) 변경 이력

- 2025-09-13: 최초 작성(스키마/연계/운영/전환 가이드 포함)
