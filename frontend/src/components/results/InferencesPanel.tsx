import React from 'react';
import type { InferenceNote } from '../../types';
import { ProvenanceChip } from './ProvenanceChip';

interface InferencesPanelProps {
  items?: InferenceNote[];
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-orange-100 text-orange-700',
};

export function InferencesPanel({ items }: InferencesPanelProps) {
  if (!items?.length) return null;

  const facts = items.filter((n) => !n?.isInference);
  const inferences = items.filter((n) => n?.isInference);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        💡 Facts & Inferences
      </h3>

      {facts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">📌 Extracted Facts</h4>
          <div className="space-y-2">
            {facts.map((n, i) => (
              <NoteItem key={`fact-${i}`} note={n} />
            ))}
          </div>
        </div>
      )}

      {inferences.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">🤖 AI Inferences</h4>
          <div className="space-y-2">
            {inferences.map((n, i) => (
              <NoteItem key={`inf-${i}`} note={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoteItem({ note }: { note: InferenceNote }) {
  return (
    <div className={`p-3 rounded-lg border ${note?.isInference ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm flex-1">{note?.note ?? ''}</span>
        {note?.confidence && (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${CONFIDENCE_STYLES[note.confidence] ?? ''}`}>
            {note.confidence}
          </span>
        )}
      </div>
      {note?.sources?.length ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {note.sources.map((s, j) => (
            <ProvenanceChip key={j} source={s} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
