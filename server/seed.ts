import { db } from "./db";
import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log("Checking database initialization...");
    
    // Check if users already exist
    const existingAdmin = await storage.getUserByEmail("admin@pharma.com");
    const existingReviewer = await storage.getUserByEmail("reviewer@pharma.com");
    const existingUser = await storage.getUserByEmail("user@pharma.com");
    
    if (existingAdmin && existingReviewer && existingUser) {
      console.log("Database already initialized with seed data.");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
    // Create admin user if doesn't exist
    let admin = existingAdmin;
    if (!admin) {
      admin = await storage.createUser({
        email: "admin@pharma.com",
        name: "시스템 관리자",
        password: "admin123!",
        role: "ADMIN",
        organization: "한국의약품안전청",
        isActive: true
      });
      console.log("Created admin user:", admin.email);
    }
    
    // Create reviewer user if doesn't exist
    let reviewer = existingReviewer;
    if (!reviewer) {
      reviewer = await storage.createUser({
        email: "reviewer@pharma.com", 
        name: "검토자",
        password: "reviewer123!",
        role: "REVIEWER",
        organization: "한국의약품안전청",
        isActive: true
      });
      console.log("Created reviewer user:", reviewer.email);
    }
    
    // Create regular user if doesn't exist
    let user = existingUser;
    if (!user) {
      user = await storage.createUser({
        email: "user@pharma.com",
        name: "일반 사용자", 
        password: "user123!",
        role: "USER",
        organization: "종합병원",
        isActive: true
      });
      console.log("Created regular user:", user.email);
    }
    
    // Check and create AI model if doesn't exist
    try {
      const existingModels = await storage.listAiModels();
      if (existingModels.length === 0) {
        const aiModel = await storage.createAiModel({
          name: "Adverse Event Classifier",
          version: "1.0.0",
          status: "Active",
          accuracy: "89.5",
          avgResponseTime: 1200,
          totalPredictions: 0
        });
        console.log("Created AI Model:", aiModel.name);
      }
    } catch (error) {
      console.log("AI model creation skipped (may already exist)");
    }
    
    console.log("Database initialization completed!");
    
  } catch (error) {
    console.error("Error during database initialization:", error);
    // Don't throw error to prevent server startup failure
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };