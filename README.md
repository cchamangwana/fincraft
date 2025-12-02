# FinCraft AI - Next.js Edition

An AI-powered personalized investment portfolio recommendation app built with Next.js, React, Chakra UI, and Google's Gemini API.

## Features

- **Personalized Portfolio Recommendations**: Get AI-generated investment portfolios tailored to your profile
- **Multi-Country Support**: Support for Malawi, Botswana, and other markets
- **Transparency Modes**: Four levels of transparency to understand how recommendations are made
- **Real-time Market Data**: Integrates with Google Search for up-to-date market information
- **Interactive Visualizations**: Charts and graphs powered by Recharts

## Transparency & Evidence Calculation

FinCraft AI provides four transparency modes to help you understand how portfolio recommendations are generated:

### 1. **Baseline (Opaque)**
Clean output without source attribution. Shows only the final recommendation without any supporting evidence.

### 2. **Citations Enhanced**
Displays all sources used to generate the recommendation along with confidence scores:
- **Sources**: Lists all web sources retrieved via Google Search
- **Confidence Scores**: Each source is assigned a confidence score (0-100%) based on:
  - Source reliability and authority
  - Recency of information
  - Relevance to the user's specific profile and market
- **Search Queries**: Shows the actual queries used to fetch market data

### 3. **Synthesis Transparent**
Reveals the AI's reasoning process and key text excerpts:
- **Model Rationale**:
  - Summary of key factors considered (e.g., risk tolerance, market conditions, time horizon)
  - Alternatives that were excluded and why
  - Decision-making logic
- **Retrieved Text Segments**:
  - Key excerpts from source documents that influenced the recommendation
  - Relevance scores showing how each segment contributed to the final decision
  - Source attribution with publication year

### 4. **Evidence Graph (Visual)**
Interactive visual representation of evidence strength:
- **Confidence Visualization**: Pie chart showing confidence levels per asset class
  - Green: High confidence (≥85%)
  - Yellow: Medium confidence (70-84%)
  - Red: Low confidence (<70%)
- **Source Count**: Number of sources supporting each recommendation
- **Alignment Score**: How well sources agree with each other (0-100%)
  - Higher alignment = more consistent evidence across sources
  - Lower alignment = conflicting or varied information
- **Interactive Details**: Click any segment to see:
  - Supporting sources for that specific asset class
  - Individual source confidence scores
  - Evidence alignment metrics

### How Evidence Scores Are Calculated

1. **Source Confidence** (per source):
   - Authority weight: Domain reputation and expertise (30%)
   - Recency: How recent the information is (25%)
   - Relevance: Match to user profile and query (25%)
   - Consistency: Agreement with other sources (20%)

2. **Category Confidence** (per asset class):
   - Average of all source confidence scores for that category
   - Weighted by source count (more sources = higher reliability)

3. **Alignment Score**:
   - Measures consistency across all sources for an asset class
   - Calculated using variance in recommendations
   - High alignment (>80%): Sources agree on recommendations
   - Low alignment (<60%): Sources provide conflicting information

4. **Overall Confidence**:
   - Weighted average across all asset classes
   - Considers both individual confidence scores and alignment
   - Reflects the overall reliability of the complete recommendation

## Tech Stack

- **Frontend**: Next.js 15, React 19, Chakra UI
- **AI**: Google Gemini API with Grounding (Google Search)
- **Charts**: Recharts
- **Styling**: Chakra UI v2
- **Language**: TypeScript
