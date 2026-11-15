import { z } from 'zod';

// ── Provenance: ties a finding back to its source document ──

export const ProvenanceSchema = z.object({
  documentId: z.string(),
  documentName: z.string(),
  quote: z.string().optional(),
  page: z.number().optional(),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

// ── Stage 1: per-document extraction ──

export const EntitySchema = z.object({
  name: z.string(),
  type: z.string(), // person | organization | location | other
  quote: z.string().optional(),
});

export const DateEntrySchema = z.object({
  label: z.string(),
  value: z.string(),
  quote: z.string().optional(),
});

export const ObligationSchema = z.object({
  description: z.string(),
  parties: z.array(z.string()).optional(),
  quote: z.string().optional(),
});

export const FinancialValueSchema = z.object({
  label: z.string(),
  value: z.string(),
  currency: z.string().optional(),
  quote: z.string().optional(),
});

export const ExtractedFactsSchema = z.object({
  documentId: z.string(),
  documentName: z.string(),
  entities: z.array(EntitySchema),
  dates: z.array(DateEntrySchema),
  obligations: z.array(ObligationSchema),
  financialValues: z.array(FinancialValueSchema),
  keyValues: z.record(z.string(), z.string()).optional(),
  rawTextSnippet: z.string().optional(),
});
export type ExtractedFacts = z.infer<typeof ExtractedFactsSchema>;

// ── Stage 2: cross-document analysis output ──

export const AnalysisOutputSchema = z.object({
  summary: z.string().optional(),
  comparisonTable: z.array(z.record(z.string(), z.unknown())).optional(),
  discrepancies: z.array(z.object({
    field: z.string(),
    description: z.string(),
    sources: z.array(ProvenanceSchema),
  })).optional(),
  missingInformation: z.array(z.object({
    field: z.string(),
    description: z.string(),
    expectedIn: z.string().optional(),
  })).optional(),
  keyValueExtractions: z.array(z.object({
    key: z.string(),
    value: z.string(),
    source: ProvenanceSchema,
  })).optional(),
  inferencesAndNotes: z.array(z.object({
    note: z.string(),
    isInference: z.boolean(),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
    sources: z.array(ProvenanceSchema).optional(),
  })).optional(),
});
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;
