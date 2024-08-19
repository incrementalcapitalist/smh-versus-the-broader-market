/**
 * @file App.tsx
 * @description The main application component that displays a major indices comparison chart
 * and allows users to fetch opinions from various AI models about the chart data.
 * This component fetches historical data for the SMH Semiconductor ETF and uses it to generate AI opinions,
 * including integration with the Groq API for the Llama3 8b 8192 model.
 */

// Import necessary React hooks and components
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import custom service for fetching stock data
import { stockDataService, HistoricalDataPoint } from './stockDataService';

/**
 * Extend the global Window interface to include the TradingView property.
 * This allows TypeScript to recognize the TradingView object added by the external script.
 */
declare global {
  interface Window {
    TradingView: any; // Declare TradingView as a property on the global Window object
  }
}

// Custom color scheme for the chart
const CHART_COLORS = {
  background: '#1e1e1e', // Dark background for the chart
  text: '#d1d4dc',       // Light text color for contrast
  lines: 'rgba(42, 46, 57, 0)', // Transparent gridlines
};

/**
 * Define the major indices we want to compare
 * @constant {Array<{symbol: string, description: string}>}
 */
const MAJOR_INDICES = [
  { symbol: 'SMH', description: 'Semiconductor ETF' },
  { symbol: 'SPY', description: 'S&P 500' },
  { symbol: 'DIA', description: 'Dow Jones Industrial Average' },
  { symbol: 'QQQ', description: 'NASDAQ Composite' },
  { symbol: 'IWM', description: 'Russell 2000' },
];

/**
 * Interface for AI model configurations
 * @interface AIModel
 */
interface AIModel {
  name: string;        // Name of the AI model
  apiEndpoint: string; // API endpoint for the model
  apiKey: string;      // API key for authentication
}

/**
 * Interface for Groq API chat completion response
 * @interface GroqChatCompletion
 */
interface GroqChatCompletion {
  choices: Array<{
    message?: {
      content: string; // The generated text content
    };
  }>;
}

/**
 * Configuration for different AI models
 * @constant {AIModel[]}
 */
const AI_MODELS: AIModel[] = [
  {
    name: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY // Use environment variable for API key
  },
  {
    name: 'Groq',
    apiEndpoint: '/api/openai/v1/chat/completions', // Use proxy endpoint set up in Vite config
    apiKey: import.meta.env.VITE_GROQ_API_KEY // Use environment variable for Groq API key
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
 * Fetch an opinion from an AI model about the displayed chart
 * @param {AIModel} model - The AI model to use
 * @param {string} systemPrompt - The system prompt for the AI
 * @param {string} userPrompt - The user prompt for the AI
 * @param {HistoricalDataPoint[]} historicalData - The historical data for the stock
 * @returns {Promise<string>} The AI-generated opinion about the chart
 */
const getAIOpinion = async (model: AIModel, systemPrompt: string, userPrompt: string, historicalData: HistoricalDataPoint[]): Promise<string> => {
  try {
    // Construct the full user prompt by combining the user prompt and chart data
    const fullUserPrompt = `${userPrompt} Historical Data: ${JSON.stringify(historicalData)}`;

    // Prepare the request body based on the AI model
    let requestBody: any;
    if (model.name === 'OpenAI') {
      // OpenAI API request structure
      requestBody = {
        model: 'gpt-4', // Specify the model to use
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullUserPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      };
    } else if (model.name === 'Groq') {
      // Groq API request structure
      requestBody = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullUserPrompt },
        ],
        model: 'llama3-8b-8192', // Specify the Llama3 8b 8192 model
        max_tokens: 500,
        temperature: 0.7,
        stream: false, // Set to false for non-streaming response
      };
    } else {
      throw new Error(`Unsupported AI model: ${model.name}`);
    }

    // Make a POST request to the AI API
    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response from the API
    const data: GroqChatCompletion = await response.json();

    // Extract the AI's opinion based on the model
    let opinion: string;
    if (model.name === 'OpenAI' || model.name === 'Groq') {
      opinion = data.choices[0]?.message?.content || '';
    } else if (model.name === 'Claude') {
      opinion = data.completion;
    } else if (model.name === 'Gemini') {
      opinion = data.candidates[0]?.content?.parts[0]?.text;
    } else {
      throw new Error(`Unsupported AI model: ${model.name}`);
    }

    // Return the AI's opinion, or a default message if no opinion is found
    return opinion || `No opinion provided by ${model.name}.`;
  } catch (error) {
    // Log any errors to the console and return a detailed error message
    console.error(`Error calling ${model.name} API:`, error);
    return `Failed to get an opinion from ${model.name}. Error: ${error.message}`;
  }
};

