import { env } from '../config/env.mjs';
import { healthcheckDatabase } from '../config/database.mjs';

export async function health(_req, res, next) {
  try {
    await healthcheckDatabase();
    res.json({ ok: true, database: env.DB_NAME, engine: 'mysql' });
  } catch (error) {
    next(error);
  }
}
