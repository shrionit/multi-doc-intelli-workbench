import { describe, it, expect } from 'vitest';
import { normalizeAnalysisOutput } from '../../src/services/normalizer.service';
import { AnalysisOutput } from '../../src/types/llm.types';

describe('Normalizer Service', () => {
  it('should normalize a complete analysis output', () => {
    const raw: AnalysisOutput = {
      summary: 'Test summary',
      comparisonTable: [
        { field: 'Name', 'doc1.pdf': 'Acme', 'doc2.pdf': 'Acme', status: 'match' },
        { field: 'Revenue', 'doc1.pdf': '$100k', 'doc2.pdf': '$200k', status: 'conflict' },
      ],
      discrepancies: [
        {
          field: 'Revenue',
          description: 'Different values',
          sources: [
            { documentId: '1', documentName: 'doc1.pdf', quote: '$100k' },
            { documentId: '2', documentName: 'doc2.pdf', quote: '$200k' },
          ],
        },
      ],
      missingInformation: [
        { field: 'Tax ID', description: 'Missing from doc2', expectedIn: 'doc2.pdf' },
      ],
      keyValueExtractions: [
        { key: 'CEO', value: 'John Smith', source: { documentId: '1', documentName: 'doc1.pdf' } },
      ],
      inferencesAndNotes: [
        { note: 'Both documents refer to same entity', isInference: true, confidence: 'high' },
        { note: 'Contract signed in 2024', isInference: false },
      ],
    };

    const result = normalizeAnalysisOutput(raw);

    expect(result.summary).toBe('Test summary');
    expect(result.comparisonTable).toHaveLength(2);
    expect(result.comparisonTable[0].field).toBe('Name');
    expect(result.comparisonTable[0].status).toBe('match');
    expect(result.comparisonTable[1].status).toBe('conflict');
    expect(result.discrepancies).toHaveLength(1);
    expect(result.discrepancies[0].sources).toHaveLength(2);
    expect(result.missingInformation).toHaveLength(1);
    expect(result.keyValueExtractions).toHaveLength(1);
    expect(result.inferencesAndNotes).toHaveLength(2);
    expect(result.inferencesAndNotes[0].isInference).toBe(true);
    expect(result.inferencesAndNotes[1].isInference).toBe(false);
  });

  it('should handle empty/null raw output defensively', () => {
    const result = normalizeAnalysisOutput({} as AnalysisOutput);

    expect(result.summary).toBe('No summary available.');
    expect(result.comparisonTable).toEqual([]);
    expect(result.discrepancies).toEqual([]);
    expect(result.missingInformation).toEqual([]);
    expect(result.keyValueExtractions).toEqual([]);
    expect(result.inferencesAndNotes).toEqual([]);
  });

  it('should handle partially defined output', () => {
    const partial: AnalysisOutput = {
      summary: 'Partial',
      discrepancies: [
        { field: 'Name', description: 'Mismatch', sources: [] },
      ],
    };

    const result = normalizeAnalysisOutput(partial);

    expect(result.summary).toBe('Partial');
    expect(result.comparisonTable).toEqual([]);
    expect(result.discrepancies).toHaveLength(1);
    expect(result.missingInformation).toEqual([]);
  });

  it('should normalize comparison table status to valid values', () => {
    const raw: AnalysisOutput = {
      comparisonTable: [
        { field: 'Test', 'doc.pdf': 'val', status: 'invalid_status' },
        { field: 'Test2', 'doc.pdf': 'val2', status: 'match' },
      ],
    };

    const result = normalizeAnalysisOutput(raw);

    expect(result.comparisonTable[0].status).toBe('partial'); // fallback for invalid
    expect(result.comparisonTable[1].status).toBe('match');
  });
});
