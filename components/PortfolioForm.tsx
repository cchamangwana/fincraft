'use client';

import React, { useState, useCallback } from 'react';
import { UserProfile, RiskTolerance, PrimaryGoal } from '@/types';
import Card from '@/components/ui/Card';
import UploadIcon from '@/components/icons/UploadIcon';
import WandIcon from '@/components/icons/WandIcon';

interface PortfolioFormProps {
  onSubmit: (profile: UserProfile, marketContext: string, fileContent: string) => void;
  isLoading: boolean;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onSubmit, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    income: '',
    horizon: 10,
    riskTolerance: RiskTolerance.BALANCED,
    primaryGoal: PrimaryGoal.GROWTH,
  });
  const [marketContext, setMarketContext] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handleProfileChange = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileName('');
      setFileContent('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile, marketContext, fileContent);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Profile Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Your Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-text-secondary">Age</label>
              <input type="number" id="age" value={profile.age} onChange={e => handleProfileChange('age', e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="income" className="block text-sm font-medium text-text-secondary">Annual Income ($)</label>
              <input type="number" id="income" value={profile.income} onChange={e => handleProfileChange('income', e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="horizon" className="block text-sm font-medium text-text-secondary">Investment Horizon (Years)</label>
            <input type="number" id="horizon" value={profile.horizon} min="1" required onChange={e => handleProfileChange('horizon', e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-text-secondary">Risk Tolerance</label>
            <select id="riskTolerance" value={profile.riskTolerance} onChange={e => handleProfileChange('riskTolerance', e.target.value as RiskTolerance)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm">
              {Object.values(RiskTolerance).map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="primaryGoal" className="block text-sm font-medium text-text-secondary">Primary Goal</label>
            <select id="primaryGoal" value={profile.primaryGoal} onChange={e => handleProfileChange('primaryGoal', e.target.value as PrimaryGoal)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm">
              {Object.values(PrimaryGoal).map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
        </div>

        {/* Market Context Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Market Context</h3>
          <label htmlFor="marketContext" className="block text-sm font-medium text-text-secondary">
            Provide current market trends, news, or data (optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            💡 Real-time data about Malawi and Botswana markets will be automatically fetched using Google Search
          </p>
          <textarea id="marketContext" value={marketContext} onChange={e => setMarketContext(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm" placeholder="e.g., Focus on Malawi Stock Exchange, Botswana mining sector, MWK/BWP currency trends..."></textarea>
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Spending Data (Optional)</h3>
          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-brand-secondary hover:text-brand-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-secondary focus-within:ring-offset-2">
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-semibold">Upload a file</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">TXT, CSV, or other text files</p>
                {fileName && <p className="text-xs text-brand-accent mt-2">{fileName}</p>}
              </div>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
          </label>
        </div>

        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Crafting Portfolio...
            </>
          ) : (
            <>
              <WandIcon className="w-5 h-5" />
              Generate Portfolio
            </>
          )}
        </button>
      </form>
    </Card>
  );
};

export default PortfolioForm;
