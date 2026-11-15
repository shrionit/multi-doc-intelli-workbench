import React from 'react';
import type { Discrepancy } from '../../types';
import { ProvenanceChip } from './ProvenanceChip';

interface DiscrepancyListProps {
  discrepancies?: Discrepancy[];
}

export function DiscrepancyList({ discrepancies }: DiscrepancyListProps) {
  if (!discrepancies?.length) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        ⚠️ Discrepancies ({discrepancies.length})
      </h3>
      <div className="space-y-3">
        {discrepancies.map((d, i) => (
          <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm font-medium text-red-800">{d?.field ?? 'Unknown field'}</p>
            <p className="text-sm text-red-600 mt-1">{d?.description ?? ''}</p>
            {d?.sources?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {d.sources.map((s, j) => (
                  <ProvenanceChip key={j} source={s} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
