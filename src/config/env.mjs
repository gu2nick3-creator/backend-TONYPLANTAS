import path from 'node:path';
import dotenv from 'dotenv';
import { backendDir } from './paths.mjs';

dotenv.config({ path: path.join(backendDir, '.env') });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const frontendUrlRaw = process.env.FRONTEND_URL || 'http://localhost:8080';
const frontendUrls = frontendUrlRaw
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 8000),
  FRONTEND_URL: frontendUrls,
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: toNumber(process.env.DB_PORT, 3306),
  DB_NAME: process.env.DB_NAME || 'tony_plantas',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_CONNECTION_LIMIT: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  SESSION_TTL_DAYS: toNumber(process.env.SESSION_TTL_DAYS, 7),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@admin.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123@',
};
