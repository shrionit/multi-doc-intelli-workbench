import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PdfParser } from '../../src/ingestion/parsers/pdf.parser';
import { TxtParser } from '../../src/ingestion/parsers/txt.parser';
import { CsvParser } from '../../src/ingestion/parsers/csv.parser';
import { ingestDocument } from '../../src/ingestion';

describe('Document Parsers & Ingestion Pipeline', () => {
  const fixturesDir = path.resolve(__dirname, '../fixtures');

  describe('TxtParser', () => {
    const parser = new TxtParser();

    it('should parse valid text file', async () => {
      const buffer = fs.readFileSync(path.join(fixturesDir, 'sample.txt'));
      const result = await parser.parse(buffer, 'sample.txt');

      expect(result.text).toContain('John Smith');
      expect(result.text).toContain('$50,000.00 USD');
      expect(result.metadata?.encoding).toBe('utf-8');
    });

    it('should throw when text file is empty', async () => {
      const buffer = Buffer.from('   \n  ');
      await expect(parser.parse(buffer, 'empty.txt')).rejects.toThrow(
        'empty or contains no readable content',
      );
    });
  });

  describe('CsvParser', () => {
    const parser = new CsvParser();

    it('should parse valid CSV file into structured text and metadata', async () => {
      const buffer = fs.readFileSync(path.join(fixturesDir, 'sample.csv'));
      const result = await parser.parse(buffer, 'sample.csv');

      expect(result.text).toContain('Columns: Company, Revenue, Profit');
      expect(result.text).toContain('Acme Corp');
      expect(result.metadata?.rowCount).toBe(5);
    });

    it('should throw when CSV file is empty', async () => {
      const buffer = Buffer.from('');
      await expect(parser.parse(buffer, 'empty.csv')).rejects.toThrow('empty or contains no readable content');
    });
  });

  describe('PdfParser', () => {
    const parser = new PdfParser();

    it('should parse valid text-containing PDF', async () => {
      const buffer = fs.readFileSync(path.join(fixturesDir, 'sample.pdf'));
      const result = await parser.parse(buffer, 'sample.pdf');

      expect(result.text).toContain('Acme Corp');
      expect(result.metadata?.pages).toBeGreaterThanOrEqual(1);
    });

    it('should reject scanned/image-only PDFs when text extraction fails', async () => {
      const emptyPdf = fs.readFileSync(path.join(fixturesDir, 'empty.pdf'));

      await expect(parser.parse(emptyPdf, 'scanned_document.pdf')).rejects.toThrow(
        /no extractable text.*scanned document/,
      );
    });
  });

  describe('Full Ingestion Pipeline (ingestDocument)', () => {
    it('should ingest valid TXT document successfully', async () => {
      const buffer = fs.readFileSync(path.join(fixturesDir, 'sample.txt'));
      const res = await ingestDocument('sample.txt', 'text/plain', buffer.length, buffer);

      expect(res.success).toBe(true);
      expect(res.fileType).toBe('txt');
      expect(res.content).toContain('Acme Corporation');
    });

    it('should ingest valid CSV document successfully', async () => {
      const buffer = fs.readFileSync(path.join(fixturesDir, 'sample.csv'));
      const res = await ingestDocument('sample.csv', 'text/csv', buffer.length, buffer);

      expect(res.success).toBe(true);
      expect(res.fileType).toBe('csv');
      expect(res.content).toContain('Columns:');
    });

    it('should ingest valid PDF document successfully', async () => {
      const buffer = fs.readFileSync(path.join(fixturesDir, 'sample.pdf'));
      const res = await ingestDocument('sample.pdf', 'application/pdf', buffer.length, buffer);

      expect(res.success).toBe(true);
      expect(res.fileType).toBe('pdf');
      expect(res.content).toContain('Acme Corp');
    });

    it('should reject invalid file types', async () => {
      const buffer = Buffer.from('console.log("hello")');
      const res = await ingestDocument('script.js', 'application/javascript', buffer.length, buffer);

      expect(res.success).toBe(false);
      expect(res.error).toContain('Unsupported');
    });
  });
});
