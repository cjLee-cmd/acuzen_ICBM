CREATE TYPE "public"."case_status" AS ENUM('긴급', '검토 필요', '처리중', '완료');--> statement-breakpoint
CREATE TYPE "public"."log_severity" AS ENUM('INFO', 'WARNING', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('Low', 'Medium', 'High', 'Critical');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'REVIEWER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"accuracy" numeric(5, 2),
	"avg_response_time" integer,
	"total_predictions" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_predictions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" varchar NOT NULL,
	"model_name" text NOT NULL,
	"model_version" text NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"prediction" jsonb NOT NULL,
	"recommendation" text,
	"processing_time" numeric(8, 3),
	"human_reviewed" boolean DEFAULT false NOT NULL,
	"reviewer_id" varchar,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"severity" "log_severity" DEFAULT 'INFO' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text NOT NULL,
	"patient_age" integer NOT NULL,
	"patient_gender" text NOT NULL,
	"drug_name" text NOT NULL,
	"drug_dosage" text,
	"adverse_reaction" text NOT NULL,
	"reaction_description" text,
	"severity" "severity" NOT NULL,
	"status" "case_status" DEFAULT '검토 필요' NOT NULL,
	"reporter_id" varchar NOT NULL,
	"date_reported" timestamp DEFAULT now() NOT NULL,
	"date_of_reaction" timestamp,
	"concomitant_meds" jsonb,
	"medical_history" text,
	"outcome" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" varchar,
	"deletion_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"organization" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;