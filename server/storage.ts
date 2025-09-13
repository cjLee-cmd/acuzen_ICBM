import { 
  users, 
  cases, 
  aiPredictions, 
  auditLogs, 
  aiModels,
  type User, 
  type InsertUser,
  type Case,
  type InsertCase,
  type AiPrediction,
  type InsertAiPrediction,
  type AuditLog,
  type InsertAuditLog,
  type AiModel,
  type InsertAiModel,
  type SoftDeleteCase
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  listUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]>;
  
  // Case methods
  getCase(id: string, includeDeleted?: boolean): Promise<Case | undefined>;
  listCases(filters?: { status?: string; reporterId?: string; limit?: number; includeDeleted?: boolean }): Promise<Case[]>;
  createCase(case_: InsertCase): Promise<Case>;
  updateCase(id: string, updates: Partial<InsertCase>): Promise<Case | undefined>;
  deleteCase(id: string): Promise<boolean>;
  softDeleteCase(id: string, deletedBy: string, reason: string): Promise<Case | undefined>;
  
  // AI Prediction methods
  getAiPrediction(id: string): Promise<AiPrediction | undefined>;
  createAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction>;
  updateAiPrediction(id: string, updates: Partial<InsertAiPrediction>): Promise<AiPrediction | undefined>;
  listAiPredictions(caseId?: string): Promise<AiPrediction[]>;
  
  // Audit Log methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  listAuditLogs(filters?: { userId?: string; severity?: string; limit?: number }): Promise<AuditLog[]>;
  
  // AI Model methods
  getAiModel(id: string): Promise<AiModel | undefined>;
  listAiModels(): Promise<AiModel[]>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;
  updateAiModel(id: string, updates: Partial<InsertAiModel>): Promise<AiModel | undefined>;
  
  // Authentication helper
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // Helper method to generate IDs
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(user.password);
    const id = this.generateId();
    const now = new Date();
    const [newUser] = await db
      .insert(users)
      .values({ 
        ...user, 
        id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async listUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    const where = and(
      filters?.role ? eq(users.role, filters.role as any) : undefined,
      filters?.isActive !== undefined ? eq(users.isActive, filters.isActive) : undefined
    );
    
    return await db.select().from(users).where(where).orderBy(desc(users.createdAt));
  }

  // Case methods
  async getCase(id: string, includeDeleted: boolean = false): Promise<Case | undefined> {
    const where = includeDeleted 
      ? eq(cases.id, id)
      : and(eq(cases.id, id), eq(cases.isDeleted, false));
    
    const [case_] = await db.select().from(cases).where(where);
    return case_ || undefined;
  }

  async listCases(filters?: { status?: string; reporterId?: string; limit?: number; includeDeleted?: boolean }): Promise<Case[]> {
    const where = and(
      filters?.status ? eq(cases.status, filters.status as any) : undefined,
      filters?.reporterId ? eq(cases.reporterId, filters.reporterId) : undefined,
      !filters?.includeDeleted ? eq(cases.isDeleted, false) : undefined
    );
    
    const base = db.select().from(cases).where(where).orderBy(desc(cases.createdAt));
    return filters?.limit ? await base.limit(filters.limit) : await base;
  }

  async createCase(case_: InsertCase): Promise<Case> {
    // Generate case number with timestamp for uniqueness
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    const caseNumber = `CSE-${year}-${timestamp.toString().slice(-6)}`;
    const id = this.generateId();
    const now = new Date();
    
    const [newCase] = await db
      .insert(cases)
      .values({ 
        ...case_, 
        id,
        caseNumber,
        dateReported: now,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newCase;
  }

  async updateCase(id: string, updates: Partial<InsertCase>): Promise<Case | undefined> {
    // Enforce reporterId immutability at storage level for compliance
    const { reporterId, ...allowedUpdates } = updates;
    
    const [updatedCase] = await db
      .update(cases)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(and(eq(cases.id, id), eq(cases.isDeleted, false)))
      .returning();
    return updatedCase || undefined;
  }

  async deleteCase(id: string): Promise<boolean> {
    // Legacy hard delete method - kept for compatibility but deprecated
    // Use softDeleteCase for pharmacovigilance compliance
    const result = await db.delete(cases).where(eq(cases.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async softDeleteCase(id: string, deletedBy: string, reason: string): Promise<Case | undefined> {
    const [deletedCase] = await db
      .update(cases)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        deletionReason: reason,
        updatedAt: new Date()
      })
      .where(and(eq(cases.id, id), eq(cases.isDeleted, false)))
      .returning();
    return deletedCase || undefined;
  }

  // AI Prediction methods
  async getAiPrediction(id: string): Promise<AiPrediction | undefined> {
    const [prediction] = await db.select().from(aiPredictions).where(eq(aiPredictions.id, id));
    return prediction || undefined;
  }

  async createAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction> {
    const id = this.generateId();
    const now = new Date();
    const [newPrediction] = await db
      .insert(aiPredictions)
      .values({ ...prediction, id, createdAt: now })
      .returning();
    return newPrediction;
  }

  async updateAiPrediction(id: string, updates: Partial<InsertAiPrediction>): Promise<AiPrediction | undefined> {
    const [updatedPrediction] = await db
      .update(aiPredictions)
      .set(updates)
      .where(eq(aiPredictions.id, id))
      .returning();
    return updatedPrediction || undefined;
  }

  async listAiPredictions(caseId?: string): Promise<AiPrediction[]> {
    const where = caseId ? eq(aiPredictions.caseId, caseId) : undefined;
    
    return await db.select().from(aiPredictions).where(where).orderBy(desc(aiPredictions.createdAt));
  }

  // Audit Log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.generateId();
    const now = new Date();
    const [newLog] = await db
      .insert(auditLogs)
      .values({ ...log, id, timestamp: now })
      .returning();
    return newLog;
  }

  async listAuditLogs(filters?: { userId?: string; severity?: string; limit?: number }): Promise<AuditLog[]> {
    const where = and(
      filters?.userId ? eq(auditLogs.userId, filters.userId) : undefined,
      filters?.severity ? eq(auditLogs.severity, filters.severity as any) : undefined
    );
    
    const base = db.select().from(auditLogs).where(where).orderBy(desc(auditLogs.timestamp));
    return filters?.limit ? await base.limit(filters.limit) : await base;
  }

  // AI Model methods
  async getAiModel(id: string): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model || undefined;
  }

  async listAiModels(): Promise<AiModel[]> {
    return await db.select().from(aiModels).orderBy(desc(aiModels.createdAt));
  }

  async createAiModel(model: InsertAiModel): Promise<AiModel> {
    const id = this.generateId();
    const now = new Date();
    const [newModel] = await db
      .insert(aiModels)
      .values({ ...model, id, createdAt: now, lastUpdated: now })
      .returning();
    return newModel;
  }

  async updateAiModel(id: string, updates: Partial<InsertAiModel>): Promise<AiModel | undefined> {
    const [updatedModel] = await db
      .update(aiModels)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(aiModels.id, id))
      .returning();
    return updatedModel || undefined;
  }

  // Authentication helpers
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const storage = new DatabaseStorage();
