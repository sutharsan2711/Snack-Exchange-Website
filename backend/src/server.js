import express from 'express';
import cors from 'cors';
import path from 'path';
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
const uploadDir = path.resolve('uploads');
app.use('/uploads', express.static(uploadDir));
app.use('/api/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Root welcome status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Snack Exchange Express API',
    database: dbInitialized ? 'Connected' : 'Ready',
    endpoints: {
      categories: '/api/categories',
      foods: '/api/foods',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      health: '/api/health',
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

// Lazy DB initialization for serverless environments (Vercel)
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (err) {
      console.warn('DB initialization check:', err.message);
    }
  }
  next();
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

