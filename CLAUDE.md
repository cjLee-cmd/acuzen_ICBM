# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Korean Drug Surveillance System (약물감시 시스템) - A pharmacovigilance platform for managing adverse drug reaction reports with AI-powered analysis.

## Development Commands

### Core Commands
```bash
# Development
npm run dev          # Start dev server (port 5000)

# Build
npm run build        # Build for production
./build-for-publish.sh  # Build with publishing optimizations

# Database
npm run db:push      # Push database schema changes via Drizzle

# Type Checking
npm run check        # Run TypeScript type checking
```

### Environment Configuration
- Development mode bypasses authentication (see `server/routes.ts` requireAuth middleware)
- Default admin user in dev: admin@pharma.com
- Session secret: Set `SESSION_SECRET` in production
- OpenAI API key required: `OPENAI_API_KEY`

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + Node.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-5 (model from August 2025)

### Database Schema (`shared/schema.ts`)
Key tables with soft-delete support for regulatory compliance:
- `users`: Role-based access (USER/REVIEWER/ADMIN)
- `cases`: Adverse reaction reports with patient/drug/reaction data
- `ai_predictions`: AI analysis results with confidence scores
- `audit_logs`: Complete activity tracking for compliance
- `ai_models`: AI model version management

### API Structure
All API endpoints follow REST patterns under `/api`:
- Authentication handled via Express sessions with PostgreSQL store
- Role-based middleware for access control
- Audit logging middleware for regulatory compliance
- Rate limiting and security headers via Helmet

### Frontend Component Structure
- **App.tsx**: Main router with sidebar navigation
- **Dashboard**: Real-time statistics and recent cases
- **CaseManagement**: CRUD operations for adverse reaction reports
- **CaseDetails**: Individual case view with AI analysis
- **UserManagement**: Admin-only user administration
- **AIModelManagement**: Model performance tracking
- **AuditLogs**: Compliance and activity monitoring

## ICSR Compliance Gap
Current system lacks ICH E2B(R3) standard compliance. Key missing features:
- E2B(R3) XML generation/validation
- MedDRA terminology integration
- Regulatory agency submission APIs (MFDS/FDA/EMA)
- Batch processing capabilities
- Standard ICSR data fields

## AI Service Integration
- Model: GPT-5 (released August 7, 2025)
- Functions: Severity assessment, risk factor identification, regulatory recommendations
- Confidence scoring for all predictions
- Human review workflow for AI outputs

## Security Considerations
- Soft delete for data retention compliance
- Audit logging includes sanitized details only (no PII in logs)
- Session-based authentication with secure cookies
- Role-based access control at API and UI levels
- CSP headers configured for production

## Database Migrations
Uses Drizzle ORM for schema management:
- Schema defined in `shared/schema.ts`
- Push changes with `npm run db:push`
- Automatic session table creation
- Seed data in `server/seed.ts`

## Deployment
- Static deployment target configured in `.replit`
- Build outputs to `dist/` directory
- Publishing script moves assets to correct locations
- Port 5000 for local development