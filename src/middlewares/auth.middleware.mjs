import { getSessionByToken, getTokenFromRequest } from '../services/auth.service.mjs';

export async function requireAuth(req, _res, next) {
  try {
    const token = getTokenFromRequest(req);
    req.admin = await getSessionByToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
