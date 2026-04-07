import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';
import { uploadSingleImage } from '../utils/upload.mjs';

const router = Router();

router.post('/', requireAuth, uploadSingleImage, uploadImage);

export default router;
