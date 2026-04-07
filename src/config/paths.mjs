import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const backendDir = path.resolve(__dirname, '..', '..');
export const projectRoot = path.resolve(backendDir, '..');
export const publicDir = path.join(projectRoot, 'public');
export const uploadsDir = path.join(publicDir, 'uploads');
export const plantsDir = path.join(publicDir, 'plants');

fs.mkdirSync(uploadsDir, { recursive: true });
