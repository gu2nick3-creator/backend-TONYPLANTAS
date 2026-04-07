import { getAdminStats } from '../services/stats.service.mjs';

export async function stats(_req, res, next) {
  try {
    const result = await getAdminStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
}
