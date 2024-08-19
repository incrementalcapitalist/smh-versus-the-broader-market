/**
 * @file App.tsx
 * @description The main application component that displays a major indices comparison chart,
 * allows users to fetch opinions from various AI models about the chart data, and provides
 * functionality to view detailed stock charts. The AI models generate opinions based on actual
 * stock data fetched from Polygon.io.
 */

// Import necessary React hooks and components
import React, { useState, useCallback, useEffect, useRef } from 'react';
import StockChart from './StockChart';
import { stockDataService, HistoricalDataPoint } from './stockDataService';
import { createChart } from 'lightweight-charts';

/**
 * Extend the global Window interface to include the TradingView property.
 * This allows TypeScript to recognize the TradingView object added by the external script.
 */
declare global {
  interface Window {
    TradingView: any;
  }
}

/**
 * Custom color scheme for the chart
 * @constant
 */
const CHART_COLORS = {
  background: '#1e1e1e', // Dark background for the chart
  text: '#d1d4dc',       // Light text color for contrast
  lines: 'rgba(42, 46, 57, 0)', // Transparent gridlines
};

/**
 * Define the major indices we want to compare
 * @constant
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
 * @interface
 */
interface AIModel {
  name: string;
  apiEndpoint: string;
  apiKey: string;
}

/**
 * Configuration for different AI models
 * @constant
 */
