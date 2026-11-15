import React from 'react';
import type { MissingInfo } from '../../types';

interface MissingInfoPanelProps {
  items?: MissingInfo[];
}

export function MissingInfoPanel({ items }: MissingInfoPanelProps) {
  if (!items?.length) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        🔍 Missing Information ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((m, i) => (
          <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <span className="text-amber-500 mt-0.5">•</span>
            <div>
              <p className="text-sm font-medium text-amber-800">{m?.field ?? 'Unknown'}</p>
              <p className="text-sm text-amber-600">{m?.description ?? ''}</p>
              {m?.expectedIn && (
                <p className="text-xs text-amber-500 mt-1">Expected in: {m.expectedIn}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
