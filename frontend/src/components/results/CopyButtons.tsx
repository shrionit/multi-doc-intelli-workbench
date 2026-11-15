import React, { useCallback } from 'react';
import type { NormalizedAnalysisResult } from '../../types';

interface CopyButtonsProps {
  result: NormalizedAnalysisResult;
}

export function CopyButtons({ result }: CopyButtonsProps) {
  const copyAsJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  }, [result]);

  const copyAsMarkdown = useCallback(() => {
    const md = buildMarkdown(result);
    navigator.clipboard.writeText(md);
  }, [result]);

  return (
    <div className="flex gap-2">
      <button
        onClick={copyAsMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        📋 Copy as Markdown
      </button>
      <button
        onClick={copyAsJSON}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        {'{ }'} Copy as JSON
      </button>
    </div>
  );
}

function buildMarkdown(r: NormalizedAnalysisResult): string {
  let md = `# Analysis Summary\n\n${r?.summary ?? 'N/A'}\n\n`;

  if (r?.comparisonTable?.length) {
    md += `## Comparison Table\n\n`;
    const cols = ['Field', ...Object.keys(r.comparisonTable[0]?.values ?? {}), 'Status'];
    md += `| ${cols.join(' | ')} |\n`;
    md += `| ${cols.map(() => '---').join(' | ')} |\n`;
    r.comparisonTable.forEach((row) => {
      const vals = Object.values(row?.values ?? {});
      md += `| ${row?.field ?? ''} | ${vals.join(' | ')} | ${row?.status ?? ''} |\n`;
    });
    md += '\n';
  }

  if (r?.discrepancies?.length) {
    md += `## Discrepancies\n\n`;
    r.discrepancies.forEach((d) => {
      md += `- **${d?.field ?? ''}**: ${d?.description ?? ''}\n`;
      d?.sources?.forEach((s) => md += `  - Source: ${s?.documentName ?? ''}${s?.quote ? ` ("${s.quote}")` : ''}\n`);
    });
    md += '\n';
  }

  if (r?.missingInformation?.length) {
    md += `## Missing Information\n\n`;
    r.missingInformation.forEach((m) => {
      md += `- **${m?.field ?? ''}**: ${m?.description ?? ''}${m?.expectedIn ? ` (expected in: ${m.expectedIn})` : ''}\n`;
    });
    md += '\n';
  }

  if (r?.keyValueExtractions?.length) {
    md += `## Key-Value Extractions\n\n`;
    r.keyValueExtractions.forEach((kv) => {
      md += `- **${kv?.key ?? ''}**: ${kv?.value ?? ''} _(${kv?.source?.documentName ?? ''})_\n`;
    });
    md += '\n';
  }

  if (r?.inferencesAndNotes?.length) {
    md += `## Notes & Inferences\n\n`;
    r.inferencesAndNotes.forEach((n) => {
      const tag = n?.isInference ? '🤖 Inference' : '📌 Fact';
      md += `- [${tag}] ${n?.note ?? ''}${n?.confidence ? ` (${n.confidence} confidence)` : ''}\n`;
    });
  }

  return md;
}
