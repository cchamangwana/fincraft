'use client';

import { useState, useCallback } from 'react';
import PortfolioForm from '@/components/PortfolioForm';
import PortfolioResult from '@/components/PortfolioResult';
import { UserProfile, PortfolioRecommendation } from '@/types';

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (profile: UserProfile, marketContext: string, fileContent: string) => {
    setIsLoading(true);
    setError(null);
    setPortfolio(null);

    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          marketContext,
          spendingData: fileContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate portfolio');
      }

      const result: PortfolioRecommendation = await response.json();
      setPortfolio(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-200 font-sans text-text-primary">
      <header className="bg-brand-primary shadow-md">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-white">FinCraft AI</h1>
          <p className="text-sm text-blue-200">Your Personalized Portfolio Architect</p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Investment Profile</h2>
            <PortfolioForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">AI-Generated Portfolio</h2>
            <PortfolioResult portfolio={portfolio} isLoading={isLoading} error={error} />
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-text-secondary text-sm">
        <p>Disclaimer: FinCraft AI provides recommendations for informational purposes only and does not constitute financial advice.</p>
        <p>&copy; {new Date().getFullYear()} FinCraft AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
