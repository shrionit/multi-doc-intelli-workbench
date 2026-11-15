import { SupportedFileType } from '../types/document.types';
import { validateFile, ValidationResult } from './validators/file.validator';
import { getParser } from './parser.factory';
import { ParsedContent } from './parsers/parser.interface';

export interface IngestionResult {
  success: boolean;
  fileType?: SupportedFileType;
  content?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

/**
 * Full ingestion pipeline: validate → parse → return content.
 */
export async function ingestDocument(
  filename: string,
  mimetype: string,
  size: number,
  buffer: Buffer,
): Promise<IngestionResult> {
  // Step 1: Validate
  const validation: ValidationResult = validateFile(filename, mimetype, size, buffer);
  if (!validation.valid || !validation.fileType) {
    return { success: false, error: validation.error };
  }

  // Step 2: Parse
  try {
    const parser = getParser(validation.fileType);
    const parsed: ParsedContent = await parser.parse(buffer, filename);

    return {
      success: true,
      fileType: validation.fileType,
      content: parsed.text,
      metadata: parsed.metadata,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export { validateFile, getParser, registerParser } from './parser.factory';
