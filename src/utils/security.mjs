import crypto from 'node:crypto';

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  const [salt, original] = String(stored || '').split(':');
  if (!salt || !original) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(original, 'hex'), Buffer.from(derived, 'hex'));
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
