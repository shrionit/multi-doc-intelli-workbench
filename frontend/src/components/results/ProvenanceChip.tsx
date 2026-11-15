import React from 'react';
import type { Provenance } from '../../types';

interface ProvenanceChipProps {
  source: Provenance;
}

export function ProvenanceChip({ source }: ProvenanceChipProps) {
  return (
    <span className="relative group inline-flex items-center">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 cursor-help">
        📎 {source?.documentName ?? 'Unknown'}
      </span>
      {source?.quote && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
          <span className="italic">"{source.quote}"</span>
        </span>
      )}
    </span>
  );
}
