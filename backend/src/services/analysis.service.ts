import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getLLMProvider } from '../llm/llm.factory';
import { normalizeAnalysisOutput } from './normalizer.service';
import { ExtractedFacts, ExtractedFactsSchema } from '../types/llm.types';
import { NormalizedAnalysisResult, AnalysisSessionResponse } from '../types/analysis.types';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

/**
 * Create and run an analysis session.
 */
export async function createAnalysisSession(
  documentIds: string[],
  prompt: string,
): Promise<AnalysisSessionResponse> {
  if (!documentIds.length) throw createError('At least one document is required', 400);
  if (!prompt.trim()) throw createError('Analysis prompt is required', 400);

  // Verify all documents exist
  const documents = await prisma.document.findMany({
    where: { id: { in: documentIds } },
  });

  if (documents.length !== documentIds.length) {
    const found = new Set(documents.map((d) => d.id));
    const missing = documentIds.filter((id) => !found.has(id));
    throw createError(`Documents not found: ${missing.join(', ')}`, 404);
  }

  // Create session
  const session = await prisma.analysisSession.create({
    data: {
      id: uuidv4(),
      prompt,
      status: 'processing',
      documents: {
        create: documentIds.map((docId) => ({
          id: uuidv4(),
          documentId: docId,
        })),
      },
    },
  });

  // Run analysis asynchronously (but wait for it in this implementation)
  try {
    const result = await runAnalysis(documents, prompt);

    await prisma.analysisSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        result: JSON.stringify(result),
      },
    });

    return {
      id: session.id,
      prompt,
      status: 'completed',
      result,
      error: null,
      documentIds,
      createdAt: session.createdAt,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    await prisma.analysisSession.update({
      where: { id: session.id },
      data: {
        status: 'failed',
        error: errorMsg,
      },
    });

    throw createError(`Analysis failed: ${errorMsg}`, 500);
  }
}

/**
 * Run the two-stage analysis pipeline.
 */
async function runAnalysis(
  documents: Array<{ id: string; filename: string; content: string; fileType: string }>,
  prompt: string,
): Promise<NormalizedAnalysisResult> {
  const llm = getLLMProvider();

  // ── Stage 1: Extract facts per document ──
  const allFacts: ExtractedFacts[] = [];

  for (const doc of documents) {
    // Check for cached facts
    const cached = await prisma.documentFacts.findFirst({
      where: { documentId: doc.id },
      orderBy: { createdAt: 'desc' },
    });

    let facts: ExtractedFacts;

    if (cached) {
      facts = JSON.parse(cached.facts) as ExtractedFacts;
    } else {
      facts = await llm.extractFacts(doc.content, doc.id, doc.filename, doc.fileType);

      // Validate with Zod schema
      const validation = ExtractedFactsSchema.safeParse(facts);
      if (!validation.success) {
        console.warn(`⚠️ Facts schema validation warning for ${doc.filename}:`, validation.error.issues);
        // Still proceed but log the warning
      }

      // Cache the extracted facts
      await prisma.documentFacts.create({
        data: {
          id: uuidv4(),
          documentId: doc.id,
          facts: JSON.stringify(facts),
        },
      });
    }

    allFacts.push(facts);
  }

  // ── Stage 2: Cross-document analysis ──
  const analysisOutput = await llm.analyzeDocuments(allFacts, prompt);

  // ── Normalize into standard output shape ──
  return normalizeAnalysisOutput(analysisOutput);
}

/**
 * Get an analysis session by ID.
 */
export async function getAnalysisSession(id: string): Promise<AnalysisSessionResponse> {
  const session = await prisma.analysisSession.findUnique({
    where: { id },
    include: { documents: true },
  });

  if (!session) throw createError(`Analysis session not found: ${id}`, 404);

  return {
    id: session.id,
    prompt: session.prompt,
    status: session.status as AnalysisSessionResponse['status'],
    result: session.result ? JSON.parse(session.result) : null,
    error: session.error,
    documentIds: session.documents.map((d) => d.documentId),
    createdAt: session.createdAt,
  };
}

/**
 * Get all analysis sessions.
 */
export async function getAllAnalysisSessions(): Promise<AnalysisSessionResponse[]> {
  const sessions = await prisma.analysisSession.findMany({
    include: { documents: true },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((s) => ({
    id: s.id,
    prompt: s.prompt,
    status: s.status as AnalysisSessionResponse['status'],
    result: s.result ? JSON.parse(s.result) : null,
    error: s.error,
    documentIds: s.documents.map((d) => d.documentId),
    createdAt: s.createdAt,
  }));
}
