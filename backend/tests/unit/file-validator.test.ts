import { describe, it, expect } from 'vitest';
import {
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateMagicBytes,
  validateFile,
} from '../../src/ingestion/validators/file.validator';

describe('File Validator', () => {
  describe('validateFileExtension', () => {
    it('should accept .pdf extension', () => {
      const result = validateFileExtension('document.pdf');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('pdf');
    });

    it('should accept .txt extension', () => {
      const result = validateFileExtension('notes.txt');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('txt');
    });

    it('should accept .csv extension', () => {
      const result = validateFileExtension('data.csv');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('csv');
    });

    it('should reject .docx extension', () => {
      const result = validateFileExtension('file.docx');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported');
    });

    it('should reject .exe extension', () => {
      const result = validateFileExtension('malware.exe');
      expect(result.valid).toBe(false);
    });

    it('should handle case-insensitive extensions', () => {
      const result = validateFileExtension('FILE.PDF');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('pdf');
    });
  });

  describe('validateMimeType', () => {
    it('should accept application/pdf', () => {
      const result = validateMimeType('application/pdf');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('pdf');
    });

    it('should accept text/plain', () => {
      const result = validateMimeType('text/plain');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('txt');
    });

    it('should accept text/csv', () => {
      const result = validateMimeType('text/csv');
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('csv');
    });

    it('should reject image/png', () => {
      const result = validateMimeType('image/png');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should accept file within size limit', () => {
      const result = validateFileSize(500000); // 500KB
      expect(result.valid).toBe(true);
    });

    it('should reject file exceeding 1MB', () => {
      const result = validateFileSize(1048577); // Just over 1MB
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });

    it('should accept file exactly at the limit', () => {
      const result = validateFileSize(1048576); // Exactly 1MB
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMagicBytes', () => {
    it('should accept valid PDF magic bytes', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 test content');
      const result = validateMagicBytes(pdfBuffer, 'pdf');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid PDF magic bytes', () => {
      const fakeBuffer = Buffer.from('This is not a PDF');
      const result = validateMagicBytes(fakeBuffer, 'pdf');
      expect(result.valid).toBe(false);
    });

    it('should accept any content for txt (no magic bytes)', () => {
      const txtBuffer = Buffer.from('Hello world');
      const result = validateMagicBytes(txtBuffer, 'txt');
      expect(result.valid).toBe(true);
    });

    it('should accept any content for csv (no magic bytes)', () => {
      const csvBuffer = Buffer.from('a,b,c\n1,2,3');
      const result = validateMagicBytes(csvBuffer, 'csv');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateFile (full pipeline)', () => {
    it('should accept a valid txt file', () => {
      const buffer = Buffer.from('Hello world content');
      const result = validateFile('test.txt', 'text/plain', 100, buffer);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('txt');
    });

    it('should reject when extension and MIME mismatch', () => {
      const buffer = Buffer.from('content');
      const result = validateFile('file.txt', 'application/pdf', 100, buffer);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should reject oversized files', () => {
      const buffer = Buffer.alloc(2000000); // 2MB
      const result = validateFile('big.txt', 'text/plain', 2000000, buffer);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });
  });
});
