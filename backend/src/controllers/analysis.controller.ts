import { Request, Response, NextFunction } from 'express';
import * as analysisService from '../services/analysis.service';

export async function createAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { documentIds, prompt } = req.body as { documentIds?: string[]; prompt?: string };

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(400).json({ error: 'documentIds must be a non-empty array of document IDs.' });
      return;
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'prompt must be a non-empty string describing the analysis.' });
      return;
    }

    const result = await analysisService.createAnalysisSession(documentIds, prompt.trim());
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = await analysisService.getAnalysisSession(id);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function getAllAnalyses(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessions = await analysisService.getAllAnalysisSessions();
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}
