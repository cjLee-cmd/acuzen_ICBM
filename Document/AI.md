# 인공지능( AI ) 사용 개요

이 문서는 본 시스템에서 사용하는 인공지능 기능의 목적, 동작 흐름, 데이터 스키마, API, 보안/감사 고려사항을 코드 기준으로 정리합니다. (기준 소스: `server/ai-service.ts`, `server/routes.ts`, `shared/schema.ts`)

## 목적과 범위
- 목적: 약물이상반응(ADR) 보고 케이스에 대해 자동 심각도(severity) 평가와 후속 조치(recommendations)를 제안합니다.
- 사용자 범위: 기본적으로 REVIEWER/ADMIN 권한 사용자가 수동으로 AI 분석을 트리거합니다. 사용자(USER)는 자신의 케이스만 접근 가능하며, AI 분석 트리거 권한은 없음.

## 아키텍처 개요
- 프런트엔드: 케이스 생성/조회 UI. 대시보드에서 최근 케이스/중요 케이스에 AI 예측 결과 일부를 표시.
- 백엔드(Express):
  - `POST /api/ai-analysis`: 특정 케이스에 대해 AI 분석 실행(권한 필요)
  - `GET  /api/cases/:id/predictions`: 케이스별 AI 예측 이력 조회
  - `GET  /api/dashboard/*`: 대시보드 통계/리스트 구성 시 AI 예측값 일부 활용
- AI 서비스: `server/ai-service.ts` 내 `AIAnalysisService`
  - OpenAI Chat Completions API를 호출해 JSON 결과를 수신/파싱
  - 결과를 `ai_predictions` 테이블에 저장할 레코드로 변환

## 모델 및 공급자 설정
- 라이브러리: `openai` NPM 패키지 사용
- 환경 변수: `OPENAI_API_KEY`
- 코드 상의 모델 식별자: `modelName = "gpt-5"`, `modelVersion = "2025-08-07"`
  - 주의: 실제 사용 가능성/버전은 운영 환경과 계정 권한에 따라 다를 수 있습니다. 코드 값은 설정 상수이며 필요 시 변경 가능합니다.

## 프롬프트 설계(요약)
- System Prompt: ICH E2B 등 국제 PV 기준을 고려하여
  - 심각도 등급(Low/Medium/High/Critical), 근거(reasoning), 위험 요인(riskFactors)
  - 조치 권고(immediateActions/followUp/regulatoryNotifications/additionalData)
  - JSON 포맷으로 엄격히 응답하도록 지시
- User Prompt: 케이스 개별 값(성별/나이/약물/반응/진행상태/발현일 등)을 포함

## 데이터 스키마(요약)
- 테이블: `ai_predictions` (파일: `shared/schema.ts`)
  - `id: text` (PK)
  - `caseId: text` (FK to `cases.id`)
  - `modelName: text`
  - `modelVersion: text`
  - `confidence: real` (0~1)
  - `prediction: text` (JSON 문자열. 구조: 아래 "분석 결과 구조" 참조)
  - `recommendation: text` (요약 문자열)
  - `processingTime: real` (초)
  - `humanReviewed: boolean` (기본 false)
  - `reviewerId: text` (선택)
  - `reviewNotes: text` (선택)
  - `createdAt: timestamp`

### 분석 결과 구조(AIAnalysisResult)
- `severity`:
  - `severity: "Low"|"Medium"|"High"|"Critical"`
  - `confidence: number (0~1)`
  - `reasoning: string`
  - `riskFactors: string[]`
- `recommendations`:
  - `immediateActions: string[]`
  - `followUpRequired: string[]`
  - `regulatoryNotifications: string[]`
  - `additionalDataNeeded: string[]`
- `confidence: number (0~1)` (모델 전반 신뢰도)
- `processingTime: number` (초)

AI 호출 응답(`prediction` 컬럼 JSON) 예시:
```json
{
  "severity": {
    "severity": "High",
    "confidence": 0.78,
    "reasoning": "증상 재발 및 입원 필요성...",
    "riskFactors": ["고령", "병용약물"]
  },
  "recommendations": {
    "immediateActions": ["투여 중단", "모니터링 강화"],
    "followUpRequired": ["간기능 재검"],
    "regulatoryNotifications": ["KIDS 보고 고려"],
    "additionalDataNeeded": ["정확한 병용약 목록"]
  },
  "analysisTimestamp": "2025-09-13T09:00:00.000Z"
}
```

## 주요 API

### 1) AI 분석 실행
- Endpoint: `POST /api/ai-analysis`
- 권한: `REVIEWER`, `ADMIN`
- 요청 바디:
```json
{ "caseId": "<케이스 UUID>" }
```
- 응답 바디(요약):
```json
{
  "analysis": { /* AIAnalysisResult(위 구조) */ },
  "prediction": { /* ai_predictions 레코드 */ },
  "message": "AI analysis completed successfully"
}
```
- 동작: 케이스를 조회 → OpenAI API 호출 → 분석 결과 파싱 → `ai_predictions` 저장 → 감사 로그 기록

