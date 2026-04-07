import { Router } from 'express';
import { login, me, logout } from '../controllers/auth.controller.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

export default router;
