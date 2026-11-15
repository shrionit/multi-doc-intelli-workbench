import { ILLMProvider } from './llm.interface';
import { ExtractedFacts, AnalysisOutput } from '../types/llm.types';

/**
 * MockProvider: deterministic LLM provider for development and testing.
 * Generates structured mock data by analysing content heuristically.
 */
export class MockProvider implements ILLMProvider {
  readonly name = 'mock';

  async extractFacts(
    content: string,
    documentId: string,
    documentName: string,
    fileType: string,
  ): Promise<ExtractedFacts> {
    // Simulate processing delay
    await this.delay(200);

    const entities = this.extractEntities(content, documentName);
    const dates = this.extractDates(content);
    const obligations = this.extractObligations(content);
    const financialValues = this.extractFinancialValues(content);
    const keyValues = this.extractKeyValues(content);

    return {
      documentId,
      documentName,
      entities,
      dates,
      obligations,
      financialValues,
      keyValues,
      rawTextSnippet: content.substring(0, 500),
    };
  }

  async analyzeDocuments(
    facts: ExtractedFacts[],
    userPrompt: string,
  ): Promise<AnalysisOutput> {
    await this.delay(300);

    const docNames = facts.map((f) => f.documentName);
    const allEntities = facts.flatMap((f) => f.entities);
    const allFinancials = facts.flatMap((f) => f.financialValues);
    const allDates = facts.flatMap((f) => f.dates);

    // Build comparison table from key-value pairs across documents
    const comparisonTable = this.buildComparisonTable(facts);

    // Detect discrepancies
    const discrepancies = this.detectDiscrepancies(facts);

    // Detect missing information
    const missingInformation = this.detectMissingInfo(facts);

    // Key-value extractions
    const keyValueExtractions = facts.flatMap((f) =>
      Object.entries(f.keyValues ?? {}).map(([key, value]) => ({
        key,
        value,
        source: {
          documentId: f.documentId,
          documentName: f.documentName,
          quote: value,
        },
      })),
    );

    return {
      summary: `Analysis of ${facts.length} document(s) (${docNames.join(', ')}) based on prompt: "${userPrompt}". Found ${allEntities.length} entities, ${allFinancials.length} financial values, and ${allDates.length} dates across all documents.`,
      comparisonTable,
      discrepancies,
      missingInformation,
      keyValueExtractions,
      inferencesAndNotes: [
        {
          note: `All ${facts.length} documents were processed successfully.`,
          isInference: false,
          confidence: 'high' as const,
          sources: facts.map((f) => ({
            documentId: f.documentId,
            documentName: f.documentName,
          })),
        },
        {
          note: `Based on the user prompt "${userPrompt.substring(0, 80)}...", cross-document analysis was performed to identify patterns and discrepancies.`,
          isInference: true,
          confidence: 'medium' as const,
        },
        ...(discrepancies && discrepancies.length > 0
          ? [{
              note: `${discrepancies.length} potential discrepancies were identified across documents that may require manual review.`,
              isInference: true,
              confidence: 'medium' as const,
            }]
          : []),
      ],
    };
  }

  // ── Heuristic extractors ──

  private extractEntities(content: string, docName: string): ExtractedFacts['entities'] {
    const entities: ExtractedFacts['entities'] = [];

    // Find capitalized multi-word names (simple heuristic for persons/orgs)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = namePattern.exec(content)) !== null) {
      const name = match[1];
      if (!seen.has(name) && entities.length < 10) {
        seen.add(name);
        const surrounding = this.getSurroundingText(content, match.index, 60);
        entities.push({
          name,
          type: this.guessEntityType(name, content),
          quote: surrounding,
        });
      }
    }

    if (entities.length === 0) {
      entities.push({
        name: docName.replace(/\.[^.]+$/, ''),
        type: 'document',
        quote: content.substring(0, 80),
      });
    }

