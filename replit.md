# Drug Surveillance System

## Overview

The Drug Surveillance System is a comprehensive pharmacovigilance platform designed for healthcare organizations and regulatory agencies to collect, analyze, and manage adverse drug reaction reports. The system leverages AI-powered analysis using GPT-5 to provide automated severity assessments and recommendations for drug safety cases. It supports role-based access control with three user levels (USER, REVIEWER, ADMIN) and maintains regulatory compliance through comprehensive audit logging and case management workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design system following Material Design principles
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Light/dark mode support with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL-backed sessions with express-session
- **Security**: Helmet.js for security headers, CSRF protection, rate limiting
- **Authentication**: Session-based authentication with bcrypt password hashing
- **API Design**: RESTful endpoints with role-based middleware protection

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: Users, Cases, AI Predictions, Audit Logs, AI Models
- **Data Integrity**: Foreign key constraints, enum types for status fields
- **Audit Trail**: Comprehensive logging of all user actions and system events

### AI Integration
- **Model**: OpenAI GPT-5 (latest model as of August 2025)
- **Capabilities**: Automated severity assessment, risk factor identification, regulatory recommendations
- **Analysis Pipeline**: Structured prompts for pharmacovigilance case evaluation
- **Performance Tracking**: Response time monitoring and accuracy metrics

### Security & Compliance
- **Authentication**: Session-based with secure cookie configuration
- **Authorization**: Role-based access control (USER/REVIEWER/ADMIN)
- **Data Protection**: Input validation, SQL injection prevention, XSS protection
- **Audit Logging**: Immutable audit trail for regulatory compliance
- **CSRF Protection**: Token-based CSRF prevention
- **Rate Limiting**: API endpoint protection against abuse

### Development & Deployment
- **Build System**: Vite for development and production builds
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint configuration for consistent code standards
- **Hot Reload**: Development server with HMR support
- **Asset Management**: Optimized bundling and code splitting

## External Dependencies

### Core Services
- **OpenAI API**: GPT-5 model for AI-powered case analysis and severity assessment
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Infrastructure**: Development and hosting environment

### Third-Party Libraries
- **UI Framework**: React 18 with Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Database**: Drizzle ORM with Neon serverless PostgreSQL adapter
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Security**: Helmet.js, rate limiting middleware, CSRF protection
- **Data Fetching**: TanStack React Query for server state management
- **Validation**: Zod schema validation for type-safe data handling

### Development Tools
- **Build Tool**: Vite with TypeScript and React plugins
- **Code Quality**: ESLint for linting, Prettier for formatting
- **Type Checking**: TypeScript compiler with strict mode enabled
- **Package Management**: npm with lock file for dependency versioning

### Fonts & Assets
- **Typography**: Google Fonts (Inter, JetBrains Mono) for consistent typography
- **Icons**: Lucide React for consistent iconography
- **Images**: Local asset management through Vite's asset pipeline