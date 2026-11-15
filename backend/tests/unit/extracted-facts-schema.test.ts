import { describe, it, expect } from 'vitest';
import { ExtractedFactsSchema } from '../../src/types/llm.types';

describe('ExtractedFacts Schema Validation (Backend)', () => {
  it('should accept a valid extracted facts object', () => {
    const valid = {
      documentId: 'doc-123',
      documentName: 'contract.pdf',
      entities: [
        { name: 'Acme Corp', type: 'organization', quote: 'signed by Acme Corp' },
        { name: 'John Smith', type: 'person' },
      ],
      dates: [
        { label: 'Start Date', value: '2024-01-15', quote: 'effective from 2024-01-15' },
      ],
      obligations: [
        { description: 'deliver goods within 30 days', quote: 'shall deliver goods within 30 days' },
      ],
      financialValues: [
        { label: 'Total Amount', value: '$50,000', currency: 'USD', quote: 'total of $50,000' },
      ],
      keyValues: { 'Contract ID': 'CTR-2024-001', 'Duration': '12 months' },
      rawTextSnippet: 'This contract is between Acme Corp and...',
    };

    const result = ExtractedFactsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should accept a minimal valid facts object (no optional fields)', () => {
    const minimal = {
      documentId: 'doc-456',
      documentName: 'report.txt',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('should reject when documentId is missing', () => {
    const invalid = {
      documentName: 'test.pdf',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject when documentName is missing', () => {
    const invalid = {
      documentId: 'doc-789',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject when entities is not an array', () => {
    const invalid = {
      documentId: 'doc-abc',
      documentName: 'test.csv',
      entities: 'not an array',
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject entity with missing name', () => {
    const invalid = {
      documentId: 'doc-def',
      documentName: 'file.pdf',
      entities: [{ type: 'person' }], // missing name
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject entity with missing type', () => {
    const invalid = {
      documentId: 'doc-ghi',
      documentName: 'file.pdf',
      entities: [{ name: 'John' }], // missing type
      dates: [],
      obligations: [],
      financialValues: [],
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject financial value with missing label', () => {
    const invalid = {
      documentId: 'doc-jkl',
      documentName: 'file.txt',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [{ value: '$1000' }], // missing label
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should accept entities with optional quote field omitted', () => {
    const valid = {
      documentId: 'doc-mno',
      documentName: 'data.csv',
      entities: [{ name: 'Jane Doe', type: 'person' }],
      dates: [{ label: 'Due Date', value: '2024-06-30' }],
      obligations: [{ description: 'pay invoice' }],
      financialValues: [{ label: 'Revenue', value: '500000' }],
    };

    const result = ExtractedFactsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject invalid keyValues type (should be Record<string, string>)', () => {
    const invalid = {
      documentId: 'doc-pqr',
      documentName: 'test.pdf',
      entities: [],
      dates: [],
      obligations: [],
      financialValues: [],
      keyValues: 'not an object',
    };

    const result = ExtractedFactsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
