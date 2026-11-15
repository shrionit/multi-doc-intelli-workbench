import { ExtractedFacts } from '../types/llm.types';
import { AnalysisOutput } from '../types/llm.types';

/**
 * Interface for LLM providers.
 * Implement this to add a new provider (Gemini, OpenAI, etc.).
 */
export interface ILLMProvider {
  /** Unique name of this provider (e.g. 'mock', 'gemini', 'openai') */
  readonly name: string;

  /**
   * Stage 1: Extract entities, dates, obligations, financial values
   * from a single document's content.
   */
  extractFacts(
    content: string,
    documentId: string,
    documentName: string,
    fileType: string,
  ): Promise<ExtractedFacts>;

  /**
   * Stage 2: Cross-document analysis using cached facts + user prompt.
   */
  analyzeDocuments(
    facts: ExtractedFacts[],
    userPrompt: string,
  ): Promise<AnalysisOutput>;
}
