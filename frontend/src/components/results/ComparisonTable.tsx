import React from 'react';
import type { ComparisonRow } from '../../types';

interface ComparisonTableProps {
  rows?: ComparisonRow[];
}

const STATUS_STYLES: Record<string, string> = {
  match: 'bg-green-100 text-green-700',
  conflict: 'bg-red-100 text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
  missing: 'bg-gray-100 text-gray-500',
};

export function ComparisonTable({ rows }: ComparisonTableProps) {
  if (!rows?.length) return null;

  // Get all document columns
  const docNames = [...new Set(rows.flatMap((r) => Object.keys(r?.values ?? {})))];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          📊 Comparison Table
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Field</th>
              {docNames.map((name) => (
                <th key={name} className="text-left px-4 py-2 font-medium text-gray-600 max-w-[200px] truncate">
                  {name}
                </th>
              ))}
              <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{row?.field ?? ''}</td>
                {docNames.map((name) => (
                  <td key={name} className="px-4 py-2 text-gray-600 max-w-[200px] truncate">
                    {row?.values?.[name] ?? 'N/A'}
                  </td>
                ))}
                <td className="px-4 py-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row?.status ?? 'missing'] ?? STATUS_STYLES.missing}`}>
                    {row?.status ?? 'unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
