import { AnalysisOutput } from './llm.types';

export interface ComparisonRow {
  field: string;
  values: Record<string, string>; // documentId → value
  status: 'match' | 'conflict' | 'partial' | 'missing';
}

export interface NormalizedAnalysisResult {
  summary: string;
  comparisonTable: ComparisonRow[];
  discrepancies: Array<{
    field: string;
    description: string;
    sources: Array<{
      documentId: string;
      documentName: string;
      quote?: string;
    }>;
  }>;
  missingInformation: Array<{
    field: string;
    description: string;
    expectedIn?: string;
  }>;
  keyValueExtractions: Array<{
    key: string;
    value: string;
    source: {
      documentId: string;
      documentName: string;
      quote?: string;
    };
  }>;
  inferencesAndNotes: Array<{
    note: string;
    isInference: boolean;
    confidence?: 'high' | 'medium' | 'low';
    sources?: Array<{
      documentId: string;
      documentName: string;
      quote?: string;
    }>;
  }>;
}

export interface AnalysisSessionResponse {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: NormalizedAnalysisResult | null;
  error: string | null;
  documentIds: string[];
  createdAt: Date;
}
