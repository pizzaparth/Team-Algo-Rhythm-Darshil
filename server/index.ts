/**
 * server/index.ts
 * Server entry point — Express app with all middleware, routes, and startup.
 *
 * Architecture:
 *   Frontend (Vite dev) → /api/v1/* → Express backend
 *   In production: static files served by Express too
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =============================================
// Initialize database FIRST (before any route imports)
// =============================================
import { getDb } from './database/db.js';
getDb(); // Runs schema migration on startup

// =============================================
// Import routes & middleware
// =============================================
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import sessionRoutes from './routes/sessions.js';
import fileRoutes from './routes/files.js';
import searchRoutes from './routes/search.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { jobQueue } from './jobs/jobQueue.js';

// =============================================
// App configuration
// =============================================

const app = express();
const PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 3002);
const IS_PROD = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:3001';

// =============================================
// Security & General Middleware
// =============================================

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, // Handled by Vite in dev
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: IS_PROD ? ALLOWED_ORIGIN : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Export-Id'],
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts' } },
});

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
  skip: (req) => req.url === '/api/v1/health',
}));

// =============================================
// Routes
// =============================================

const API = '/api/v1';

app.get(`${API}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '5.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.use(`${API}/auth`, authLimiter, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/projects`, projectRoutes);
app.use(`${API}/sessions`, sessionRoutes);
app.use(`${API}/files`, fileRoutes);
app.use(`${API}/search`, searchRoutes);
app.use(`${API}/ai`, aiRoutes);

// Serve static frontend in production
if (IS_PROD) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// =============================================
// Start server
// =============================================

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ API Server running on http://localhost:${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
  logger.info(`   Database: ${process.env.DATABASE_PATH ?? 'data/workspace.db'}`);
  logger.info(`   CORS origin: ${IS_PROD ? ALLOWED_ORIGIN : '*'}`);

  // Start background job ticker
  jobQueue.startTicker();
  logger.info('   Job queue: started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => {
    import('./database/db.js').then(({ closeDb }) => {
      closeDb();
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down');
  server.close(() => process.exit(0));
});

export default app;
