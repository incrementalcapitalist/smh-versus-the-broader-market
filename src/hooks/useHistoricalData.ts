/**
 * @file useHistoricalData.ts
 * @description Custom hook for fetching and managing historical stock data
 */

import { useState, useEffect } from 'react';
import { stockDataService, HistoricalDataPoint } from '../services/stockDataService';
import { MAJOR_INDICES } from '../constants';

/**
 * Custom hook for fetching and managing historical stock data
 * @returns An object containing historical data, loading state, and error state
 */
export const useHistoricalData = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch historical data for the main symbol (SMH)
        const data = await stockDataService.fetchStockData(MAJOR_INDICES[0].symbol);
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setError('Failed to fetch historical data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  return { historicalData, isLoading, error };
};