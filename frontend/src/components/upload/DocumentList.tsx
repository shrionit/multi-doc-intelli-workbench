import React from 'react';
import type { DocumentInfo } from '../../types';

interface DocumentListProps {
  documents: DocumentInfo[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDelete: (id: string) => void;
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  txt: '📝',
  csv: '📊',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function DocumentList({ documents, selectedIds, onToggleSelect, onSelectAll, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No documents uploaded yet. Use the upload area above.
      </div>
    );
  }

  const allSelected = documents.length > 0 && selectedIds.length === documents.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Select all ({documents.length})
        </label>
        <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
      </div>

      {documents.map((doc) => {
        const selected = selectedIds.includes(doc.id);
        return (
          <div
            key={doc.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer
              ${selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            onClick={() => onToggleSelect(doc.id)}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(doc.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-lg">{FILE_ICONS[doc.fileType] ?? '📎'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
              <p className="text-xs text-gray-400">
                {doc.fileType.toUpperCase()} · {formatBytes(doc.size)} · {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className="text-gray-400 hover:text-red-500 p-1"
              title="Delete document"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
