import React from 'react';
import type { KeyValueExtraction } from '../../types';
import { ProvenanceChip } from './ProvenanceChip';

interface KeyValuePanelProps {
  items?: KeyValueExtraction[];
}

export function KeyValuePanel({ items }: KeyValuePanelProps) {
  if (!items?.length) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        🔑 Key-Value Extractions ({items.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((kv, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium text-gray-500 uppercase">{kv?.key ?? ''}</span>
              <p className="text-sm font-medium text-gray-900 truncate">{kv?.value ?? ''}</p>
            </div>
            <div className="ml-2 flex-shrink-0">
              <ProvenanceChip source={kv?.source ?? { documentId: '', documentName: 'Unknown' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
