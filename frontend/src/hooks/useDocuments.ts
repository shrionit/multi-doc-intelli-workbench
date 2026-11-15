import { useState, useCallback } from 'react';
import type { DocumentInfo } from '../types';
import * as api from '../api/client';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Array<{ filename: string; error: string }>>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await api.fetchDocuments();
      setDocuments(docs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(async (files: File[]) => {
    setUploading(true);
    setError(null);
    setUploadErrors([]);
    try {
      const result = await api.uploadDocuments(files);
      if (result.failed.length > 0) {
        setUploadErrors(result.failed);
      }
      // Refresh the list to include newly uploaded docs
      await refresh();
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  }, []);

  return { documents, uploading, loading, error, uploadErrors, refresh, upload, remove };
}
