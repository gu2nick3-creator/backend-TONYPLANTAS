import { Router } from 'express';
import {
  create,
  destroy,
  list,
  update,
} from '../controllers/categories.controller.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

router.get('/', list);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, destroy);

export default router;
