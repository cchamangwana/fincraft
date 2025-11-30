import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, PortfolioRecommendation } from '@/types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    risk_profile: { type: Type.STRING },
    investment_horizon: { type: Type.STRING },
    recommended_portfolio: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          allocation: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["category", "allocation", "reason"]
      }
    },
    expected_return: { type: Type.STRING },
    estimated_risk_level: { type: Type.STRING },
    rebalancing_tip: { type: Type.STRING },
    narrative_summary: { type: Type.STRING }
  },
  required: ["risk_profile", "investment_horizon", "recommended_portfolio", "expected_return", "estimated_risk_level", "rebalancing_tip", "narrative_summary"]
};

const buildPrompt = (profile: UserProfile, marketContext: string, spendingData: string): string => {
  return `
  System Role:
  You are FinCraft AI, a financial intelligence assistant that helps investors build personalized portfolios based on their goals, risk tolerance, and market conditions.
  Your task is to analyze a user's investment profile and current market context, then recommend an optimal asset allocation. You must reason carefully, stay factual, and present recommendations in a structured, explainable JSON format.

  CONTEXT YOU ALWAYS CONSIDER:
  1. User Profile Data: Age, income level, investment horizon, risk tolerance, primary goals.
  2. Market Context: Economic trends (inflation, interest rates, GDP), sector/regional performance, asset fundamentals.
  3. Investment Principles: Diversification, risk-adjusted returns, liquidity, stability, and time horizon alignment.

  TASK STEPS (Chain of Thought Guide):
  1. Interpret the user's risk profile and financial goals.
  2. Evaluate current market data to identify suitable asset categories.
  3. Recommend portfolio allocations as percentages across: Equities (local/global), Bonds (govt/corporate), Real Estate / REITs, Commodities / Alternatives, Cash / Short-term assets.
  4. Estimate expected annualized return and risk level.
  5. Explain reasoning clearly — why each asset class suits the user profile.
  6. Optionally highlight rebalancing or diversification tips.

  ---

  USER-PROVIDED DATA:

  1. User Profile:
     - Age: ${profile.age || 'Not provided'}
     - Annual Income: ${profile.income ? `$${profile.income}` : 'Not provided'}
     - Investment Horizon: ${profile.horizon} years
     - Risk Tolerance: ${profile.riskTolerance}
     - Primary Goal: ${profile.primaryGoal}

  2. Current Market Context:
     ${marketContext || 'No specific market context provided. Use general knowledge of current global economic conditions.'}

  3. User Spending Data from Uploaded Document:
     ${spendingData || 'No spending data provided.'}

  ---

  FINAL INSTRUCTION:
  Based on all the provided information, generate an optimal asset allocation. Your output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting (like \`\`\`json) in your response.
  `;
};

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: API key not found' },
        { status: 500 }
      );
    }

    // Parse request body
    const { profile, marketContext, spendingData } = await request.json();

    // Validate input
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini AI (server-side only)
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(profile, marketContext || '', spendingData || '');

    // Generate portfolio recommendation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    if (!response || !response.text) {
      console.error("Empty response from AI:", response);
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 502 }
      );
    }
    const jsonText = String(response.text).trim();
    let portfolioData: PortfolioRecommendation;
    try {
      portfolioData = JSON.parse(jsonText);
    } catch (err) {
      console.error("Failed to parse AI JSON response:", err, jsonText);
      return NextResponse.json(
        { error: 'Invalid JSON received from AI' },
        { status: 502 }
      );
    }

    // Sanitize allocation strings to ensure they contain '%'
    portfolioData.recommended_portfolio.forEach(asset => {
      if (!asset.allocation.includes('%')) {
        asset.allocation = `${parseFloat(asset.allocation)}%`;
      }
    });

    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error("Error generating portfolio:", error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio. The AI model may be temporarily unavailable.' },
      { status: 500 }
    );
  }
}
