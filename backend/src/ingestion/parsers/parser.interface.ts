export interface ParsedContent {
  text: string;
  metadata?: Record<string, unknown>;
}

export interface IDocumentParser {
  readonly supportedType: string;
  parse(buffer: Buffer, filename: string): Promise<ParsedContent>;
}
