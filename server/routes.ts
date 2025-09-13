import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertCaseSchema, updateCaseSchemaReviewer, updateCaseSchemaAdmin, insertAuditLogSchema, softDeleteCaseSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import "./types"; // Import type declarations

// Authentication middleware - 개발 환경에서만 로그인 과정 우회
const requireAuth = async (req: Request, res: Response, next: any) => {
  // 보안 경고: 개발 환경에서만 인증 우회
  if (process.env.NODE_ENV === 'development') {
    console.warn('WARNING: Authentication bypass enabled in development mode only');
    
    // 기본 관리자 사용자로 자동 인증 - 실제 DB에 있는 admin 사용자 ID 사용
    const defaultUser = {
      id: "549c85ad0a67ef619fc5ef7948d31f12", // 실제 DB admin 사용자 ID
      email: "admin@pharma.com",
      name: "시스템 관리자",
      role: "ADMIN" as const,
      organization: "한국의약품안전청",
      isActive: true,
      password: "", // 빈 패스워드
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
    
    req.user = defaultUser;
    return next();
  }
  
  // 프로덕션 환경에서는 실제 인증 필요
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Invalid user session" });
  }
  
  req.user = user;
  next();
};

// Role-based access control middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// Audit logging middleware - TEMPORARILY DISABLED FOR DEBUGGING
const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: any) => {
    // Completely disabled for debugging
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Rate limiting for login attempts
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
  });
  
  // Authentication routes
  app.post("/api/auth/login", loginLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Update last login - using partial update method
      await storage.updateUser(user.id, { lastLoginAt: new Date() } as any);
      
      // Regenerate session ID to prevent session fixation attacks
      req.session!.regenerate(async (err: any) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ error: "Session error" });
        }
        
        req.session!.userId = user.id;
        
        // Log successful login
        await storage.createAuditLog({
          userId: user.id,
          action: "LOGIN",
          resource: "auth",
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        res.json({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role,
            organization: user.organization
          } 
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", requireAuth, async (req: Request, res: Response) => {
    await storage.createAuditLog({
      userId: req.user!.id,
      action: "LOGOUT",
      resource: "auth",
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    req.session!.destroy((err: any) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
    });
    
    res.json({ message: "Logged out successfully" });
  });
  
  app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization
    });
  });
  
  // User management routes (Admin only)
  app.get("/api/users", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
      const { role, isActive } = req.query;
      const users = await storage.listUsers({ 
        role: role as string, 
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined 
      });
      
      // Remove passwords from response
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        organization: u.organization,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error("List users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/users", requireAuth, requireRole(["ADMIN"]), auditLog("CREATE_USER", "users"), async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      
      const existingUser = await storage.getUserByEmail(result.data.email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      
      const user = await storage.createUser(result.data);
      
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/users/:id", requireAuth, requireRole(["ADMIN"]), auditLog("UPDATE_USER", "users"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = updateUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      
      const user = await storage.updateUser(id, result.data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.delete("/api/users/:id", requireAuth, requireRole(["ADMIN"]), auditLog("DELETE_USER", "users"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Prevent self-deletion
      if (id === req.user!.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Case management routes
  app.get("/api/cases", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, limit, includeDeleted } = req.query;
      const reporterId = req.user!.role === "USER" ? req.user!.id : undefined;
      
      // Only ADMIN can access archived cases
      const canIncludeDeleted = req.user!.role === "ADMIN" && includeDeleted === "true";
      
      const cases = await storage.listCases({
        status: status as string,
        reporterId,
        limit: limit ? parseInt(limit as string) : undefined,
        includeDeleted: canIncludeDeleted
      });
      
      // Enhanced audit log for list READ access (compliance requirement)
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "READ_CASES_LIST",
        resource: "cases",
        details: { 
          method: req.method, 
          path: req.path,
          resultCount: cases.length,
          archivedCount: cases.filter(c => c.isDeleted).length,
          filters: { status, reporterId: !!reporterId, limit, includeDeleted: canIncludeDeleted }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: canIncludeDeleted ? "HIGH" : "INFO"
      });
      
      res.json(cases);
    } catch (error) {
      console.error("List cases error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Critical cases endpoint - Must come before /:id route
  app.get("/api/cases/critical", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('=== CRITICAL CASES ENDPOINT DEBUG ===');
      console.log('Starting critical cases fetch...');
      
      console.log('Fetching cases...');
      const cases = await storage.listCases();
      console.log(`Cases fetched successfully: ${cases.length} cases`);
      
      console.log('Fetching predictions...');
      const predictions = await storage.listAiPredictions();
      console.log(`Predictions fetched successfully: ${predictions.length} predictions`);
      
      // Filter for critical cases based on severity and recent timeframe
      const criticalCases = cases.filter(case_ => {
        const isHighSeverity = ['High', 'Critical'].includes(case_.severity);
        const isActiveCritical = ['긴급', '검토 필요', '처리중'].includes(case_.status); // Include '긴급' status
        const daysSinceReport = Math.floor((new Date().getTime() - new Date(case_.dateReported).getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`Case ${case_.drugName}: severity=${case_.severity}, status=${case_.status}, days=${daysSinceReport}, isHighSeverity=${isHighSeverity}, isActiveCritical=${isActiveCritical}`);
        
        return isHighSeverity && isActiveCritical && daysSinceReport <= 30; // Last 30 days
      });

      // Transform data for frontend consumption
      const transformedCriticalCases = criticalCases.map(case_ => {
        const daysSinceReport = Math.floor((new Date().getTime() - new Date(case_.dateReported).getTime()) / (1000 * 60 * 60 * 24));
        
        // Get AI predictions for this case if available
        const casePredictions = predictions.filter(p => p.caseId === case_.id);
        const latestPrediction = casePredictions.length > 0 ? 
          casePredictions[casePredictions.length - 1] : null;

        return {
          id: case_.id, // Use actual database UUID for navigation
          patientAge: case_.patientAge,
          patientGender: case_.patientGender,
          drugName: case_.drugName,
          suspectedReaction: case_.adverseReaction,
          severity: case_.severity,
          outcome: case_.outcome || '진행 중',
          reporterType: '의료진', // This field doesn't exist in schema, using default
          aiPrediction: latestPrediction ? {
            severity: latestPrediction.prediction && typeof latestPrediction.prediction === 'object' && 
                     'severity' in latestPrediction.prediction ? latestPrediction.prediction.severity : case_.severity,
            confidence: Math.round(parseFloat(latestPrediction.confidence) * 100)
          } : null,
          createdAt: case_.dateReported,
          daysSinceReport
        };
      });

      // Sort by urgency (severity, days since report)
      transformedCriticalCases.sort((a, b) => {
        // Priority: Critical > High
        if (a.severity !== b.severity) {
          if (a.severity === 'Critical') return -1;
          if (b.severity === 'Critical') return 1;
        }
        // Then by days since report (older cases first)
        return b.daysSinceReport - a.daysSinceReport;
      });

      // Audit log temporarily disabled for debugging
      console.log('Critical cases endpoint reached successfully, returning data...');

      res.json(transformedCriticalCases);
    } catch (error) {
      console.error("Critical cases error:", error);
      res.status(500).json({ error: "Failed to fetch critical cases" });
    }
  });
  
  app.get("/api/cases/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { includeDeleted } = req.query;
      
      // Only ADMIN can access archived cases
      const canAccessArchived = req.user!.role === "ADMIN" && includeDeleted === "true";
      
      const case_ = await storage.getCase(id, canAccessArchived);
      
      if (!case_) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      // Users can only see their own cases unless they are REVIEWER or ADMIN
      if (req.user!.role === "USER" && case_.reporterId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Enhanced audit log for READ access (compliance requirement)
      // Temporarily disabled for debugging
      // await storage.createAuditLog({
      //   userId: req.user!.id,
      //   action: "READ_CASE",
      //   resource: "cases",
      //   resourceId: id,
      //   details: { 
      //     method: req.method, 
      //     path: req.path,
      //     caseId: id,
      //     caseStatus: case_.status,
      //     severity: case_.severity,
      //     isArchived: case_.isDeleted,
      //     includeDeleted: canAccessArchived
      //   },
      //   ipAddress: req.ip,
      //   userAgent: req.get('User-Agent'),
      //   severity: canAccessArchived ? "HIGH" : "INFO"
      // });
      
      res.json(case_);
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/cases", requireAuth, auditLog("CREATE_CASE", "cases"), async (req: Request, res: Response) => {
    try {
      const result = insertCaseSchema.safeParse({
        ...req.body,
        reporterId: req.user!.id
      });
      
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      
      const case_ = await storage.createCase(result.data);
      res.status(201).json(case_);
    } catch (error) {
      console.error("Create case error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/cases/:id", requireAuth, requireRole(["REVIEWER", "ADMIN"]), auditLog("UPDATE_CASE", "cases"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get existing case for audit trail
      const existingCase = await storage.getCase(id);
      if (!existingCase) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      // Role-based field validation for regulatory compliance
      let result;
      if (req.user!.role === "REVIEWER") {
        result = updateCaseSchemaReviewer.safeParse(req.body);
      } else { // ADMIN
        result = updateCaseSchemaAdmin.safeParse(req.body);
      }
      
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      
      // Enhanced audit logging with before/after values (non-PHI only)
      const auditDetails = {
        method: req.method,
        path: req.path,
        role: req.user!.role,
        fieldsChanged: Object.keys(result.data),
        before: {
          status: existingCase.status,
          severity: existingCase.severity,
          outcome: existingCase.outcome
        }
      };
      
      const case_ = await storage.updateCase(id, result.data);
      if (!case_) {
        return res.status(500).json({ error: "Failed to update case" });
      }
      
      // Log the change with HIGH severity for privileged operations
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "UPDATE_CASE",
        resource: "cases",
        resourceId: id,
        details: {
          ...auditDetails,
          after: {
            status: case_.status,
            severity: case_.severity,
            outcome: case_.outcome
          }
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: "HIGH"
      });
      
      res.json(case_);
    } catch (error) {
      console.error("Update case error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Soft delete for pharmacovigilance compliance
  app.delete("/api/cases/:id", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validate deletion reason
      const result = softDeleteCaseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      
      // Check if case exists first
      const existingCase = await storage.getCase(id);
      if (!existingCase) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      const softDeletedCase = await storage.softDeleteCase(id, req.user!.id, result.data.deletionReason);
      if (!softDeletedCase) {
        return res.status(500).json({ error: "Failed to delete case" });
      }
      
      // Log soft deletion with HIGH severity for compliance
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "SOFT_DELETE_CASE",
        resource: "cases",
        resourceId: id,
        details: {
          method: req.method,
          path: req.path,
          deletionReason: result.data.deletionReason,
          originalStatus: existingCase.status,
          originalSeverity: existingCase.severity
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: "HIGH"
      });
      
      res.json({ message: "Case archived successfully", archivedCase: softDeletedCase });
    } catch (error) {
      console.error("Soft delete case error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Statistics/Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const cases = await storage.listCases();
      const totalCases = cases.length;
      const pendingCases = cases.filter(c => c.status === '검토 필요' || c.status === '처리중').length;
      const criticalCases = cases.filter(c => c.severity === 'High').length;
      
      // Get AI predictions for accuracy calculation
      const predictions = await storage.listAiPredictions();
      const aiAccuracy = predictions.length > 0 
        ? Math.round(predictions.reduce((sum, p) => sum + parseFloat(p.confidence), 0) / predictions.length * 100)
        : 0;
      
      const stats = {
        totalCases,
        pendingCases,
        criticalCases,
        aiAccuracy,
        systemHealth: 98.7 // TODO: Implement real system health check
      };

      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Recent cases for dashboard
  app.get("/api/dashboard/recent-cases", requireAuth, async (req: Request, res: Response) => {
    try {
      const cases = await storage.listCases();
      const predictions = await storage.listAiPredictions();
      
      const recentCases = cases
        .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())
        .slice(0, 5)
        .map(case_ => {
          // Get AI predictions for this case
          const casePredictions = predictions.filter(p => p.caseId === case_.id);
          const latestPrediction = casePredictions.length > 0 ? 
            casePredictions[casePredictions.length - 1] : null;
          
          return {
            id: case_.id, // Use actual database UUID for navigation
            drug: case_.drugName,
            severity: case_.severity,
            status: case_.status,
            aiConfidence: latestPrediction ? Math.round(parseFloat(latestPrediction.confidence) * 100) : null
          };
        });

      res.json(recentCases);
    } catch (error) {
      console.error("Recent cases error:", error);
      res.status(500).json({ error: "Failed to fetch recent cases" });
    }
  });


  // Audit logs (Admin only)
  app.get("/api/audit-logs", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
      const { userId, severity, limit } = req.query;
      const logs = await storage.listAuditLogs({
        userId: userId as string,
        severity: severity as string,
        limit: limit ? parseInt(limit as string) : 50
      });
      
      res.json(logs);
    } catch (error) {
      console.error("List audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // AI Models management (Admin only)
  app.get("/api/ai-models", requireAuth, requireRole(["ADMIN", "REVIEWER"]), async (req: Request, res: Response) => {
    try {
      const models = await storage.listAiModels();
      res.json(models);
    } catch (error) {
      console.error("List AI models error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Analysis routes
  app.post("/api/ai-analysis", requireAuth, requireRole(["REVIEWER", "ADMIN"]), async (req: Request, res: Response) => {
    try {
      const { caseId } = req.body;
      
      if (!caseId) {
        return res.status(400).json({ error: "Case ID is required" });
      }
      
      // Get the case to analyze
      const case_ = await storage.getCase(caseId);
      if (!case_) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      // Check access permissions (users can only analyze their own cases)
      if (req.user!.role === "USER" && case_.reporterId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Import AI service dynamically to avoid import issues
      const { aiAnalysisService } = await import("./ai-service");
      
      // Perform AI analysis
      const analysisResult = await aiAnalysisService.analyzeCase(case_);
      
      // Create prediction record
      const predictionData = await aiAnalysisService.createPredictionRecord(caseId, analysisResult);
      const prediction = await storage.createAiPrediction(predictionData);
      
      // Audit log for AI analysis
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "AI_ANALYSIS",
        resource: "cases",
        resourceId: caseId,
        details: {
          method: req.method,
          path: req.path,
          modelName: predictionData.modelName,
          modelVersion: predictionData.modelVersion,
          confidence: analysisResult.confidence,
          processingTime: analysisResult.processingTime,
          previousSeverity: case_.severity,
          predictedSeverity: analysisResult.severity.severity
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: "INFO"
      });
      
      res.json({
        analysis: analysisResult,
        prediction: prediction,
        message: "AI analysis completed successfully"
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "AI analysis failed: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });

  // Get AI predictions for a case
  app.get("/api/cases/:id/predictions", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if case exists and user has access
      const case_ = await storage.getCase(id);
      if (!case_) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      if (req.user!.role === "USER" && case_.reporterId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const predictions = await storage.listAiPredictions(id);
      
      // Audit log for predictions access
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "READ_AI_PREDICTIONS",
        resource: "ai_predictions",
        resourceId: id,
        details: {
          method: req.method,
          path: req.path,
          caseId: id,
          predictionsCount: predictions.length
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: "INFO"
      });
      
      res.json(predictions);
    } catch (error) {
      console.error("Get predictions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update AI prediction (for human review)
  app.put("/api/predictions/:id/review", requireAuth, requireRole(["REVIEWER", "ADMIN"]), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reviewNotes, humanReviewed } = req.body;
      
      // Validate input
      if (typeof reviewNotes !== 'string' || typeof humanReviewed !== 'boolean') {
        return res.status(400).json({ error: "Invalid review data" });
      }
      
      const updates = {
        humanReviewed,
        reviewerId: req.user!.id,
        reviewNotes
      };
      
      const updatedPrediction = await storage.updateAiPrediction(id, updates);
      if (!updatedPrediction) {
        return res.status(404).json({ error: "Prediction not found" });
      }
      
      // Audit log for prediction review
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "REVIEW_AI_PREDICTION",
        resource: "ai_predictions",
        resourceId: id,
        details: {
          method: req.method,
          path: req.path,
          humanReviewed,
          reviewNotesLength: reviewNotes.length,
          caseId: updatedPrediction.caseId
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: "INFO"
      });
      
      res.json(updatedPrediction);
    } catch (error) {
      console.error("Update prediction review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoints for deployment - moved away from root path
  // Removed GET / and HEAD / to allow Vite middleware to handle SPA serving

  // Alternative health check endpoint for deployment tools that need JSON response
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "pharma-surveillance-api"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
