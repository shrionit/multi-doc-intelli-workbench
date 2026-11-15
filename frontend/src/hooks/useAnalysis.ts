import { useState, useCallback } from 'react';
import type { AnalysisSession } from '../types';
import * as api from '../api/client';

export function useAnalysis() {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (documentIds: string[], prompt: string) => {
    setAnalyzing(true);
    setError(null);
    setSession(null);
    try {
      const result = await api.createAnalysis(documentIds, prompt);
      setSession(result);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return { session, analyzing, error, runAnalysis, clearSession };
}
