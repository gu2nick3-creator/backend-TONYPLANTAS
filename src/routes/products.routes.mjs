import { Router } from 'express';
import {
  create,
  destroy,
  getById,
  list,
  update,
} from '../controllers/products.controller.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, destroy);

export default router;
