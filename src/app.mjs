import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.mjs';
import categoriesRoutes from './routes/categories.routes.mjs';
import productsRoutes from './routes/products.routes.mjs';
import uploadRoutes from './routes/upload.routes.mjs';
import adminRoutes from './routes/admin.routes.mjs';
import healthRoutes from './routes/health.routes.mjs';
import { env } from './config/env.mjs';
import { errorHandler } from './middlewares/error-handler.middleware.mjs';
import { plantsDir, uploadsDir } from './config/paths.mjs';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.FRONTEND_URL.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: false,
  }));

  app.use(express.json({ limit: '5mb' }));
  app.use('/uploads', express.static(uploadsDir));
  app.use('/plants', express.static(plantsDir));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(errorHandler);

  return app;
}
