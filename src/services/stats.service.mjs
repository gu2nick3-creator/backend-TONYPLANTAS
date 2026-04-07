import { query } from '../config/database.mjs';

export async function getAdminStats() {
  const [summary] = await query(`
    SELECT
      COUNT(*) AS totalProducts,
      SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactive,
      SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) AS featured,
      SUM(CASE WHEN available = 1 THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN available = 0 THEN 1 ELSE 0 END) AS unavailable
    FROM products
  `);
  const [categoryRow] = await query('SELECT COUNT(*) AS totalCategories FROM categories');

  return {
    totalProducts: Number(summary?.totalProducts || 0),
    totalCategories: Number(categoryRow?.totalCategories || 0),
    active: Number(summary?.active || 0),
    inactive: Number(summary?.inactive || 0),
    featured: Number(summary?.featured || 0),
    available: Number(summary?.available || 0),
    unavailable: Number(summary?.unavailable || 0),
  };
}
