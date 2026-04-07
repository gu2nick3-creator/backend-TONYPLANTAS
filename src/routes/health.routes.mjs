import { Router } from 'express';
import { health } from '../controllers/health.controller.mjs';

const router = Router();

router.get('/', health);

export default router;
