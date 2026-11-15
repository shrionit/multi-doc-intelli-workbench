import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UploadZone } from './components/upload/UploadZone';
import { DocumentList } from './components/upload/DocumentList';
import { PromptInput } from './components/analysis/PromptInput';
import { AnalysisTrigger } from './components/analysis/AnalysisTrigger';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { useDocuments } from './hooks/useDocuments';
import { useAnalysis } from './hooks/useAnalysis';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const { documents, uploading, loading, error: docError, uploadErrors, refresh, upload, remove } = useDocuments();
  const { session, analyzing, error: analysisError, runAnalysis } = useAnalysis();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  // Load documents on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Show upload errors as toasts
  useEffect(() => {
    uploadErrors.forEach((e) => toast.error(`${e.filename}: ${e.error}`));
  }, [uploadErrors]);

  useEffect(() => {
    if (docError) toast.error(docError);
  }, [docError]);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    try {
      const result = await upload(files);
      if (result?.successful?.length) {
        toast.success(`${result.successful.length} file(s) uploaded successfully`);
        // Auto-select newly uploaded files
        setSelectedIds((prev) => [
          ...prev,
          ...result.successful.map((d) => d.id),
        ]);
      }
    } catch {
      // Error already handled in hook
    }
  }, [upload]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === documents.length ? [] : documents.map((d) => d.id),
    );
  }, [documents]);

  const handleDelete = useCallback(async (id: string) => {
    await remove(id);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    toast.success('Document deleted');
  }, [remove]);

  const handleRunAnalysis = useCallback(async () => {
    if (selectedIds.length === 0 || !prompt.trim()) return;
    try {
      await runAnalysis(selectedIds, prompt);
      toast.success('Analysis completed');
    } catch {
      toast.error('Analysis failed');
    }
  }, [selectedIds, prompt, runAnalysis]);

  return (
    <ErrorBoundary>
      <Layout>
        <Toaster position="top-right" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Upload & Documents */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">📁 Documents</h2>
              <UploadZone onFilesSelected={handleFilesSelected} uploading={uploading} />
              <div className="mt-4">
                <DocumentList
                  documents={documents}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onDelete={handleDelete}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <PromptInput value={prompt} onChange={setPrompt} disabled={analyzing} />
              <AnalysisTrigger
                onRun={handleRunAnalysis}
                disabled={uploading || loading}
                analyzing={analyzing}
                selectedCount={selectedIds.length}
                hasPrompt={!!prompt.trim()}
              />
            </div>
          </div>

          {/* Right panel: Results */}
          <div className="lg:col-span-2">
            <ResultsDashboard
              result={session?.result ?? null}
              error={analysisError ?? session?.error}
              analyzing={analyzing}
            />
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  );
}
