import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import helmet from "helmet";
import { db } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();

// Trust proxy for proper IP detection and secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Security headers - strict CSP for production, relaxed for development
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for UI components
      scriptSrc: ["'self'"], // No unsafe-eval for production security
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"], // Restricted to self for production
      objectSrc: ["'none'"], // Prevent plugin content injection
      baseUri: ["'self'"], // Prevent base tag injection
      formAction: ["'self'"], // Restrict form submissions
      frameAncestors: ["'self'"], // Prevent clickjacking
      fontSrc: ["'self'", "data:"], // Allow web fonts
      manifestSrc: ["'self'"], // Web app manifest
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session store configuration using MemoryStore for development
const SessionStore = MemoryStore(session);

// Session configuration with security hardening
app.use(session({
  store: new SessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
  name: 'pharma.sid', // Custom session name
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiry on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Only log basic request info for security - never log response bodies
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

// Initialize database separately from server startup
async function initializeDatabase() {
  try {
    console.log("Checking database initialization...");
    await seedDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
    console.log('Database initialization failed, but server will continue to start');
    // Don't throw - continue with server startup even if database init fails
  }
}

// Main server startup function
async function startServer() {
  let server;
  
  try {
    server = await registerRoutes(app);

    // Health endpoint for API status checking
    app.head("/api", (_req, res) => res.sendStatus(200));
    app.get("/api", (_req, res) => res.json({ status: "ok" }));

    // Note: Removed catch-all API route to allow registered routes to work properly
    // The registerRoutes() function handles all valid API endpoints
    // Invalid API requests will naturally return 404 from Express

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log the error for debugging but don't crash the server
      console.error('Express error handler:', err);
      
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
      // Don't throw - this would crash the process
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    
    // Force development mode if NODE_ENV is not set
    const environment = process.env.NODE_ENV || "development";
    console.log(`Environment detected: ${environment}, app.get("env"): ${app.get("env")}`);
    
    if (environment === "development") {
      console.log("Setting up Vite development server...");
      await setupVite(app, server);
    } else {
      console.log("Setting up static file serving...");
      serveStatic(app);
    }
  } catch (error) {
    console.error('Error during server setup:', error);
    console.log('Server setup had issues, but attempting to start anyway');
    // Continue to server.listen even if setup has issues
  }

  // ALWAYS attempt to start the server, regardless of previous errors
  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Ensure we have a server object - create basic one if needed
  if (!server) {
    console.log('Creating basic HTTP server as fallback');
    const { createServer } = await import("http");
    server = createServer(app);
  }
  
  server.listen({
    port,
    host: "localhost",
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handlers
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  return server;
}

// Start the application
(async () => {
  // Initialize database first (but don't let it block server startup)
  await initializeDatabase();
  
  // Always start the server
  await startServer();
})();
