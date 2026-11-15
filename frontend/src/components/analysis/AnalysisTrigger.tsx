import React from 'react';

interface AnalysisTriggerProps {
  onRun: () => void;
  disabled: boolean;
  analyzing: boolean;
  selectedCount: number;
  hasPrompt: boolean;
}

export function AnalysisTrigger({ onRun, disabled, analyzing, selectedCount, hasPrompt }: AnalysisTriggerProps) {
  const canRun = !disabled && !analyzing && selectedCount > 0 && hasPrompt;

  let label = 'Run Analysis';
  if (analyzing) label = 'Analyzing...';
  else if (selectedCount === 0) label = 'Select documents first';
  else if (!hasPrompt) label = 'Enter an analysis prompt';

  return (
    <button
      onClick={onRun}
      disabled={!canRun}
      className={`w-full py-3 px-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2
        ${canRun
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
    >
      {analyzing && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {label}
    </button>
  );
}
