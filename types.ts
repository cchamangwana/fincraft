
export enum Country {
  MALAWI = 'Malawi',
  BOTSWANA = 'Botswana',
  OTHER = 'Other',
}

export enum RiskTolerance {
  CONSERVATIVE = 'Conservative',
  BALANCED = 'Balanced',
  AGGRESSIVE = 'Aggressive',
}

export enum PrimaryGoal {
  GROWTH = 'Growth',
  INCOME = 'Income',
  CAPITAL_PRESERVATION = 'Capital Preservation',
}

export enum Sector {
  AGRICULTURE = 'Agriculture',
  MINING = 'Mining & Resources',
  FINANCIAL_SERVICES = 'Financial Services',
  REAL_ESTATE = 'Real Estate',
  TECHNOLOGY = 'Technology',
  MANUFACTURING = 'Manufacturing',
}

export interface FinancialSituation {
  currentSavings: number | '';
  monthlyExpenses: number | '';
  existingInvestments: number | '';
}

export interface InvestmentPreferences {
  sectors: Sector[];
  esgPreference: boolean;
  localInternationalSplit: number; // 0-100, where 0 is all international, 100 is all local
}

export interface UserProfile {
  country: Country;
  age: number | '';
  income: number | '';
  investmentAmount: number | '';
  horizon: number | '';
  riskTolerance: RiskTolerance;
  primaryGoal: PrimaryGoal;
  financialSituation: FinancialSituation;
  preferences: InvestmentPreferences;
}

export interface AssetAllocation {
  category: string;
  allocation: string;
  reason: string;
}

export interface PortfolioRecommendation {
  risk_profile: string;
  investment_horizon: string;
  recommended_portfolio: AssetAllocation[];
  expected_return: string;
  estimated_risk_level: string;
  rebalancing_tip: string;
  narrative_summary: string;
  citations?: Citation[];
  searchQueries?: string[];
  transparencyMetadata?: TransparencyMetadata;
}

export interface Citation {
  uri: string;
  title: string;
  confidence?: number; // 0-1 confidence score
}

export interface RetrievedTextSegment {
  text: string;
  source: string;
  sourceYear?: string;
  relevanceScore?: number;
}

export interface ModelRationale {
  summary: string;
  keyFactors: string[];
  exclusions?: string[]; // Why certain options were excluded
}

export interface EvidenceSupport {
  category: string; // Asset class name
  sourceCount: number;
  avgConfidence: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  supportingCitations: Citation[];
  alignmentScore?: number; // How well evidence aligns with the claim
}

export interface TransparencyMetadata {
  modelRationale?: ModelRationale;
  retrievedSegments?: RetrievedTextSegment[];
  evidenceGraph?: EvidenceSupport[];
  overallConfidence?: number;
  synthesisMethod?: string;
}

// Transparency display modes
export enum TransparencyMode {
  BASELINE_OPAQUE = 'baseline',
  CITATION_ENHANCED = 'citation',
  SYNTHESIS_TRANSPARENT = 'synthesis',
  GRAPH_AUGMENTED = 'graph',
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  groundingSupports?: Array<{
    segment?: {
      startIndex: number;
      endIndex: number;
      text: string;
    };
    groundingChunkIndices?: number[];
    confidenceScores?: number[];
  }>;
}

