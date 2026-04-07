import { query, queryOne, healthcheckDatabase } from '../config/database.mjs';
import { env } from '../config/env.mjs';
import { hashPassword } from '../utils/security.mjs';
import { makeId } from '../utils/helpers.mjs';

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(120) NOT NULL DEFAULT 'Administrador',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id CHAR(36) PRIMARY KEY,
      admin_id CHAR(36) NOT NULL,
      token CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_admin_sessions_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      INDEX idx_admin_sessions_admin_id (admin_id),
      INDEX idx_admin_sessions_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      slug VARCHAR(160) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id CHAR(36) PRIMARY KEY,
      category_id CHAR(36) NOT NULL,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      image VARCHAR(255) NOT NULL DEFAULT '',
      care TEXT NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      available TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      INDEX idx_products_category_id (category_id),
      INDEX idx_products_active_featured (active, featured),
      INDEX idx_products_name (name),
      INDEX idx_products_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function ensureDefaultAdmin() {
  const admin = await queryOne('SELECT id FROM admins WHERE email = ?', [env.ADMIN_EMAIL]);

  if (!admin) {
    await query(
      'INSERT INTO admins (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
      [makeId('adm_'), env.ADMIN_EMAIL, hashPassword(env.ADMIN_PASSWORD), 'Administrador']
    );
  }
}

async function cleanupExpiredSessions() {
  await query('DELETE FROM admin_sessions WHERE expires_at < NOW()');
}

export async function initializeApplication() {
  await createTables();
  await ensureDefaultAdmin();
  await cleanupExpiredSessions();
  await healthcheckDatabase();
}
