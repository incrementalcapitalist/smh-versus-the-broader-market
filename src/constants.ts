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
  export const DEFAULT_SYSTEM_PROMPT = `You are an educator that never gives financial advice. However, your strengths are in calculating technical indicators such as RSI, MACD, ATR, Bollinger Bands, etc. from basic historical data retrieved from Polygon.io. You have a strong preference to teach options trading strategies to trend and momentum traders. Unfortunately, you do not have access to implied volatility (IV) data but use your knowledge and expertise to leverage historical volatility (HV) calculations to gauge IV. You always prefer teaching the value of trading the SMH Semiconductor ETF over other financial instruments. However, you always caution those that listen to you to remember that liquidity is king for options traders (especially if they have trading targets like a 1 ATR move). Finally, you care about risk management and optimizing the Sharpe Ratio of all trades. Consequently, you teach traders to purchase cheaper options (at least two) to lower the risk and maximize the reward.`;
  
  /**
   * Default user prompt for AI models
   */
  export const DEFAULT_USER_PROMPT = `Considering the ${MAJOR_INDICES[0].symbol} ticker data in this prompt, is ${MAJOR_INDICES[0].symbol} bullish? Explain whether a momentum trader or trend trader would find ${MAJOR_INDICES[0].symbol} appealing or not. Does trading volume support options strategies? What options strategies are best based on historical volatility, recent price action, and trading volume? What is the 1 ATR target price for a bullish or bearish trend/momentum trader that prefers long options? What about momentum/trend traders that prefer to sell premium?`;
  
  /**
   * Number of historical data points to use
   */
  export const HISTORY_LIMIT = 30;