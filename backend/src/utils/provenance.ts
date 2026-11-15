import { Provenance } from '../types/llm.types';

/**
 * Create a provenance tag for a finding.
 */
export function createProvenance(
  documentId: string,
  documentName: string,
  quote?: string,
  page?: number,
): Provenance {
  return {
    documentId,
    documentName,
    ...(quote ? { quote } : {}),
    ...(page !== undefined ? { page } : {}),
  };
}
