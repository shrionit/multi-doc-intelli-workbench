import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const EXAMPLE_PROMPTS = [
  'Compare the information across all uploaded documents.',
  'Identify inconsistencies between the documents.',
  'Extract key dates, obligations, financial values, and missing information.',
  'Compare the financial position of the companies in these documents.',
  'Highlight discrepancies in names, addresses, or revenue figures.',
];

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Analysis Instruction
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="Describe what you want to analyze across the documents..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none disabled:opacity-50"
      />
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onChange(prompt)}
            disabled={disabled}
            className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50"
          >
            {prompt.length > 50 ? prompt.slice(0, 50) + '…' : prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
