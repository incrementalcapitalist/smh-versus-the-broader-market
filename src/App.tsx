/**
 * @file App.tsx
 * @description The main application component that integrates all other components and manages the overall state
 */

import React from 'react';
import ChartComponent from './components/ChartComponent';
import AIPromptForm from './components/AIPromptForm';
import AIOpinionDisplay from './components/AIOpinionDisplay';
import { useHistoricalData } from './hooks/useHistoricalData';
import { useAIOpinions } from './hooks/useAIOpinions';
import { MAJOR_INDICES } from './constants';

/**
 * The main App component
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  // Fetch historical data
  const { historicalData, isLoading: isLoadingData, error: dataError } = useHistoricalData();

  // Manage AI opinions
  const { opinions, isLoading: isLoadingOpinion, error: opinionError, fetchOpinion } = useAIOpinions(historicalData);

  // Handle form submission for generating AI opinions
  const handleSubmit = (modelName: string, systemPrompt: string, userPrompt: string) => {
    fetchOpinion(modelName, systemPrompt, userPrompt);
  };

  if (isLoadingData) {
    return <div>Loading historical data...</div>;
  }

  if (dataError) {
    return <div>Error loading historical data: {dataError}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">The Relative Strength of Semiconductors</h1>

      {/* Display application's purpose */}
      <div className="mb-8">
        <p id="purpose">This application is part of a suite of apps that help generate options strategy recommendations for trend or momentum traders, incorporating risk management and alternative strategies.</p>
      </div>
      <div className="mb-8">
        <p id="objective">This application focuses on the relative price performance of the {MAJOR_INDICES[0].symbol} Semiconductor ETF against the broader market.</p>
      </div>

      {/* Chart component for comparing indices */}
      <ChartComponent historicalData={historicalData} />

      {/* Form for inputting AI prompts */}
      <AIPromptForm onSubmit={handleSubmit} isLoading={isLoadingOpinion} />

      {opinionError && (
        <div className="text-red-500 mb-4">Error generating opinion: {opinionError}</div>
      )}

      {/* Display for showing AI-generated opinions */}
      <AIOpinionDisplay opinions={opinions} />
    </div>
  );
};

export default App;