/**
 * @file useAIOpinions.ts
 * @description Custom hook for managing AI-generated opinions
 */

import { useState, useCallback } from 'react';
import { AI_MODELS } from '../constants';
import { getAIOpinion } from '../services/aiService';
import { HistoricalDataPoint } from '../services/stockDataService';

interface AIOpinion {
  modelName: string;
  opinion: string;
}

interface UseAIOpinionsResult {
  opinions: AIOpinion[];
  isLoading: boolean;
  error: string | null;
  fetchOpinion: (modelName: string, systemPrompt: string, userPrompt: string) => Promise<void>;
}

/**
 * Custom hook for managing AI-generated opinions
 * @param {HistoricalDataPoint[]} historicalData - Historical stock data to be used in generating opinions
 * @returns {UseAIOpinionsResult} An object containing opinions, loading state, error state, and a function to fetch new opinions
 */
export const useAIOpinions = (historicalData: HistoricalDataPoint[]): UseAIOpinionsResult => {
  const [opinions, setOpinions] = useState<AIOpinion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpinion = useCallback(async (modelName: string, systemPrompt: string, userPrompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const model = AI_MODELS.find(m => m.name === modelName);
      if (!model) {
        throw new Error(`AI model "${modelName}" not found`);
      }

      const opinion = await getAIOpinion(model, systemPrompt, userPrompt, historicalData);
      
      setOpinions(prevOpinions => [
        ...prevOpinions.filter(o => o.modelName !== modelName),
        { modelName, opinion }
      ]);
    } catch (err) {
      console.error('Error fetching AI opinion:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [historicalData]);

  return { opinions, isLoading, error, fetchOpinion };
};