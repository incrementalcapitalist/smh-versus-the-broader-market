/**
 * @file stockDataService.ts
 * @description Service for fetching and processing stock data from Polygon.io API
 */

import { HISTORY_LIMIT } from '../constants';

/**
 * Interface for historical data points returned from the API
 */
export interface HistoricalDataPoint {
  time: string;   // Timestamp of the data point
  open: number;   // Opening price
  high: number;   // Highest price
  low: number;    // Lowest price
  close: number;  // Closing price
  volume: number; // Trading volume
}

/**
 * Interface for short volume data points
 */
export interface ShortVolumeDataPoint {
  time: string;        // Timestamp of the data point
  shortVolume: number; // Short volume
  totalVolume: number; // Total volume
}

/**
 * Class to manage stock data fetching and processing
 */
export class StockDataService {
  private apiKey: string;
  private baseUrl: string = 'https://api.polygon.io/v2';
  private cachedData: Map<string, HistoricalDataPoint[]> = new Map();

  /**
   * Constructor for StockDataService
   */
  constructor() {
    this.apiKey = import.meta.env.VITE_POLYGON_API_KEY;
    if (!this.apiKey) {
      throw new Error('Polygon API key is not set in environment variables.');
    }
  }

  /**
   * Formats a Date object to a string (YYYY-MM-DD)
   * @param {Date} date - The date to format
   * @returns {string} The formatted date string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Fetches historical stock data from Polygon.io
   * @param {string} symbol - The stock symbol to fetch data for
   * @returns {Promise<HistoricalDataPoint[]>} A promise that resolves to an array of historical data points
   */
  async fetchStockData(symbol: string): Promise<HistoricalDataPoint[]> {
    // Check if data is already cached
    if (this.cachedData.has(symbol)) {
      return this.cachedData.get(symbol)!;
    }

    try {
      // Calculate date range for historical data (2 years)
      const toDate = new Date();
      const fromDate = new Date(toDate);
      fromDate.setFullYear(fromDate.getFullYear() - 2);

      // Construct the API URL
      const url = `${this.baseUrl}/aggs/ticker/${symbol}/range/1/day/${this.formatDate(fromDate)}/${this.formatDate(toDate)}?apiKey=${this.apiKey}&sort=asc&limit=5000`;

      // Fetch historical data from Polygon.io
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the API returned an error
      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Failed to fetch historical data from Polygon.io');
      }

      // Format the historical data
      if (!Array.isArray(data.results)) {
        throw new Error('Unexpected data format from Polygon.io');
      }

      const formattedData: HistoricalDataPoint[] = data.results.map((item: any) => ({
        time: this.formatDate(new Date(item.t)),
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v,
      }));

      // Cache the formatted data
      this.cachedData.set(symbol, formattedData);

      // Return the last HISTORY_LIMIT data points
      return formattedData.slice(-HISTORY_LIMIT);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  }

  /**
   * Fetches short volume data from Polygon.io
   * @param {string} symbol - The stock symbol to fetch data for
   * @returns {Promise<ShortVolumeDataPoint[]>} A promise that resolves to an array of short volume data points
   */
  async fetchShortVolumeData(symbol: string): Promise<ShortVolumeDataPoint[]> {
    // Implementation for fetching short volume data
    // This is a placeholder and should be implemented based on Polygon.io's API for short volume data
    throw new Error('fetchShortVolumeData not implemented');
  }
}

// Export a singleton instance of StockDataService
export const stockDataService = new StockDataService();