import { buildUploadResponse } from '../services/upload.service.mjs';

export async function uploadImage(req, res, next) {
  try {
    const result = buildUploadResponse(req.file);

    if (!result) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
