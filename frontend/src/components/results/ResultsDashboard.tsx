import React from 'react';
import type { NormalizedAnalysisResult } from '../../types';
import { SummaryPanel } from './SummaryPanel';
import { ComparisonTable } from './ComparisonTable';
import { DiscrepancyList } from './DiscrepancyList';
import { MissingInfoPanel } from './MissingInfoPanel';
import { KeyValuePanel } from './KeyValuePanel';
import { InferencesPanel } from './InferencesPanel';
import { CopyButtons } from './CopyButtons';

interface ResultsDashboardProps {
  result: NormalizedAnalysisResult | null;
  error?: string | null;
  analyzing?: boolean;
}

export function ResultsDashboard({ result, error, analyzing }: ResultsDashboardProps) {
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="animate-spin w-8 h-8 mb-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-medium">Analyzing documents...</p>
        <p className="text-xs mt-1">Extracting facts and running cross-document analysis</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-700 font-semibold text-sm mb-1">Analysis Failed</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Upload documents, select them, provide an instruction, and run analysis to see results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Analysis Results</h2>
        <CopyButtons result={result} />
      </div>

      <SummaryPanel summary={result?.summary} />
      <ComparisonTable rows={result?.comparisonTable} />
      <DiscrepancyList discrepancies={result?.discrepancies} />
      <MissingInfoPanel items={result?.missingInformation} />
      <KeyValuePanel items={result?.keyValueExtractions} />
      <InferencesPanel items={result?.inferencesAndNotes} />
    </div>
  );
}
