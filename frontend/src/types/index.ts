import { z } from 'zod';

// ── Document types ──

export type SupportedFileType = 'pdf' | 'txt' | 'csv';

export interface DocumentInfo {
  id: string;
  filename: string;
  size: number;
  fileType: SupportedFileType;
  createdAt: string;
}

export interface UploadResponse {
  successful: DocumentInfo[];
  failed: Array<{ filename: string; error: string }>;
}

// ── Provenance ──

export interface Provenance {
  documentId: string;
  documentName: string;
  quote?: string;
}

// ── Extracted facts (mirrors backend) ──

export const ExtractedFactsSchema = z.object({
  documentId: z.string(),
  documentName: z.string(),
  entities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    quote: z.string().optional(),
  })),
  dates: z.array(z.object({
    label: z.string(),
    value: z.string(),
    quote: z.string().optional(),
  })),
  obligations: z.array(z.object({
    description: z.string(),
    parties: z.array(z.string()).optional(),
    quote: z.string().optional(),
  })),
  financialValues: z.array(z.object({
    label: z.string(),
    value: z.string(),
    currency: z.string().optional(),
    quote: z.string().optional(),
  })),
  keyValues: z.record(z.string(), z.string()).optional(),
  rawTextSnippet: z.string().optional(),
});
export type ExtractedFacts = z.infer<typeof ExtractedFactsSchema>;

// ── Analysis result types ──

export interface ComparisonRow {
  field: string;
  values: Record<string, string>;
  status: 'match' | 'conflict' | 'partial' | 'missing';
}

export interface Discrepancy {
  field: string;
  description: string;
  sources: Provenance[];
}

export interface MissingInfo {
  field: string;
  description: string;
  expectedIn?: string;
}

export interface KeyValueExtraction {
  key: string;
  value: string;
  source: Provenance;
}

export interface InferenceNote {
  note: string;
  isInference: boolean;
  confidence?: 'high' | 'medium' | 'low';
  sources?: Provenance[];
}

export interface NormalizedAnalysisResult {
  summary: string;
  comparisonTable: ComparisonRow[];
  discrepancies: Discrepancy[];
  missingInformation: MissingInfo[];
  keyValueExtractions: KeyValueExtraction[];
  inferencesAndNotes: InferenceNote[];
}

export interface AnalysisSession {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: NormalizedAnalysisResult | null;
  error: string | null;
  documentIds: string[];
  createdAt: string;
}
