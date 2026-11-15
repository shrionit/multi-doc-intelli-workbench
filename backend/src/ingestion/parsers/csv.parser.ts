import { parse } from 'csv-parse/sync';
import { IDocumentParser, ParsedContent } from './parser.interface';

export class CsvParser implements IDocumentParser {
  readonly supportedType = 'csv';

  async parse(buffer: Buffer, filename: string): Promise<ParsedContent> {
    const raw = buffer.toString('utf-8').trim();

    if (!raw || raw.length === 0) {
      throw new Error(`CSV file "${filename}" is empty or contains no readable content.`);
    }

    try {
      const records: string[][] = parse(raw, {
        skip_empty_lines: true,
        relax_column_count: true,
      });

      if (records.length === 0) {
        throw new Error(`CSV file "${filename}" contains no data rows.`);
      }

      // Convert to a readable text representation for LLM consumption
      const headers = records[0];
      const dataRows = records.slice(1);

      let text = `CSV Data from "${filename}":\n`;
      text += `Columns: ${headers.join(', ')}\n`;
      text += `Row count: ${dataRows.length}\n\n`;

      // Table representation
      dataRows.forEach((row, i) => {
        text += `Row ${i + 1}: `;
        text += headers.map((h, j) => `${h}=${row[j] ?? 'N/A'}`).join(', ');
        text += '\n';
      });

      return {
        text,
        metadata: {
          headers,
          rowCount: dataRows.length,
          columnCount: headers.length,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('contains no')) {
        throw err;
      }
      throw new Error(`Failed to parse CSV "${filename}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
