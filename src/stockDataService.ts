/**
 * @file stockDataService.ts
 * @description A service for fetching and processing stock data from Polygon.io API
 */

import { ColorType } from 'lightweight-charts';

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
  private cachedData: Map<string, HistoricalDataPoint[]> = new Map();
  private cachedShortVolumeData: Map<string, ShortVolumeDataPoint[]> = new Map();

  /**
   * Constructor for StockDataService
   * @param {string} apiKey - The Polygon.io API key
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
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
      // Calculate date range for historical data (24 months)
      const toDate = new Date();
      const fromDate = new Date(toDate);
      fromDate.setMonth(fromDate.getMonth() - 24);

      // Construct the API URL
      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${this.formatDate(fromDate)}/${this.formatDate(toDate)}?apiKey=${this.apiKey}&sort=asc&limit=756`;

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

      return formattedData;
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
    // Check if data is already cached
    if (this.cachedShortVolumeData.has(symbol)) {
      return this.cachedShortVolumeData.get(symbol)!;
    }

    try {
      // Calculate date range for short volume data (24 months)
      const toDate = new Date();
      const fromDate = new Date(toDate);
      fromDate.setMonth(fromDate.getMonth() - 24);

      // Construct the API URL
      const url = `https://api.polygon.io/v2/stock/short-volume/${symbol}/${this.formatDate(fromDate)}/${this.formatDate(toDate)}?apiKey=${this.apiKey}`;

      // Fetch short volume data from Polygon.io
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the API returned an error
      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Failed to fetch short volume data from Polygon.io');
      }

      if (!Array.isArray(data.results)) {
        throw new Error('Unexpected data format from Polygon.io');
      }

      const formattedData: ShortVolumeDataPoint[] = data.results.map((item: any) => ({
        time: this.formatDate(new Date(item.date)),
        shortVolume: item.short_volume,
        totalVolume: item.total_volume,
      }));

      // Cache the formatted data
      this.cachedShortVolumeData.set(symbol, formattedData);

      return formattedData;
    } catch (error) {
      console.error('Error fetching short volume data:', error);
      throw error;
    }
  }

  /**
   * Calculates Heikin-Ashi data from regular candlestick data
   * @param {HistoricalDataPoint[]} data - The regular candlestick data
   * @returns {HistoricalDataPoint[]} The Heikin-Ashi candlestick data
   */
  calculateHeikinAshi(data: HistoricalDataPoint[]): HistoricalDataPoint[] {
    return data.map((d, i, arr) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (arr[i-1].open + arr[i-1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);

      return {
        time: d.time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        volume: d.volume
      };
    });
  }

  /**
   * Calculates Anchored VWAP (Volume Weighted Average Price)
   * @param {HistoricalDataPoint[]} data - The historical price data
   * @param {number} anchorDays - The number of days to anchor the VWAP
   * @returns {Array<{ time: string; value: number }>} The calculated VWAP data
   */
  calculateAnchoredVWAP(data: HistoricalDataPoint[], anchorDays: number): Array<{ time: string; value: number }> {
    const anchorIndex = Math.max(0, data.length - anchorDays);
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    
    return data.slice(anchorIndex).map((d) => {
      const typicalPrice = (d.high + d.low + d.close) / 3;
      cumulativeTPV += typicalPrice * d.volume;
      cumulativeVolume += d.volume;
      const vwap = cumulativeTPV / cumulativeVolume;
      return { time: d.time, value: vwap };
    });
  }

  /**
   * Get the chart options for a standard chart setup
   * @returns {Object} The chart options
   */
  getChartOptions() {
    return {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
    };
  }
}

// Export a singleton instance of StockDataService
export const stockDataService = new StockDataService(import.meta.env.VITE_POLYGON_API_KEY);