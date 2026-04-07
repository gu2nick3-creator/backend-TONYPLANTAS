import { query, queryOne } from '../config/database.mjs';
import { env } from '../config/env.mjs';
import { makeId, normalizeText, nowPlusDays } from '../utils/helpers.mjs';
import { generateSessionToken, verifyPassword } from '../utils/security.mjs';
import { badRequest, unauthorized } from '../utils/http.mjs';

export function getTokenFromRequest(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function authenticateAdmin(email, password) {
  const safeEmail = normalizeText(email).toLowerCase();
  const safePassword = String(password || '');

  if (!safeEmail || !safePassword) {
    throw badRequest('E-mail e senha são obrigatórios.');
  }

  const admin = await queryOne('SELECT * FROM admins WHERE email = ? AND is_active = 1 LIMIT 1', [safeEmail]);

  if (!admin || !verifyPassword(safePassword, admin.password_hash)) {
    throw unauthorized('Credenciais inválidas.');
  }

  const token = generateSessionToken();
  const expiresAt = nowPlusDays(env.SESSION_TTL_DAYS);

  await query('INSERT INTO admin_sessions (id, admin_id, token, expires_at) VALUES (?, ?, ?, ?)', [
    makeId('ses_'),
    admin.id,
    token,
    expiresAt,
  ]);

  return {
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
    expiresAt,
  };
}

export async function getSessionByToken(token) {
  if (!token) throw unauthorized();

  const session = await queryOne(`
    SELECT s.id, s.token, s.expires_at, a.id AS admin_id, a.email, a.name
    FROM admin_sessions s
    INNER JOIN admins a ON a.id = s.admin_id
    WHERE s.token = ? AND a.is_active = 1
    LIMIT 1
  `, [token]);

  if (!session) throw unauthorized('Sessão inválida.');

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await query('DELETE FROM admin_sessions WHERE id = ?', [session.id]);
    throw unauthorized('Sessão expirada.');
  }

  return {
    id: session.admin_id,
    email: session.email,
    name: session.name,
    token: session.token,
  };
}

export async function logoutSession(token) {
  if (!token) throw unauthorized();
  await query('DELETE FROM admin_sessions WHERE token = ?', [token]);
  return { ok: true };
}
