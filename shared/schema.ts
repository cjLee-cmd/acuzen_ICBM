import { sql, relations } from "drizzle-orm";
import { 
  sqliteTable, 
  text, 
  integer, 
  real,
  blob
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("USER"), // USER, REVIEWER, ADMIN
  organization: text("organization"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Cases table for adverse drug reactions
export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  patientAge: integer("patient_age").notNull(),
  patientGender: text("patient_gender").notNull(),
  drugName: text("drug_name").notNull(),
  drugDosage: text("drug_dosage"),
  adverseReaction: text("adverse_reaction").notNull(),
  reactionDescription: text("reaction_description"),
  severity: text("severity").notNull(), // Low, Medium, High, Critical
  status: text("status").notNull().default("검토 필요"), // 긴급, 검토 필요, 처리중, 완료
  reporterId: text("reporter_id").notNull().references(() => users.id),
  dateReported: integer("date_reported", { mode: "timestamp" }).notNull(),
  dateOfReaction: integer("date_of_reaction", { mode: "timestamp" }),
  concomitantMeds: text("concomitant_meds"), // JSON as text
  medicalHistory: text("medical_history"),
  outcome: text("outcome"),
  // Soft delete fields for pharmacovigilance compliance
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  deletedBy: text("deleted_by").references(() => users.id),
  deletionReason: text("deletion_reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// AI predictions table
export const aiPredictions = sqliteTable("ai_predictions", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  modelName: text("model_name").notNull(),
  modelVersion: text("model_version").notNull(),
  confidence: real("confidence").notNull(),
  prediction: text("prediction").notNull(), // JSON as text
  recommendation: text("recommendation"),
  processingTime: real("processing_time"),
  humanReviewed: integer("human_reviewed", { mode: "boolean" }).notNull().default(false),
  reviewerId: text("reviewer_id").references(() => users.id),
  reviewNotes: text("review_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Audit logs table
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: text("details"), // JSON as text
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  severity: text("severity").notNull().default("INFO"), // INFO, WARNING, HIGH
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

// AI models table
export const aiModels = sqliteTable("ai_models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("Active"),
  accuracy: real("accuracy"),
  avgResponseTime: integer("avg_response_time"),
  totalPredictions: integer("total_predictions").notNull().default(0),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reportedCases: many(cases),
  auditLogs: many(auditLogs),
  aiPredictionReviews: many(aiPredictions),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  reporter: one(users, {
    fields: [cases.reporterId],
    references: [users.id],
  }),
  deletedByUser: one(users, {
    fields: [cases.deletedBy],
    references: [users.id],
  }),
  aiPredictions: many(aiPredictions),
}));

export const aiPredictionsRelations = relations(aiPredictions, ({ one }) => ({
  case: one(cases, {
    fields: [aiPredictions.caseId],
    references: [cases.id],
  }),
  reviewer: one(users, {
    fields: [aiPredictions.reviewerId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Schema types for validation
export const insertUserSchema = createInsertSchema(users);
export const insertCaseSchema = createInsertSchema(cases);
export const insertAiPredictionSchema = createInsertSchema(aiPredictions);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertAiModelSchema = createInsertSchema(aiModels);

// Update schemas
export const updateUserSchema = insertUserSchema.partial().omit({ id: true, createdAt: true });
export const updateCaseSchemaReviewer = insertCaseSchema.partial().omit({ 
  id: true, 
  caseNumber: true, 
  createdAt: true,
  reporterId: true,
  isDeleted: true,
  deletedAt: true,
  deletedBy: true,
  deletionReason: true 
});
export const updateCaseSchemaAdmin = insertCaseSchema.partial().omit({ 
  id: true, 
  caseNumber: true, 
  createdAt: true 
});
export const softDeleteCaseSchema = z.object({
  deletionReason: z.string().min(1, "Deletion reason is required"),
});

// User roles
export const USER_ROLES = ["USER", "REVIEWER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Case statuses
export const CASE_STATUSES = ["긴급", "검토 필요", "처리중", "완료"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

// Severity levels
export const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

// Log severity levels
export const LOG_SEVERITY_LEVELS = ["INFO", "WARNING", "HIGH"] as const;
export type LogSeverityLevel = (typeof LOG_SEVERITY_LEVELS)[number];