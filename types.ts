
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

export interface UserProfile {
  age: number | '';
  income: number | '';
  horizon: number | '';
  riskTolerance: RiskTolerance;
  primaryGoal: PrimaryGoal;
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
}
