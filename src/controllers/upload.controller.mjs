import fs from "fs/promises";
import {
  buildUploadResponse,
  uploadImageToCloudinary,
} from "../services/upload.service.mjs";

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada." });
    }

    const uploadResult = await uploadImageToCloudinary(req.file.path);

    try {
      await fs.unlink(req.file.path);
    } catch {}

    return res.status(201).json(buildUploadResponse(uploadResult));
  } catch (error) {
    next(error);
  }
}
