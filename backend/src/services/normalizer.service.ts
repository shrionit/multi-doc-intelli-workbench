import { NormalizedAnalysisResult, ComparisonRow } from '../types/analysis.types';
import { AnalysisOutput } from '../types/llm.types';

/**
 * Normalize raw LLM output into the standard result structure.
 * Defensive: every field uses optional chaining and fallbacks.
 */
export function normalizeAnalysisOutput(raw: AnalysisOutput): NormalizedAnalysisResult {
  return {
    summary: raw?.summary ?? 'No summary available.',

    comparisonTable: normalizeComparisonTable(raw?.comparisonTable),

    discrepancies: (raw?.discrepancies ?? []).map((d) => ({
      field: d?.field ?? 'Unknown',
      description: d?.description ?? '',
      sources: (d?.sources ?? []).map((s) => ({
        documentId: s?.documentId ?? '',
        documentName: s?.documentName ?? 'Unknown',
        quote: s?.quote,
      })),
    })),

    missingInformation: (raw?.missingInformation ?? []).map((m) => ({
      field: m?.field ?? 'Unknown',
      description: m?.description ?? '',
      expectedIn: m?.expectedIn,
    })),

    keyValueExtractions: (raw?.keyValueExtractions ?? []).map((kv) => ({
      key: kv?.key ?? '',
      value: kv?.value ?? '',
      source: {
        documentId: kv?.source?.documentId ?? '',
        documentName: kv?.source?.documentName ?? 'Unknown',
        quote: kv?.source?.quote,
      },
    })),

    inferencesAndNotes: (raw?.inferencesAndNotes ?? []).map((n) => ({
      note: n?.note ?? '',
      isInference: n?.isInference ?? true,
      confidence: n?.confidence,
      sources: n?.sources?.map((s) => ({
        documentId: s?.documentId ?? '',
        documentName: s?.documentName ?? 'Unknown',
        quote: s?.quote,
      })),
    })),
  };
}

/**
 * Convert raw comparison records into typed ComparisonRow[].
 */
function normalizeComparisonTable(raw?: Record<string, unknown>[]): ComparisonRow[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw.map((row) => {
    const field = String(row?.['field'] ?? 'Unknown');
    const status = (['match', 'conflict', 'partial', 'missing'].includes(String(row?.['status'] ?? ''))
      ? String(row?.['status'])
      : 'partial') as ComparisonRow['status'];

    const values: Record<string, string> = {};
    for (const [key, val] of Object.entries(row ?? {})) {
      if (key !== 'field' && key !== 'status') {
        values[key] = String(val ?? 'N/A');
      }
    }

    return { field, values, status };
  });
}
