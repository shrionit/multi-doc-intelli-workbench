import { IDocumentParser, ParsedContent } from './parser.interface';

export class TxtParser implements IDocumentParser {
  readonly supportedType = 'txt';

  async parse(buffer: Buffer, filename: string): Promise<ParsedContent> {
    const text = buffer.toString('utf-8').trim();

    if (!text || text.length === 0) {
      throw new Error(`Text file "${filename}" is empty or contains no readable content.`);
    }

    return {
      text,
      metadata: {
        encoding: 'utf-8',
        length: text.length,
      },
    };
  }
}
