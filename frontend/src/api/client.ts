import axios from 'axios';
import type { DocumentInfo, UploadResponse, AnalysisSession } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// ── Documents ──

export async function uploadDocuments(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const { data } = await api.post<UploadResponse>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchDocuments(): Promise<DocumentInfo[]> {
  const { data } = await api.get<{ documents: DocumentInfo[] }>('/documents');
  return data.documents;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

// ── Analysis ──

export async function createAnalysis(
  documentIds: string[],
  prompt: string,
): Promise<AnalysisSession> {
  const { data } = await api.post<AnalysisSession>('/analysis', { documentIds, prompt });
  return data;
}

export async function fetchAnalysis(id: string): Promise<AnalysisSession> {
  const { data } = await api.get<AnalysisSession>(`/analysis/${id}`);
  return data;
}

export async function fetchAllAnalyses(): Promise<AnalysisSession[]> {
  const { data } = await api.get<{ sessions: AnalysisSession[] }>('/analysis');
  return data.sessions;
}
