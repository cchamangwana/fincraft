'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { UserProfile, RiskTolerance, PrimaryGoal, Country, Sector } from '@/types';
import Card from '@/components/ui/Card';
import UploadIcon from '@/components/icons/UploadIcon';
import WandIcon from '@/components/icons/WandIcon';

interface PortfolioFormProps {
  onSubmit: (profile: UserProfile, marketContext: string, fileContent: string) => void;
  isLoading: boolean;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onSubmit, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    country: Country.MALAWI,
    age: '',
    income: '',
    investmentAmount: '',
    horizon: 10,
    riskTolerance: RiskTolerance.BALANCED,
    primaryGoal: PrimaryGoal.GROWTH,
    financialSituation: {
      currentSavings: '',
      monthlyExpenses: '',
      existingInvestments: '',
    },
    preferences: {
      sectors: [],
      esgPreference: false,
      localInternationalSplit: 70, // Default 70% local, 30% international
    },
  });
  const [marketContext, setMarketContext] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Get currency symbol based on selected country
  const currencySymbol = useMemo(() => {
    switch (profile.country) {
      case Country.MALAWI:
        return 'MWK';
      case Country.BOTSWANA:
        return 'BWP';
      default:
        return '$';
    }
  }, [profile.country]);

  const handleProfileChange = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFinancialChange = useCallback((key: keyof UserProfile['financialSituation'], value: number | '') => {
    setProfile(prev => ({
      ...prev,
      financialSituation: { ...prev.financialSituation, [key]: value },
    }));
  }, []);

  const handleSectorToggle = useCallback((sector: Sector) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        sectors: prev.preferences.sectors.includes(sector)
          ? prev.preferences.sectors.filter(s => s !== sector)
          : [...prev.preferences.sectors, sector],
      },
    }));
  }, []);

  const handlePreferenceChange = useCallback((key: keyof UserProfile['preferences'], value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
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
        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Location</h3>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-secondary">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              value={profile.country}
              onChange={e => handleProfileChange('country', e.target.value as Country)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              required
            >
              {Object.values(Country).map(val => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Recommendations will focus on {profile.country === Country.MALAWI ? 'Malawi Stock Exchange (MSE)' : profile.country === Country.BOTSWANA ? 'Botswana Stock Exchange (BSE)' : 'global markets'}
            </p>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Your Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-text-secondary">Age</label>
              <input
                type="number"
                id="age"
                value={profile.age}
                onChange={e => handleProfileChange('age', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                min="18"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="income" className="block text-sm font-medium text-text-secondary">
                Annual Income ({currencySymbol})
              </label>
              <input
                type="number"
                id="income"
                value={profile.income}
                onChange={e => handleProfileChange('income', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Investment Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Investment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="investmentAmount" className="block text-sm font-medium text-text-secondary">
                Investment Amount ({currencySymbol})
              </label>
              <input
                type="number"
                id="investmentAmount"
                value={profile.investmentAmount}
                onChange={e => handleProfileChange('investmentAmount', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                min="0"
                placeholder="How much do you want to invest?"
              />
              <p className="mt-1 text-xs text-gray-500">We'll show exact amounts for each allocation</p>
            </div>
            <div>
              <label htmlFor="horizon" className="block text-sm font-medium text-text-secondary">
                Investment Horizon (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="horizon"
                value={profile.horizon}
                min="1"
                max="50"
                required
                onChange={e => handleProfileChange('horizon', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="riskTolerance" className="block text-sm font-medium text-text-secondary">
                Risk Tolerance <span className="text-red-500">*</span>
              </label>
              <select
                id="riskTolerance"
                value={profile.riskTolerance}
                onChange={e => handleProfileChange('riskTolerance', e.target.value as RiskTolerance)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              >
                {Object.values(RiskTolerance).map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="primaryGoal" className="block text-sm font-medium text-text-secondary">
                Primary Goal <span className="text-red-500">*</span>
              </label>
              <select
                id="primaryGoal"
                value={profile.primaryGoal}
                onChange={e => handleProfileChange('primaryGoal', e.target.value as PrimaryGoal)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              >
                {Object.values(PrimaryGoal).map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Financial Situation Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Financial Situation (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="currentSavings" className="block text-sm font-medium text-text-secondary">
                Current Savings ({currencySymbol})
              </label>
              <input
                type="number"
                id="currentSavings"
                value={profile.financialSituation.currentSavings}
                onChange={e => handleFinancialChange('currentSavings', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-text-secondary">
                Monthly Expenses ({currencySymbol})
              </label>
              <input
                type="number"
                id="monthlyExpenses"
                value={profile.financialSituation.monthlyExpenses}
                onChange={e => handleFinancialChange('monthlyExpenses', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="existingInvestments" className="block text-sm font-medium text-text-secondary">
                Existing Investments ({currencySymbol})
              </label>
              <input
                type="number"
                id="existingInvestments"
                value={profile.financialSituation.existingInvestments}
                onChange={e => handleFinancialChange('existingInvestments', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Investment Preferences Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Investment Preferences</h3>

          {/* Sector Interests */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Sectors of Interest (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.values(Sector).map(sector => (
                <label key={sector} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.preferences.sectors.includes(sector)}
                    onChange={() => handleSectorToggle(sector)}
                    className="rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"
                  />
                  <span className="text-sm text-text-secondary">{sector}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ESG Preference */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="esgPreference"
              checked={profile.preferences.esgPreference}
              onChange={e => handlePreferenceChange('esgPreference', e.target.checked)}
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-secondary h-5 w-5"
            />
            <label htmlFor="esgPreference" className="text-sm font-medium text-text-secondary cursor-pointer">
              Prefer ESG/Sustainable Investments
            </label>
          </div>

          {/* Local vs International Split */}
          <div>
            <label htmlFor="localSplit" className="block text-sm font-medium text-text-secondary mb-2">
              Local vs International Preference: {profile.preferences.localInternationalSplit}% Local
            </label>
            <input
              type="range"
              id="localSplit"
              min="0"
              max="100"
              value={profile.preferences.localInternationalSplit}
              onChange={e => handlePreferenceChange('localInternationalSplit', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>All International</span>
              <span>Balanced</span>
              <span>All Local</span>
            </div>
          </div>
        </div>

        {/* Market Context Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium border-b pb-2 text-text-primary">Market Context</h3>
          <label htmlFor="marketContext" className="block text-sm font-medium text-text-secondary">
            Provide current market trends, news, or data (optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Real-time data about {profile.country} markets will be automatically fetched using Google Search
          </p>
          <textarea
            id="marketContext"
            value={marketContext}
            onChange={e => setMarketContext(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
            placeholder={`e.g., Focus on ${profile.country === Country.MALAWI ? 'Malawi Stock Exchange' : profile.country === Country.BOTSWANA ? 'Botswana mining sector' : 'emerging markets'}, currency trends...`}
          ></textarea>
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
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
