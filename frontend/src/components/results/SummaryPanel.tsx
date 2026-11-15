import React from 'react';

interface SummaryPanelProps {
  summary?: string;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        📝 Summary
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
    </div>
  );
}