    return entities;
  }

  private extractDates(content: string): ExtractedFacts['dates'] {
    const dates: ExtractedFacts['dates'] = [];
    const datePatterns = [
      /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/g,
      /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/g,
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s*\d{4})/gi,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi,
    ];

    const seen = new Set<string>();
    for (const pattern of datePatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const value = match[1];
        if (!seen.has(value) && dates.length < 10) {
          seen.add(value);
          const surrounding = this.getSurroundingText(content, match.index, 60);
          dates.push({
            label: this.guessDateLabel(surrounding),
            value,
            quote: surrounding,
          });
        }
      }
    }

    return dates;
  }

  private extractObligations(content: string): ExtractedFacts['obligations'] {
    const obligations: ExtractedFacts['obligations'] = [];
    const obligationKeywords = [
      /(?:shall|must|required to|obligated to|agrees to|will)\s+(.{10,120})/gi,
    ];

    for (const pattern of obligationKeywords) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        if (obligations.length < 5) {
          obligations.push({
            description: match[1].replace(/\.\s*$/, '').trim(),
            quote: this.getSurroundingText(content, match.index, 80),
          });
        }
      }
    }

    return obligations;
  }

  private extractFinancialValues(content: string): ExtractedFacts['financialValues'] {
    const values: ExtractedFacts['financialValues'] = [];
    const patterns = [
      /(\$[\d,]+(?:\.\d{2})?)\s*(million|billion|thousand)?/gi,
      /((?:USD|EUR|GBP|INR)\s*[\d,]+(?:\.\d{2})?)/gi,
      /([\d,]+(?:\.\d{2})?)\s*(?:dollars|euros|pounds|rupees)/gi,
    ];

    const seen = new Set<string>();
    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const value = match[0].trim();
        if (!seen.has(value) && values.length < 10) {
          seen.add(value);
          const surrounding = this.getSurroundingText(content, match.index, 60);
          values.push({
            label: this.guessFinancialLabel(surrounding),
            value,
            currency: this.guessCurrency(value),
            quote: surrounding,
          });
        }
      }
    }

    return values;
  }

  private extractKeyValues(content: string): Record<string, string> {
    const kv: Record<string, string> = {};
    // Match "Key: Value" or "Key = Value" patterns
    const kvPattern = /^([A-Za-z][A-Za-z\s]{1,30})[:=]\s*(.{1,200})$/gm;
    let match: RegExpExecArray | null;
    let count = 0;

    while ((match = kvPattern.exec(content)) !== null && count < 15) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && value && !kv[key]) {
        kv[key] = value;
        count++;
      }
    }

    return kv;
  }

  // ── Cross-document analysis helpers ──

  private buildComparisonTable(facts: ExtractedFacts[]): Record<string, unknown>[] {
    if (facts.length < 2) return [];

    const allKeys = new Set<string>();
    facts.forEach((f) => {
      Object.keys(f.keyValues ?? {}).forEach((k) => allKeys.add(k));
    });

    const table: Record<string, unknown>[] = [];
    for (const key of allKeys) {
      const row: Record<string, unknown> = { field: key };
      const values: string[] = [];
      for (const f of facts) {
        const val = f.keyValues?.[key] ?? 'N/A';
        row[f.documentName] = val;
        values.push(val);
      }
      const nonNA = values.filter((v) => v !== 'N/A');
      const allSame = nonNA.length > 0 && nonNA.every((v) => v === nonNA[0]);
      const hasMissing = values.some((v) => v === 'N/A');
      row['status'] = nonNA.length === 0 ? 'missing' : allSame ? (hasMissing ? 'partial' : 'match') : 'conflict';
      table.push(row);
    }

    return table;
  }

  private detectDiscrepancies(facts: ExtractedFacts[]): AnalysisOutput['discrepancies'] {
    if (facts.length < 2) return [];

    const discrepancies: NonNullable<AnalysisOutput['discrepancies']> = [];
    const allKeys = new Set<string>();
    facts.forEach((f) => Object.keys(f.keyValues ?? {}).forEach((k) => allKeys.add(k)));

    for (const key of allKeys) {
      const docValues = facts
        .filter((f) => f.keyValues?.[key])
        .map((f) => ({ doc: f, value: f.keyValues![key] }));

      if (docValues.length > 1) {
        const unique = new Set(docValues.map((d) => d.value.toLowerCase().trim()));
        if (unique.size > 1) {
          discrepancies.push({
            field: key,
            description: `Conflicting values found: ${docValues.map((d) => `"${d.value}" (${d.doc.documentName})`).join(' vs ')}`,
            sources: docValues.map((d) => ({
              documentId: d.doc.documentId,
              documentName: d.doc.documentName,
              quote: `${key}: ${d.value}`,
            })),
          });
        }
      }
    }

    return discrepancies;
  }

  private detectMissingInfo(facts: ExtractedFacts[]): NonNullable<AnalysisOutput['missingInformation']> {
    if (facts.length < 2) return [];

    const missing: NonNullable<AnalysisOutput['missingInformation']> = [];
    const allKeys = new Set<string>();
    facts.forEach((f) => Object.keys(f.keyValues ?? {}).forEach((k) => allKeys.add(k)));

    for (const key of allKeys) {
      for (const f of facts) {
        if (!f.keyValues?.[key]) {
          missing.push({
            field: key,
            description: `"${key}" is present in other documents but missing from "${f.documentName}".`,
            expectedIn: f.documentName,
          });
        }
      }
    }

    return missing;
  }

  // ── Utility helpers ──

  private guessEntityType(name: string, context: string): string {
    const lowerContext = context.toLowerCase();
    if (/\b(inc|corp|ltd|llc|company|co\.|group|bank)\b/i.test(name) || /company|corporation|firm/i.test(lowerContext)) return 'organization';
    if (/\b(mr|mrs|ms|dr|prof)\b/i.test(lowerContext)) return 'person';
    if (/\b(street|city|state|country|avenue|road|lane)\b/i.test(lowerContext)) return 'location';
    return 'person';
  }

  private guessDateLabel(context: string): string {
    const lower = context.toLowerCase();
    if (/expir|expiry|end/i.test(lower)) return 'Expiry Date';
    if (/start|begin|commencement/i.test(lower)) return 'Start Date';
    if (/sign|execut/i.test(lower)) return 'Signature Date';
    if (/due|deadline/i.test(lower)) return 'Due Date';
    if (/birth|dob/i.test(lower)) return 'Date of Birth';
    if (/incorporat|register/i.test(lower)) return 'Registration Date';
    return 'Date';
  }

  private guessFinancialLabel(context: string): string {
    const lower = context.toLowerCase();
    if (/revenue|sales|income/i.test(lower)) return 'Revenue';
    if (/profit|earnings/i.test(lower)) return 'Profit';
    if (/cost|expense/i.test(lower)) return 'Cost';
    if (/tax/i.test(lower)) return 'Tax';
    if (/salary|wage|compensation/i.test(lower)) return 'Salary';
    if (/total|amount|balance/i.test(lower)) return 'Total Amount';
    return 'Financial Value';
  }

  private guessCurrency(value: string): string {
    if (value.startsWith('$') || /USD/i.test(value)) return 'USD';
    if (/EUR/i.test(value) || /euro/i.test(value)) return 'EUR';
    if (/GBP/i.test(value) || /pound/i.test(value)) return 'GBP';
    if (/INR/i.test(value) || /rupee/i.test(value)) return 'INR';
    return 'USD';
  }

  private getSurroundingText(content: string, index: number, radius: number): string {
    const start = Math.max(0, index - radius);
    const end = Math.min(content.length, index + radius);
    return content.substring(start, end).replace(/\s+/g, ' ').trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
