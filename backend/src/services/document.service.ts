import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ingestDocument } from '../ingestion';
import { DocumentUploadResult, SupportedFileType } from '../types/document.types';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface UploadFileInput {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Upload and ingest a single document.
 */
export async function uploadDocument(file: UploadFileInput): Promise<DocumentUploadResult> {
  const result = await ingestDocument(file.originalname, file.mimetype, file.size, file.buffer);

  if (!result.success || !result.content || !result.fileType) {
    throw createError(result.error ?? 'Failed to process document', 400);
  }

  const doc = await prisma.document.create({
    data: {
      id: uuidv4(),
      filename: file.originalname,
      size: file.size,
      fileType: result.fileType,
      content: result.content,
    },
  });

  return {
    id: doc.id,
    filename: doc.filename,
    size: doc.size,
    fileType: doc.fileType as SupportedFileType,
    createdAt: doc.createdAt,
  };
}

/**
 * Upload multiple documents.
 */
export async function uploadDocuments(files: UploadFileInput[]): Promise<{
  successful: DocumentUploadResult[];
  failed: Array<{ filename: string; error: string }>;
}> {
  const successful: DocumentUploadResult[] = [];
  const failed: Array<{ filename: string; error: string }> = [];

  for (const file of files) {
    try {
      const doc = await uploadDocument(file);
      successful.push(doc);
    } catch (err: unknown) {
      failed.push({
        filename: file.originalname,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { successful, failed };
}

/**
 * Get all documents (metadata only, no content).
 */
export async function getAllDocuments(): Promise<DocumentUploadResult[]> {
  const docs = await prisma.document.findMany({
    select: { id: true, filename: true, size: true, fileType: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return docs.map((d) => ({
    id: d.id,
    filename: d.filename,
    size: d.size,
    fileType: d.fileType as SupportedFileType,
    createdAt: d.createdAt,
  }));
}

/**
 * Get a single document by ID.
 */
export async function getDocumentById(id: string) {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) throw createError(`Document not found: ${id}`, 404);
  return doc;
}

/**
 * Delete a document by ID.
 */
export async function deleteDocument(id: string): Promise<void> {
  const exists = await prisma.document.findUnique({ where: { id } });
  if (!exists) throw createError(`Document not found: ${id}`, 404);
  await prisma.document.delete({ where: { id } });
}
