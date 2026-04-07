import { authenticateAdmin, logoutSession } from '../services/auth.service.mjs';

export async function login(req, res, next) {
  try {
    const result = await authenticateAdmin(req.body?.email, req.body?.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: req.admin });
}

export async function logout(req, res, next) {
  try {
    const result = await logoutSession(req.admin?.token);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
