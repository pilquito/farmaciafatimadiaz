import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seed } from "./seed";

const app = express();

// Crear directorio de uploads si no existe
import { promises as fs } from "fs";
import path from "path";

// Upload router ANTES del body parsing para evitar conflictos
import uploadRouter from "./routes/upload";
app.use("/api/upload", uploadRouter);

// Body parsing solo para rutas que NO sean upload
app.use((req, res, next) => {
  if (req.path.startsWith('/api/upload')) {
    console.log(`[MIDDLEWARE] Saltando body parsing para: ${req.path}`);
    return next();
  }
  console.log(`[MIDDLEWARE] Aplicando body parsing para: ${req.path}`);
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/upload')) {
    return next();
  }
  express.urlencoded({ extended: false })(req, res, next);
});

// Servir archivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Crear directorio de uploads si no existe
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads/staff');
    await fs.mkdir(uploadsDir, { recursive: true });
    log("Directorio de uploads creado correctamente", "info");
  } catch (error) {
    log(`Error creando directorio uploads: ${error}`, "error");
  }
  
  // Inicializar la base de datos con datos de ejemplo
  try {
    await seed();
    log("Base de datos inicializada correctamente", "info");
    
    // Inicializar el servicio de email
    const { initializeEmailService } = await import("./services/emailService");
    await initializeEmailService();
    log("Servicio de email inicializado correctamente", "info");
  } catch (error) {
    log(`Error al inicializar servicios: ${error}`, "error");
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
