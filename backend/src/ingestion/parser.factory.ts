import { SupportedFileType } from '../types/document.types';
import { IDocumentParser } from './parsers/parser.interface';
import { PdfParser } from './parsers/pdf.parser';
import { TxtParser } from './parsers/txt.parser';
import { CsvParser } from './parsers/csv.parser';

const parsers: Map<string, IDocumentParser> = new Map();

// Register built-in parsers
function registerDefaults(): void {
  const defaults: IDocumentParser[] = [
    new PdfParser(),
    new TxtParser(),
    new CsvParser(),
  ];
  defaults.forEach((p) => parsers.set(p.supportedType, p));
}

registerDefaults();

/**
 * Register a custom parser (extensibility point).
 */
export function registerParser(parser: IDocumentParser): void {
  parsers.set(parser.supportedType, parser);
}

/**
 * Get parser for a given file type.
 */
export function getParser(fileType: SupportedFileType): IDocumentParser {
  const parser = parsers.get(fileType);
  if (!parser) {
    throw new Error(`No parser registered for file type: ${fileType}`);
  }
  return parser;
}
