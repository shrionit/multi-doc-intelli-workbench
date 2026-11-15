import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/document.service';

export async function uploadDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided. Please upload at least one document.' });
      return;
    }

    const result = await documentService.uploadDocuments(
      files.map((f) => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        buffer: f.buffer,
      })),
    );

    const statusCode = result.failed.length > 0
      ? (result.successful.length > 0 ? 207 : 400)
      : 201;

    res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAllDocuments(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const docs = await documentService.getAllDocuments();
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
}

export async function getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await documentService.getDocumentById(req.params.id);
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await documentService.deleteDocument(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
