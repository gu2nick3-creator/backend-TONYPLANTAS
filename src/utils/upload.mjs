import crypto from 'node:crypto';
import multer from 'multer';
import path from 'node:path';
import { uploadsDir } from '../config/paths.mjs';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`);
  },
});

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Apenas imagens são permitidas.'));
  },
}).single('image');
