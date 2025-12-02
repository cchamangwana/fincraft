'use client';

import React from 'react';
import { TransparencyMode } from '@/types';

interface TransparencyModeSelectorProps {
  selectedMode: TransparencyMode;
  onModeChange: (mode: TransparencyMode) => void;
}

const modes = [
  {
    mode: TransparencyMode.BASELINE_OPAQUE,
    label: 'Baseline',
    description: 'Clean output without sources',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    mode: TransparencyMode.CITATION_ENHANCED,
    label: 'Citations',
    description: 'Sources with confidence scores',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    mode: TransparencyMode.SYNTHESIS_TRANSPARENT,
    label: 'Synthesis',
    description: 'Rationale & retrieved text',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    mode: TransparencyMode.GRAPH_AUGMENTED,
    label: 'Evidence Graph',
    description: 'Visual evidence strength',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const TransparencyModeSelector: React.FC<TransparencyModeSelectorProps> = ({
  selectedMode,
  onModeChange,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3 className="text-sm font-semibold text-text-primary">Transparency Level</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modes.map(({ mode, label, description, icon }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedMode === mode
                ? 'border-brand-primary bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className={`flex items-center gap-2 mb-1 ${selectedMode === mode ? 'text-brand-primary' : 'text-gray-600'}`}>
              {icon}
              <span className="font-medium text-sm">{label}</span>
            </div>
            <p className="text-xs text-text-secondary">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransparencyModeSelector;
