import multer from 'multer';
import { env } from '../config/env';

/**
 * Multer configuration: memory storage (buffer only, no disk writes before validation).
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES,
    files: 10, // max 10 files per request
  },
});
