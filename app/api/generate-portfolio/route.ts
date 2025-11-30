import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, PortfolioRecommendation, Citation, GroundingMetadata } from '@/types';

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

  IMPORTANT: You have access to Google Search to retrieve real-time market data. Use this capability to provide accurate, up-to-date information about Malawi and Botswana markets.

  CONTEXT YOU ALWAYS CONSIDER:
  1. User Profile Data: Age, income level, investment horizon, risk tolerance, primary goals.
  2. Market Context: Economic trends (inflation, interest rates, GDP), sector/regional performance, asset fundamentals.
  3. Investment Principles: Diversification, risk-adjusted returns, liquidity, stability, and time horizon alignment.
  4. **LOCAL MARKET FOCUS**: Prioritize investment opportunities and data from:
     - Malawi Stock Exchange (MSE)
     - Botswana Stock Exchange (BSE)
     - Regional SADC markets
     - Local currency considerations (MWK - Malawi Kwacha, BWP - Botswana Pula)
     - Local economic indicators and government securities

  TASK STEPS (Chain of Thought Guide):
  1. Use Google Search to gather current information about:
     - Malawi Stock Exchange performance and listed companies
     - Botswana Stock Exchange performance and listed companies
     - Current inflation rates, interest rates, and GDP growth in Malawi and Botswana
     - Currency exchange rates (MWK/USD, BWP/USD)
     - Regional investment opportunities (mining in Botswana, agriculture in Malawi, etc.)
     - Local government bonds and treasury bills
  2. Interpret the user's risk profile and financial goals.
  3. Evaluate current market data to identify suitable asset categories available in these markets.
  4. Recommend portfolio allocations as percentages across: Equities (MSE/BSE stocks, regional stocks), Bonds (Malawi/Botswana govt bonds, corporate bonds), Real Estate / REITs (local options), Commodities / Alternatives, Cash / Short-term assets (local currency considerations).
  5. Estimate expected annualized return and risk level based on current market conditions.
  6. Explain reasoning clearly — why each asset class suits the user profile AND the local market context.
  7. Highlight rebalancing tips and currency diversification strategies.

  ---

  USER-PROVIDED DATA:

  1. User Profile:
     - Age: ${profile.age || 'Not provided'}
     - Annual Income: ${profile.income ? `$${profile.income}` : 'Not provided'}
     - Investment Horizon: ${profile.horizon} years
     - Risk Tolerance: ${profile.riskTolerance}
     - Primary Goal: ${profile.primaryGoal}

  2. Current Market Context:
     ${marketContext || 'No specific market context provided. Use Google Search to find current economic conditions in Malawi and Botswana.'}

  3. User Spending Data from Uploaded Document:
     ${spendingData || 'No spending data provided.'}

  ---

  FINAL INSTRUCTION:
  Based on all the provided information AND real-time data from Google Search about Malawi and Botswana markets, generate an optimal asset allocation. Your output MUST be a single, valid JSON object that strictly adheres to the following structure:

  {
    "risk_profile": "string describing the risk profile",
    "investment_horizon": "string describing the investment horizon",
    "recommended_portfolio": [
      {
        "category": "Asset category name",
        "allocation": "percentage as string with % sign",
        "reason": "explanation for this allocation"
      }
    ],
    "expected_return": "expected return as string",
    "estimated_risk_level": "risk level as string",
    "rebalancing_tip": "rebalancing advice as string",
    "narrative_summary": "comprehensive summary incorporating search insights"
  }

  CRITICAL: Return ONLY the JSON object, nothing else. Do not include markdown formatting, explanations, or any text before or after the JSON.
  
  In your narrative_summary, naturally incorporate insights from the search results about current market conditions in Malawi and Botswana.
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

    // Configure Google Search Grounding tool
    const groundingTool = {
      googleSearch: {},
    };

    // Generate portfolio recommendation with Google Search Grounding
    // NOTE: Tools cannot be used with responseMimeType: "application/json"
    // We must use text mode and parse JSON manually
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        tools: [groundingTool],
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
      // Try to parse the entire response as JSON first
      portfolioData = JSON.parse(jsonText);
    } catch (err) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          portfolioData = JSON.parse(jsonMatch[1]);
        } catch (parseErr) {
          console.error("Failed to parse extracted JSON:", parseErr, jsonMatch[1]);
          return NextResponse.json(
            { error: 'Invalid JSON received from AI' },
            { status: 502 }
          );
        }
      } else {
        console.error("Failed to parse AI response as JSON:", err, jsonText);
        return NextResponse.json(
          { error: 'Invalid JSON received from AI' },
          { status: 502 }
        );
      }
    }

    // Validate the parsed data has the expected structure
    if (!portfolioData.recommended_portfolio || !Array.isArray(portfolioData.recommended_portfolio)) {
      console.error("Invalid portfolio data structure:", portfolioData);
      return NextResponse.json(
        { error: 'AI returned invalid portfolio structure. Please try again.' },
        { status: 502 }
      );
    }

    // Sanitize allocation strings to ensure they contain '%'
    portfolioData.recommended_portfolio.forEach(asset => {
      if (!asset.allocation.includes('%')) {
        asset.allocation = `${parseFloat(asset.allocation)}%`;
      }
    });

    // Extract grounding metadata (citations) if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    if (groundingMetadata) {
      // Extract citations from grounding chunks
      const citations: Citation[] = [];
      const chunks = groundingMetadata.groundingChunks || [];

      chunks.forEach(chunk => {
        if (chunk.web?.uri && chunk.web?.title) {
          citations.push({
            uri: chunk.web.uri,
            title: chunk.web.title,
          });
        }
      });

      // Add citations and search queries to the response
      if (citations.length > 0) {
        portfolioData.citations = citations;
      }

      if (groundingMetadata.webSearchQueries && groundingMetadata.webSearchQueries.length > 0) {
        portfolioData.searchQueries = groundingMetadata.webSearchQueries;
      }
    }

    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error("Error generating portfolio:", error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio. The AI model may be temporarily unavailable.' },
      { status: 500 }
    );
  }
}