### 2) 케이스별 AI 예측 조회
- Endpoint: `GET /api/cases/:id/predictions`
- 권한: 인증 필요(USER는 자신의 케이스만)
- 응답: `ai_predictions` 배열(최신순)

### 3) 대시보드 관련
- `GET /api/dashboard/stats`: 전체 케이스 통계와 평균 AI confidence(%) 산출
- `GET /api/dashboard/recent-cases`: 최근 5건 요약정보 + 최신 예측 confidence(%)
- `GET /api/cases/critical`: 최근 30일 고중증(Low/Medium/High/Critical 중 High/Critical) & 활성 상태 케이스 필터링, 최신 AI 예측을 파싱해 요약 제공

## 권한/접근 제어
- `requireAuth`: 개발 모드에서는 편의상 인증 우회(기본 admin 사용자 세션 대체), 운영에서는 세션 기반 인증 필요
- `requireRole(["REVIEWER","ADMIN"])`: AI 분석 실행, 예측 리뷰 수정 등 민감 기능에 역할 기반 접근 통제 적용
- 사용자(USER)는 자신의 케이스만 조회 가능

## 감사(Audit) 및 로깅
- `storage.createAuditLog`를 통해 주요 행위(로그인, 케이스 읽기/수정, AI 분석 실행, 예측 조회/리뷰)를 기록
  - 예: `AI_ANALYSIS`, `READ_AI_PREDICTIONS`, `REVIEW_AI_PREDICTION`
  - `details`는 JSON 문자열로 저장되며, 메소드/경로/모델명/신뢰도/처리시간 등 민감하지 않은 메타를 남김
- 일부 엔드포인트는 현재 디버깅 목적으로 감사 로그가 임시 비활성화되어 있을 수 있음(주석 처리된 블록 참조)

## 에러 처리
- AI 호출 실패 시: `AI analysis failed: <message>` 형태로 500 응답
- 예측 업데이트 검증 실패 시: 400(Bad Request)
- 권한/세션 문제: 401/403 응답
- 공통: 서버 에러 시 500 응답 및 콘솔 로그로 원인 추적

## 환경 변수 / 설정
- `OPENAI_API_KEY`: OpenAI 호출용 API 키
- `PORT`: 서버 포트(로컬 개발 권장값 5010)
- `NODE_ENV`: development/production에 따른 보안 헤더/미들웨어 동작 차이

## 보안/프라이버시 고려사항
- Helmet을 통한 보안 헤더 적용(개발 모드에서 CSP 완화)
- 세션 쿠키: `httpOnly`, `sameSite=strict`(개발/운영에 따라 secure 설정)
- 감사 로그에는 PHI(환자 식별 정보) 저장 지양. 현재 `details`에는 메타 정보 위주
- OpenAI로 전송되는 데이터에는 불필요한 개인식별 정보가 포함되지 않도록 주의(현재 프롬프트는 케이스 요약 중심)

## 운영/운영지표(초안)
- `ai_models` 테이블로 모델 현황/정확도/응답시간 등을 관리(현재 목록 조회 API만 노출). 운영 관점에서 다음이 유용합니다.
  - 모델 교체/비활성화 플래그
  - 일 단위 호출량/에러율 모니터링
  - 프롬프트/스키마 변경 이력 관리

## 향후 개선 제안
- 비동기 처리: AI 분석을 잡 큐(예: BullMQ)로 비동기화하여 API 응답 지연 최소화
- 레이트 리밋: `/api/ai-analysis` 엔드포인트에 별도 레이트 리밋 적용
- 프롬프트/모델 버저닝: 모델/프롬프트 변경을 `ai_models`와 연동해 이력 관리 강화
- 결과 검증 파이프라인: JSON 스키마로 AI 응답 엄격 검증 및 회복 로직 개선
- 마스킹: 외부 전송 전 텍스트 필드 내 개인정보 마스킹 레이어 추가
- 피드백 루프: Human-in-the-loop(리뷰 결과)를 반영한 성능 추적/개선 체계

## 용어
- ADR(Adverse Drug Reaction): 약물이상반응
- ICSR(Individual Case Safety Report): 개별 안전성 보고
- PV(Pharmacovigilance): 의약품 안전성 감시

---
문서 개선이나 자동화(예: 샘플 cURL, OpenAPI 명세 생성)가 필요하면 알려주세요. 실제 배포 환경/정책에 맞춰 모델/프롬프트/로그 전략을 조정할 수 있습니다.
