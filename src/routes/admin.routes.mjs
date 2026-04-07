import { Router } from 'express';
import { stats } from '../controllers/admin.controller.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

router.get('/stats', requireAuth, stats);

export default router;
