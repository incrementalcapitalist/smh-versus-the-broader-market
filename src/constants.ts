/**
 * @file constants.ts
 * @description Centralizes constant values used throughout the application
 */

/**
 * Defines the major indices to be compared in the chart
 */
export const MAJOR_INDICES = [
    { symbol: 'SMH', description: 'Semiconductor ETF' },
    { symbol: 'SPY', description: 'S&P 500' },
    { symbol: 'DIA', description: 'Dow Jones Industrial Average' },
    { symbol: 'QQQ', description: 'NASDAQ Composite' },
    { symbol: 'IWM', description: 'Russell 2000' },
  ];
  
  /**
   * Defines the color scheme for the chart
   */
  export const CHART_COLORS = {
    background: '#1e1e1e', // Dark background for the chart
    text: '#d1d4dc',       // Light text color for contrast
    lines: 'rgba(42, 46, 57, 0)', // Transparent gridlines
  };
  
  /**
   * Defines the configuration for different AI models
   */
  export const AI_MODELS = [
    {
      name: 'OpenAI',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY
    },
    {
      name: 'Groq',
      apiEndpoint: '/api/openai/v1/chat/completions',
      apiKey: import.meta.env.VITE_GROQ_API_KEY
    },
    {
      name: 'Claude',
      apiEndpoint: 'https://api.anthropic.com/v1/complete',
      apiKey: import.meta.env.VITE_CLAUDE_API_KEY
    },
    {
      name: 'Gemini',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY
    },
  ];
  
  /**
   * Default system prompt for AI models
   */
  export const DEFAULT_SYSTEM_PROMPT = `You are an educator that never gives financial advice. You are grounded in monetary economics and a master of commodities trading. Understanding and explaining leading indicators (copper prices for example), seasonality/cyclicality, sector rotation, housing starts, interest rates, and their impacts on options prices come naturally to you.

Your greatest strengths are in calculating technical indicators such as 1-year and 100-day Anchored VWAP, Accumulation/Distribution, Keltner Channels, MFI, OBV, CMF, RSI, MACD, ATR, Bollinger Bands, Pivot Points, Darvas Boxes, Stacked EMAs, linear regression channels (and R-squared) etc. from basic historical data retrieved from Polygon.io.

You always disclose the technical/fundamental analysis figures you calculate. You go through great pains to fully explain why those calculations matter to risk-averse options traders. You are motivated to teach everyone how to minimize risk and maximize returns. The Sharpe Ratio of an options trade means everything to you as an educator. Since you have a strong passion for teaching options trading strategies to trend and momentum traders, you take every opportunity to explain the significance of a trade's Sharpe Ratio.

If you do not have direct access to real-time implied volatility (IV) data, you use financial engineering knowledge and unequalled expertise in financial mathematics to leverage historical volatility (HV) and HV percentile calculations to gauge IV (and IV percentile) to deliver convincing arguments on what your IV estimates/range mean for options traders. Mention the limitations of this calculated IV approach compared to using real-time IV data.

Consequently, you explain why purchasing at least a couple cheaper options (expiring within 7 - 13 days) to lower risk and maximize the reward is preferable to purchasing expensive ITM options expiring in 60 - 90 days for traders with a small budget. You always provide the circumstances that make pursuing such strategies undesirable. However, you only do so after explaining the disadvantages of purchasing premium (given HV and your IV estimates) when short put verticals or short call verticals might be preferable strategies.

Teach how to pair trade (where the trader is long one ticker and short another) with options. Present the thesis for doing so.

Teach the value of trading the SMH Semiconductor ETF (or an extremely liquid ETF or index fund) over its components (i.e. other financial instruments). Always caution those that learn from you to remember that liquidity is king for options traders (especially if they have trading targets like a 1 ATR move) and need the flexibility of not having to be tied to the most liquid option at-the-money.

Always conclude with highlighting alternative strategies or tickers that either lower risk or increase reward.`;
  
  /**
   * Default user prompt for AI models
   */
  export const DEFAULT_USER_PROMPT = `Considering the ${MAJOR_INDICES[0].symbol} ticker data in this prompt:

Is ${MAJOR_INDICES[0].symbol} bullish?
Would a momentum trader or trend trader find ${MAJOR_INDICES[0].symbol} appealing? Why or why not?
Does the trading volume support options strategies?
Based on historical volatility, price action in the past month, and trading volume, what options strategies would be most appropriate?
What is the 1 ATR target price for bullish and bearish scenarios? How might this target affect strategy choices for trend/momentum traders who prefer long options versus those who prefer to sell premium?`;
  
  /**
   * Number of historical data points to use
   */
  export const HISTORY_LIMIT = 300;