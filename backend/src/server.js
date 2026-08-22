import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { initDB } from './db.js';

import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import foodsRouter from './routes/foods.js';
import restaurantsRouter from './routes/restaurants.js';
import ordersRouter from './routes/orders.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
const uploadDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : path.resolve('uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Ignored in serverless
}
app.use('/uploads', express.static(uploadDir));
app.use('/api/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Diagnostic database test endpoint
app.get(['/api/test-db', '/test-db'], async (req, res) => {
  try {
    const { pool } = await import('./db.js');
    const [rows] = await pool.query('SELECT 1 as connected, DATABASE() as current_db, NOW() as server_time');
    res.json({
      success: true,
      message: 'TiDB Cloud Database connected successfully!',
      data: rows[0],
      env: {
        host: process.env.DB_HOST ? `${process.env.DB_HOST.substring(0, 15)}...` : 'NOT_SET',
        user: process.env.DB_USER ? `${process.env.DB_USER.substring(0, 8)}...` : 'NOT_SET',
        database: process.env.DB_NAME || 'NOT_SET',
      }
    });
  } catch (err) {
    console.error('TiDB Cloud diagnostic error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
      envState: {
        hostSet: !!process.env.DB_HOST,
        userSet: !!process.env.DB_USER,
        passwordSet: !!process.env.DB_PASSWORD,
        dbSet: !!process.env.DB_NAME,
      }
    });
  }
});

// Root welcome status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Snack Exchange Express API',
    endpoints: {
      categories: '/api/categories',
      foods: '/api/foods',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      health: '/api/health',
      testDb: '/api/test-db',
    },
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Snack Exchange Express API',
    endpoints: {
      categories: '/api/categories',
      foods: '/api/foods',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      health: '/api/health',
      testDb: '/api/test-db',
    },
  });
});

// Mount routes at /api context path
const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/foods', foodsRouter);
apiRouter.use('/restaurants', restaurantsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/upload', uploadRouter);

app.use('/api', apiRouter);
// Also mount at root for versatility
app.use('/auth', authRouter);
app.use('/categories', categoriesRouter);
app.use('/foods', foodsRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/orders', ordersRouter);
app.use('/upload', uploadRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
});

// Start standalone HTTP server if not running in a serverless environment
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  initDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Snack Exchange Express API running on http://localhost:${PORT}/api`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to database or initialize tables:', err.message);
      app.listen(PORT, () => {
        console.log(`⚠️ Express API running on http://localhost:${PORT}/api (with DB connection pending)`);
      });
    });
}

export default app;


