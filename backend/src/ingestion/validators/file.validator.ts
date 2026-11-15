import { SupportedFileType } from '../types/document.types';
import { env } from '../config/env';

// Magic bytes for supported file types
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }], // %PDF
};

const ALLOWED_EXTENSIONS: Record<string, SupportedFileType> = {
  '.pdf': 'pdf',
  '.txt': 'txt',
  '.csv': 'csv',
};

const ALLOWED_MIMETYPES: Record<string, SupportedFileType> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/csv': 'csv',
};

export interface ValidationResult {
  valid: boolean;
  fileType?: SupportedFileType;
  error?: string;
}

export function validateFileExtension(filename: string): ValidationResult {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  const fileType = ALLOWED_EXTENSIONS[ext];
  if (!fileType) {
    return { valid: false, error: `Unsupported file extension: ${ext}. Allowed: ${Object.keys(ALLOWED_EXTENSIONS).join(', ')}` };
  }
  return { valid: true, fileType };
}

export function validateMimeType(mimetype: string): ValidationResult {
  const fileType = ALLOWED_MIMETYPES[mimetype];
  if (!fileType) {
    return { valid: false, error: `Unsupported MIME type: ${mimetype}. Allowed: ${Object.keys(ALLOWED_MIMETYPES).join(', ')}` };
  }
  return { valid: true, fileType };
}

export function validateFileSize(size: number): ValidationResult {
  const maxSize = env.MAX_FILE_SIZE_BYTES;
  if (size > maxSize) {
    return { valid: false, error: `File exceeds maximum size of ${maxSize} bytes (${(maxSize / 1024 / 1024).toFixed(1)}MB). Got ${size} bytes.` };
  }
  return { valid: true };
}

export function validateMagicBytes(buffer: Buffer, expectedType: SupportedFileType): ValidationResult {
  const signatures = MAGIC_BYTES[expectedType];

  // Text-based formats (txt, csv) don't have magic bytes
  if (!signatures) {
    return { valid: true, fileType: expectedType };
  }

  for (const sig of signatures) {
    const slice = buffer.subarray(sig.offset, sig.offset + sig.bytes.length);
    const matches = sig.bytes.every((byte, i) => slice[i] === byte);
    if (matches) {
      return { valid: true, fileType: expectedType };
    }
  }

  return { valid: false, error: `File content does not match expected ${expectedType} format (magic byte validation failed).` };
}

export function validateFile(
  filename: string,
  mimetype: string,
  size: number,
  buffer: Buffer,
): ValidationResult {
  // 1. Extension check
  const extResult = validateFileExtension(filename);
  if (!extResult.valid) return extResult;

  // 2. MIME check
  const mimeResult = validateMimeType(mimetype);
  if (!mimeResult.valid) return mimeResult;

  // 3. Consistency check: extension and MIME should agree
  if (extResult.fileType !== mimeResult.fileType) {
    return { valid: false, error: `File extension (${extResult.fileType}) does not match MIME type (${mimeResult.fileType}).` };
  }

  // 4. Size check
  const sizeResult = validateFileSize(size);
  if (!sizeResult.valid) return sizeResult;

  // 5. Magic bytes check
  const magicResult = validateMagicBytes(buffer, extResult.fileType!);
  if (!magicResult.valid) return magicResult;

  return { valid: true, fileType: extResult.fileType };
}