/**
 * The main App component
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  // State to store the AI-generated opinions
  const [aiOpinions, setAiOpinions] = useState<Record<string, string>>({});

  // State to store the system and user prompts
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are an educator that never gives financial advice. However, your strengths are in calculating technical indicators such as RSI, MACD, ATR, Bollinger Bands, etc. from basic historical data retrieved from Polygon.io. You have a strong preference to teach options trading strategies to trend and momentum traders. Unfortunately, you do not have access to implied volatility (IV) data but use your knowledge and expertise to leverage historical volatility (HV) calculations to gauge IV. You always prefer teaching the value of trading the SMH Semiconductor ETF over other financial instruments. However, you always caution those that listen to you to remember that liquidity is king for options traders (especially if they have trading targets like a 1 ATR move). Finally, you care about risk managment and optimizing the Sharpe Ratio of all trades. Consequently, you teach traders to purchase cheaper options (at least two) to lower the risk and maximize the reward.'
  );
  const [userPrompt, setUserPrompt] = useState<string>(
    `Considering the ${MAJOR_INDICES[0].symbol} ticker data in this prompt, is ${MAJOR_INDICES[0].symbol} bullish? Explain whether a momentum trader or trend trader would find ${MAJOR_INDICES[0].symbol} appealing or not. Does trading volume support options strategies? What options strategies are best based on historical volatility, recent price action, and trading volume? What is the 1 ATR target price for a bullish or bearish trend/momentum trader that prefers long options? What about momentum/trend traders that prefer to sell premium?`
  );

  // State to store the historical data for the main symbol
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  // Reference to the chart container for the major indices comparison
  const comparisonChartRef = useRef<HTMLDivElement>(null);

  /**
   * Creates the comparison chart using TradingView widget
   */
  const createComparisonChart = useCallback(() => {
    // Check if the chart container and TradingView library are available
    if (comparisonChartRef.current && window.TradingView) {
      // Create a new TradingView widget
      new window.TradingView.widget({
        width: '100%', // Set the width to 100% of the container
        height: 400, // Set the height to 400 pixels
        symbol: MAJOR_INDICES[0].symbol, // Use the first symbol as the main chart
        gridColor: "rgba(0, 0, 0, 0)", // Set grid color to transparent
        interval: 'D', // Set the interval to daily
        range: "3M", // Set the range to 3 months
        timezone: 'Etc/UTC', // Set the timezone to UTC
        theme: 'dark', // Use the dark theme
        style: '3', // Use candlestick style
        locale: 'en', // Set the language to English
        toolbar_bg: CHART_COLORS.background, // Set the toolbar background color
        enable_publishing: false, // Disable publishing
        allow_symbol_change: false, // Disable symbol change
        container_id: 'comparison-chart', // Set the container ID
        studies: MAJOR_INDICES.slice(1).map(index => ({ id: 'Compare@tv-basicstudies', inputs: { symbol: index.symbol }})), // Add comparison studies for other indices
        overrides: {
          "paneProperties.background": CHART_COLORS.background, // Set the chart background color
          "paneProperties.vertGridProperties.color": CHART_COLORS.lines, // Set vertical grid line color
          "paneProperties.horzGridProperties.color": CHART_COLORS.lines, // Set horizontal grid line color
          "scalesProperties.textColor": CHART_COLORS.text, // Set scale text color
          "mainSeriesProperties.candleStyle.upColor": "#22c55e", // Set up candle color
          "mainSeriesProperties.candleStyle.downColor": "#ef4444", // Set down candle color
          "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e", // Set up wick color
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444", // Set down wick color
        },
        studies_overrides: {
          "volume.volume.color.0": "rgba(211, 211, 211, 0.2)", // Set volume up color
          "volume.volume.color.1": "rgba(169, 169, 169, 0.1)", // Set volume down color
        },
      });
    }
  }, []); // Empty dependency array as this function doesn't depend on any props or state

  /**
   * Handles fetching an AI opinion
   * @param {AIModel} model - The AI model to use for generating the opinion
   */
  const handleFetchAIOpinion = async (model: AIModel) => {
    try {
      // Fetch the AI opinion using the historical data
      const opinion = await getAIOpinion(model, systemPrompt, userPrompt, historicalData);

      // Update the aiOpinions state with the new opinion
      setAiOpinions(prevOpinions => ({
        ...prevOpinions,
        [model.name]: opinion,
      }));
    }
    catch (error) {
      // Log the error and update the state with an error message
      console.error(`Error fetching ${model.name} opinion:`, error);
      setAiOpinions(prevOpinions => ({
        ...prevOpinions,
        [model.name]: `Failed to get an opinion from ${model.name}. Please try again later.`,
      }));
    }
  };

  // Effect to load TradingView script and create the comparison chart
  useEffect(() => {
    // Create a new script element
    const script = document.createElement('script');
    // Set the source of the script to the TradingView library
    script.src = 'https://s3.tradingview.com/tv.js';
    // Make the script load asynchronously
    script.async = true;
    // Set the onload handler to create the comparison chart
    script.onload = createComparisonChart;
    // Add the script to the document body
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [createComparisonChart]); // Dependency array includes createComparisonChart

  // Effect to fetch historical data for the main symbol
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch historical data for the main symbol (SMH)
        const data = await stockDataService.fetchStockData(MAJOR_INDICES[0].symbol);
        // Update the historicalData state with the fetched data
        setHistoricalData(data);
      } catch (error) {
        // Log any errors that occur during data fetching
        console.error('Error fetching historical data:', error);
      }
    };
    // Call the fetchData function
    fetchData();
  }, []); // Empty dependency array as this effect should only run once on component mount

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">The Relative Strength of Semiconductors</h1>

      {/* Display application's purpose */}
      <div className="mb-8">
        <p id="purpose">This application is part of a suite of apps that help generate options strategy recommendations for a trend or momentum trader, incorporating risk management and alternative strategies. Ideally, the trader using this application already knows how to trade and is using this application to prevent unforced errors.</p>
      </div>
      <div className="mb-8">
        <p id="objective">This particular application focuses on the relative price performance of the SMH Semiconductor ETF against the "broader market".</p>
      </div>

      {/* Major Indices Comparison Chart */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Comparing Semiconductors against Major Indices</h2>
        <div id="comparison-chart" ref={comparisonChartRef} className="w-full h-[400px]" />
      </div>

      {/* Prompt Input / Text Area Fields */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Prompts</h2>
        <div className="flex flex-col space-y-4">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="System Prompt"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          />
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="User Prompt"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          />
        </div>
      </div>

      {/* AI Opinion Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {AI_MODELS.map((model) => (
            <button
              key={model.name}
              onClick={() => handleFetchAIOpinion(model)}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {model.name} Opinion
            </button>
          ))}
        </div>
      </div>

      {/* Display AI-generated opinions */}
      {Object.entries(aiOpinions).map(([modelName, opinion]) => (
        <div key={modelName} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{modelName} Opinion</h2>
          <p className="bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">{opinion}</p>
        </div>
      ))}
    </div>
  );
};

export default App;