const AI_MODELS: AIModel[] = [
  {
    name: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY
  },
  {
    name: 'Groq',
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
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
 * Fetch stock data from Polygon.io
 * @param {string} symbol - The stock symbol to fetch data for
 * @returns {Promise<HistoricalDataPoint[]>} A promise that resolves to an array of historical data points
 */
const fetchStockData = async (symbol: string): Promise<HistoricalDataPoint[]> => {
  try {
    // Fetch historical data for the given symbol using the stockDataService
    const historicalData = await stockDataService.fetchStockData(symbol);
    return historicalData;
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

/**
 * Fetch an opinion from an AI model about the displayed chart
 * @param {AIModel} model - The AI model to use
 * @param {string} systemPrompt - The system prompt for the AI
 * @param {string} userPrompt - The user prompt for the AI
 * @param {string} symbol - The stock symbol to fetch data for
 * @returns {Promise<string>} The AI-generated opinion about the chart
 */
const getAIOpinion = async (model: AIModel, systemPrompt: string, userPrompt: string, symbol: string): Promise<string> => {
  try {
    // Fetch historical data for the given symbol
    const historicalData = await fetchStockData(symbol);

    // Construct the full user prompt by combining the user prompt and chart data
    const fullUserPrompt = `${userPrompt} Historical Data: ${JSON.stringify(historicalData)}`;

    // Prepare the request body based on the AI model
    let requestBody: any;
    if (model.name === 'OpenAI' || model.name === 'Groq') {
      // OpenAI and Groq use a similar API structure
      requestBody = {
        model: 'gpt-4', // Specify the model to use
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullUserPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      };
    } else if (model.name === 'Claude') {
      // Claude API has a different structure
      requestBody = {
        model: 'claude-2', // Specify the model to use
        prompt: `${systemPrompt}\n\nHuman: ${fullUserPrompt}\n\nAssistant:`,
        max_tokens_to_sample: 150,
        temperature: 0.7,
      };
    } else if (model.name === 'Gemini') {
      // Gemini API has a different structure
      requestBody = {
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: fullUserPrompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
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
    const data = await response.json();

    // Extract the AI's opinion based on the model
    let opinion: string;
    if (model.name === 'OpenAI' || model.name === 'Groq') {
      opinion = data.choices[0]?.message?.content;
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
  // State to store the entered stock symbol
  const [symbol, setSymbol] = useState<string>('');

  // State to store the submitted symbol (for rendering the detailed chart)
  const [submittedSymbol, setSubmittedSymbol] = useState<string>('');

  // State to store the AI-generated opinions
  const [aiOpinions, setAiOpinions] = useState<Record<string, string>>({});

  // State to store the system and user prompts
  const [systemPrompt, setSystemPrompt] = useState<string>('You only opine on options strategies after considering the recent relative performance of the SMH Semiconductor ETF against the broader market.');
  const [userPrompt, setUserPrompt] = useState<string>('Considering the ' +  MAJOR_INDICES.map(index => index.symbol).join(', ') + ' tickers, which is most bullish? Explain which is most liquid? Investing in which ticker would an investor attain the greatest Sharpe Ratio? What options strategies are best based on historical volatility, recent price action, and trading volume? What is the 1 ATR target price and the closest out of the money strike for a bullish trader that prefers long options? What about the optimal ITM strike a bullish trader that wants to sell premium using a short put vertical?');

  // Reference to the input element for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  // Reference to the chart container for the major indices comparison
  const comparisonChartRef = useRef<HTMLDivElement>(null);

  // Reference to the volume chart container
  const volumeChartRef = useRef<HTMLDivElement>(null);

  /**
   * Handles the input change event
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert the input to uppercase and update the symbol state
    setSymbol(e.target.value.toUpperCase());
  };

  /**
   * Handles the form submission
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission behavior
    e.preventDefault();
    // Set the submitted symbol to trigger the detailed chart update
    setSubmittedSymbol(symbol);
  };

  /**
   * Handles keydown events globally
   * @param {KeyboardEvent} e - The keydown event
   */
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if the active element is not an input or textarea
    if (
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'TEXTAREA'
    ) {
      // If the key is a letter or number, add it to the symbol
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setSymbol(prevSymbol => (prevSymbol + e.key).toUpperCase());
        // Focus the input
        inputRef.current?.focus();
      }
      // If the key is backspace, remove the last character
      else if (e.key === 'Backspace') {
        setSymbol(prevSymbol => prevSymbol.slice(0, -1));
        // Focus the input
        inputRef.current?.focus();
      }
      // If the key is Enter, submit the form
      else if (e.key === 'Enter') {
        setSubmittedSymbol(symbol);
      }
    }
  }, [symbol]);

  /**
   * Creates the comparison chart using TradingView widget
   */
  const createComparisonChart = () => {
    // Check if the chart container and TradingView library are available
    if (comparisonChartRef.current && window.TradingView) {
      // Create a new TradingView widget
      new window.TradingView.widget({
        width: '100%',
        height: 400,
        symbol: MAJOR_INDICES[0].symbol,
        gridColor: "rgba(0, 0, 0, 0)", // Set grid color to transparent
        interval: 'D',
        range: "3M",
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '3',
        locale: 'en',
        toolbar_bg: CHART_COLORS.background,
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: 'comparison-chart',
        studies: [
          { id: 'Compare@tv-basicstudies', inputs: { symbol: MAJOR_INDICES[1].symbol }},
          { id: 'Compare@tv-basicstudies', inputs: { symbol: MAJOR_INDICES[2].symbol }},
          { id: 'Compare@tv-basicstudies', inputs: { symbol: MAJOR_INDICES[3].symbol }},
          { id: 'Compare@tv-basicstudies', inputs: { symbol: MAJOR_INDICES[4].symbol }},
        ],
        overrides: {
          "paneProperties.background": CHART_COLORS.background,
          "paneProperties.vertGridProperties.color": "rgba(0, 0, 0, 0)",
          "paneProperties.horzGridProperties.color": "rgba(0, 0, 0, 0)",
          "scalesProperties.textColor": CHART_COLORS.text,
          "mainSeriesProperties.candleStyle.upColor": "#22c55e",
          "mainSeriesProperties.candleStyle.downColor": "#ef4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        },
        studies_overrides: {
          "volume.volume.color.0": "rgba(211, 211, 211, 0.2)",
          "volume.volume.color.1": "rgba(169, 169, 169, 0.1)",
        },
      });
    }
  };

  /**
   * Creates the volume chart using Lightweight Charts
   */
  const createVolumeChart = async () => {
    if (volumeChartRef.current) {
      // Create a new chart instance
      const chart = createChart(volumeChartRef.current, {
        width: volumeChartRef.current.clientWidth,
        height: 300,
        layout: {
          background: { type: 'solid', color: '#1e1e1e' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
      });

      // Add a histogram series to the chart for volume data
      const volumeSeries = chart.addHistogramSeries({
        color: '#22c55e',
        lineWidth: 2,
        priceFormat: {
          type: 'volume',
        },
        priceLineVisible: false,
      });

      // Initialize an array to store volume data
      const volumeData: { time: string; value: number }[] = [];

      // Fetch and process volume data for each major index
      for (const index of MAJOR_INDICES) {
        const historicalData = await fetchStockData(index.symbol);
        historicalData.forEach(data => {
          volumeData.push({ time: data.time, value: data.volume });
        });
      }

      // Set the processed volume data to the chart series
      volumeSeries.setData(volumeData);
    }
  };

  /**
   * Handles fetching an AI opinion
   * @param {AIModel} model - The AI model to use for generating the opinion
   */
  const handleFetchAIOpinion = async (model: AIModel) => {
    try {
      // Fetch the AI opinion
      const opinion = await getAIOpinion(model, systemPrompt, userPrompt, submittedSymbol);

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

  // Effect to add and remove the global keydown event listener
  useEffect(() => {
    // Add the keydown event listener when the component mounts
    window.addEventListener('keydown', handleGlobalKeyDown);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // Effect to focus the input when the component mounts
  useEffect(() => {
    // Focus the input element when the component mounts
    inputRef.current?.focus();
  }, []);

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
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to create the volume chart
  useEffect(() => {
    createVolumeChart();
  }, []);

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

      {/* Prompt Input Fields */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Prompts</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="System Prompt"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="User Prompt"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* AI Opinion Buttons */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Get AI Opinions</h2>
        <div className="flex space-x-4">
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
          <p className="bg-gray-700 p-4 rounded-lg">{opinion}</p>
        </div>
      ))}

      {/* Form for entering the stock symbol */}
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          ref={inputRef}
          type="text"
          value={symbol}
          onChange={handleInputChange}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="bg-gray-700 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Fetch Data
        </button>
      </form>

      {/* Render the StockChart component if a symbol has been submitted */}
      {submittedSymbol && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Detailed Chart: {submittedSymbol}</h2>
          <StockChart
            symbol={submittedSymbol}
            apiKey={import.meta.env.VITE_POLYGON_API_KEY}
          />
        </div>
      )}

      {/* Volume Chart */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Comparative Trading Volumes</h2>
        <div id="volume-chart" ref={volumeChartRef} className="w-full h-[300px]" />
      </div>
    </div>
  );
};

export default App;