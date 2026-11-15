import { IDocumentParser, ParsedContent } from './parser.interface';
import pdfParse from 'pdf-parse';

export class PdfParser implements IDocumentParser {
  readonly supportedType = 'pdf';

  async parse(buffer: Buffer, filename: string): Promise<ParsedContent> {
    try {
      // Convert Buffer to Uint8Array so pdf.js receives a standard typed array across all JS runtimes (Node, Vitest, tsx)
      const uint8Array = new Uint8Array(buffer);
      const data = await pdfParse(uint8Array as unknown as Buffer);

      const text = data.text?.trim();
      if (!text || text.length === 0) {
        throw new Error(
          `PDF "${filename}" contains no extractable text. It may be a scanned document or image-only PDF. Text extraction is required.`,
        );
      }

      return {
        text,
        metadata: {
          pages: data.numpages,
          info: data.info,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('no extractable text')) {
        throw err;
      }
      throw new Error(`Failed to parse PDF "${filename}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
