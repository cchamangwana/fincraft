'use client';

import React, { useMemo } from 'react';
import { PortfolioRecommendation, UserProfile, Country } from '@/types';
import Card from '@/components/ui/Card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PortfolioResultProps {
  portfolio: PortfolioRecommendation | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded-md shadow-lg">
        <p className="font-bold">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const PortfolioResult: React.FC<PortfolioResultProps> = ({ portfolio, userProfile, isLoading, error }) => {

  // Get currency symbol based on user's country
  const currencySymbol = useMemo(() => {
    if (!userProfile) return '$';
    switch (userProfile.country) {
      case Country.MALAWI:
        return 'MWK';
      case Country.BOTSWANA:
        return 'BWP';
      default:
        return '$';
    }
  }, [userProfile]);

  const chartData = useMemo(() => {
    return portfolio?.recommended_portfolio.map(p => ({
      name: p.category,
      value: parseFloat(p.allocation),
    })) ?? [];
  }, [portfolio]);

  // Calculate actual amounts if investment amount is provided
  const calculateAmount = (percentage: string) => {
    if (!userProfile?.investmentAmount) return null;
    const amount = userProfile.investmentAmount;
    const percent = parseFloat(percentage) / 100;
    return (amount * percent).toLocaleString();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-text-secondary">Analyzing your profile and market data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] bg-red-50 p-4 rounded-lg">
          <p className="text-red-600 font-semibold">Error</p>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      );
    }

    if (!portfolio) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-text-primary">Ready to Build Your Future?</h3>
          <p className="mt-2 text-text-secondary">Fill out your investment profile to get a personalized portfolio recommendation from FinCraft AI.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Portfolio Summary</h3>
          <p className="mt-1 text-sm text-text-secondary">{portfolio.narrative_summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-secondary">Expected Return</p>
            <p className="text-xl font-bold text-brand-accent">{portfolio.expected_return}</p>
          </div>
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-secondary">Risk Level</p>
            <p className="text-xl font-bold text-text-primary">{portfolio.estimated_risk_level}</p>
          </div>
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-secondary">Horizon</p>
            <p className="text-xl font-bold text-text-primary">{portfolio.investment_horizon}</p>
          </div>
        </div>

        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                return <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              }}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Allocation Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Asset Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Allocation</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reasoning</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.recommended_portfolio.map((asset, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{asset.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {asset.allocation}
                      {calculateAmount(asset.allocation) && (
                        <span className="block text-xs text-brand-accent font-semibold mt-1">
                          {currencySymbol} {calculateAmount(asset.allocation)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-text-secondary">{asset.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citations Section - Display Google Search Grounding Sources */}
        {portfolio.citations && portfolio.citations.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-bold text-green-800">Grounded in Real-Time Data</h4>
            </div>
            <p className="text-sm text-green-700 mb-3">
              This portfolio recommendation is based on current market data from Google Search.
              {portfolio.searchQueries && portfolio.searchQueries.length > 0 && (
                <span className="block mt-2 text-xs italic">
                  Search queries: {portfolio.searchQueries.join(', ')}
                </span>
              )}
            </p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Sources:</p>
              <ul className="space-y-1">
                {portfolio.citations.map((citation, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={citation.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>[{index + 1}]</span>
                      <span>{citation.title}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-brand-secondary p-4 rounded-r-lg">
          <h4 className="font-bold text-brand-primary">Rebalancing Tip</h4>
          <p className="mt-1 text-sm text-text-secondary">{portfolio.rebalancing_tip}</p>
        </div>
      </div>
    );
  };

  return <Card>{renderContent()}</Card>;
};

export default PortfolioResult;
