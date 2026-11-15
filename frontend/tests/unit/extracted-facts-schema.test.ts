import { describe, it, expect } from 'vitest';
import { ExtractedFactsSchema } from '../../src/types';

describe('ExtractedFacts Schema Validation (Frontend)', () => {
  it('should accept a valid extracted facts object', () => {
    const valid = {
      documentId: 'doc-001',
      documentName: 'invoice.pdf',
      entities: [
        { name: 'Widget Corp', type: 'organization', quote: 'billed to Widget Corp' },
      ],
      dates: [
        { label: 'Invoice Date', value: '2024-03-15' },
      ],
      obligations: [
        { description: 'payment due within 30 days', parties: ['Widget Corp'] },
      ],
      financialValues: [
        { label: 'Total', value: '$12,500.00', currency: 'USD' },
      ],
      keyValues: { 'Invoice #': 'INV-2024-0042' },
    };

    const result = ExtractedFactsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should accept minimal valid object', () => {
    const minimal = {
      documentId: 'doc-002',
      documentName: 'empty.txt',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const invalid = { entities: [], dates: [] };
    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject invalid entity structure', () => {
    const invalid = {
      documentId: 'doc-003',
      documentName: 'test.csv',
      entities: [{ invalid: true }],
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject non-string documentId', () => {
    const invalid = {
      documentId: 123,
      documentName: 'test.pdf',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should accept with optional rawTextSnippet', () => {
    const valid = {
      documentId: 'doc-004',
      documentName: 'report.txt',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
      rawTextSnippet: 'This is a snippet of the raw text content...',
    };

    const result = ExtractedFactsSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rawTextSnippet).toBe('This is a snippet of the raw text content...');
    }
  });
});
