import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { readOnlyMode } from './middleware/readOnlyMode.js';
import importsRouter from './routes/imports.js';
import leadsRouter from './routes/leads.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * CORS allowlist:
 * - Vercel prod: https://ai-sales-ops-copilot.vercel.app
 * - Vercel preview: https://ai-sales-ops-copilot-*-daniel369-projects.vercel.app
 * - Local dev: http://localhost:5173 (and common alternates)
 * - Extra explicit origins via env: CORS_ORIGIN="https://x.com,https://y.com"
 */
const VERCEL_PROD = 'https://ai-sales-ops-copilot.vercel.app';

const VERCEL_PREVIEW_REGEX =
  /^https:\/\/ai-sales-ops-copilot-[a-z0-9-]+-daniel369-projects\.vercel\.app$/i;

const LOCAL_ALLOWED = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const allowedExact = new Set(
  (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow server-to-server/curl (no Origin header)
    if (!origin) return cb(null, true);

    if (allowedExact.has(origin)) return cb(null, true);
    if (LOCAL_ALLOWED.has(origin)) return cb(null, true);

    if (origin === VERCEL_PROD) return cb(null, true);
    if (VERCEL_PREVIEW_REGEX.test(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight
app.use(express.json());
app.use(readOnlyMode);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    readOnly: process.env.READ_ONLY_MODE === 'true',
  });
});

// Root route (nice for Render base URL checks)
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'ai-sales-ops-backend' });
});

// Routes
app.use('/api/imports', importsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/stats', statsRouter);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
