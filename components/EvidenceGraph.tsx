'use client';

import React, { useState, useMemo } from 'react';
import { EvidenceSupport, Citation } from '@/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EvidenceGraphProps {
  evidenceData: EvidenceSupport[];
  overallConfidence?: number;
}

interface TooltipData {
  category: string;
  citations: Citation[];
  avgConfidence: number;
  alignmentScore?: number;
  sourceCount: number;
}

const COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const ConfidenceBadge: React.FC<{ level: 'high' | 'medium' | 'low'; value: number }> = ({ level, value }) => {
  const colors = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level]}`}>
      {(value * 100).toFixed(0)}%
    </span>
  );
};

const CustomPieTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-xs">
        <p className="font-bold text-text-primary">{data.category}</p>
        <p className="text-sm text-text-secondary">
          {data.sourceCount} source{data.sourceCount !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs">Confidence:</span>
          <ConfidenceBadge 
            level={data.avgConfidence >= 0.85 ? 'high' : data.avgConfidence >= 0.7 ? 'medium' : 'low'} 
            value={data.avgConfidence} 
          />
        </div>
      </div>
    );
  }
  return null;
};

const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ evidenceData, overallConfidence }) => {
  const [selectedCategory, setSelectedCategory] = useState<TooltipData | null>(null);
  
  // Prepare data for pie chart - using source count as the value
  const chartData = useMemo(() => {
    return evidenceData.map((evidence, index) => ({
      name: evidence.category,
      value: Math.max(evidence.sourceCount, 1), // Ensure at least 1 for visibility
      category: evidence.category,
      sourceCount: evidence.sourceCount,
      avgConfidence: evidence.avgConfidence,
      confidenceLevel: evidence.confidenceLevel,
      alignmentScore: evidence.alignmentScore,
      citations: evidence.supportingCitations,
      fill: COLORS[index % COLORS.length],
    }));
  }, [evidenceData]);

  const overallLevel = overallConfidence
    ? overallConfidence >= 0.85 ? 'high' : overallConfidence >= 0.7 ? 'medium' : 'low'
    : 'medium';

  const handlePieClick = (data: any) => {
    setSelectedCategory({
      category: data.category,
      citations: data.citations,
      avgConfidence: data.avgConfidence,
      alignmentScore: data.alignmentScore,
      sourceCount: data.sourceCount,
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 p-5 rounded-xl">
      {/* Header with overall confidence */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="font-bold text-slate-800">Evidence Graph</h4>
        </div>
        {overallConfidence !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Overall Confidence:</span>
            <ConfidenceBadge level={overallLevel} value={overallConfidence} />
          </div>
        )}
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Visual representation of evidence strength per asset class. Click on a segment to see detailed sources.
      </p>

      {/* Legend for confidence levels */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>High confidence (≥85%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span>Medium (70-84%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Low (&lt;70%)</span>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, avgConfidence }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                const confidenceColor = avgConfidence >= 0.85 ? '#22c55e' : avgConfidence >= 0.7 ? '#eab308' : '#ef4444';
                return (
                  <text x={x} y={y} fill={confidenceColor} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="bold">
                    {`${(avgConfidence * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Evidence summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {evidenceData.map((evidence, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCategory?.category === evidence.category
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setSelectedCategory({
              category: evidence.category,
              citations: evidence.supportingCitations,
              avgConfidence: evidence.avgConfidence,
              alignmentScore: evidence.alignmentScore,
              sourceCount: evidence.sourceCount,
            })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-sm text-text-primary truncate">{evidence.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {evidence.sourceCount} source{evidence.sourceCount !== 1 ? 's' : ''}
              </span>
              <ConfidenceBadge level={evidence.confidenceLevel} value={evidence.avgConfidence} />
            </div>
            {evidence.alignmentScore !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                  <span>Alignment</span>
                  <span>{(evidence.alignmentScore * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${evidence.alignmentScore * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected category detail panel */}
      {selectedCategory && (
        <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-brand-primary">{selectedCategory.category}</h5>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-text-secondary">Sources</p>
              <p className="font-bold text-lg">{selectedCategory.sourceCount}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-text-secondary">Avg Confidence</p>
              <p className="font-bold text-lg">{(selectedCategory.avgConfidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          {selectedCategory.alignmentScore !== undefined && (
            <p className="text-sm text-text-secondary mb-3">
              Evidence alignment: <strong>{(selectedCategory.alignmentScore * 100).toFixed(0)}%</strong> match between sources and recommendation
            </p>
          )}

          {selectedCategory.citations.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Supporting Sources:</p>
              <ul className="space-y-2">
                {selectedCategory.citations.map((citation, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-blue-600 font-medium">[{idx + 1}]</span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={citation.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline block truncate"
                      >
                        {citation.title}
                      </a>
                      {citation.confidence !== undefined && (
                        <span className="text-xs text-text-secondary">
                          Confidence: {(citation.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-text-secondary italic">
              No specific sources identified for this category. Evidence is derived from general market data.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidenceGraph;
