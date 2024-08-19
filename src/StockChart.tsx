/**
 * @file StockChart.tsx
 * @description A React component that displays stock data using lightweight-charts
 * with Heikin-Ashi candles, volume bars, and Anchored VWAP indicators on a single chart.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
import { stockDataService, HistoricalDataPoint } from './stockDataService';

/**
 * Props interface for the StockChart component
 */
interface StockChartProps {
  /** The stock ticker symbol */
  symbol: string;
}

/**
 * StockChart component that displays stock data
 * @param {StockChartProps} props - The props for the StockChart component
 */
const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  // Reference to the chart container div
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the chart instance
  const chartRef = useRef<IChartApi | null>(null);
  // Reference to the candlestick series
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  // Reference to the volume series
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  // References to the VWAP series
  const vwapSeries1Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const vwapSeries2Ref = useRef<ISeriesApi<"Line"> | null>(null);
  // State to store the fetched stock data
  const [stockData, setStockData] = useState<HistoricalDataPoint[]>([]);

  /**
   * Fetches stock data using the stockDataService
   */
  const fetchStockData = async () => {
    try {
      const data = await stockDataService.fetchStockData(symbol);
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  /**
   * Sets up the chart with all series
   */
  const setupChart = () => {
    if (chartContainerRef.current) {
      // Create the chart instance
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 600,
        ...stockDataService.getChartOptions(),
      });

      // Add candlestick series
      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: 'rgba(238, 130, 238, 0.05)',
        downColor: 'rgba(255, 255, 255, 0.05)',
        borderUpColor: 'rgb(238, 130, 238)',
        borderDownColor: '#FFFFFF',
        wickUpColor: 'rgb(238, 130, 238)',
        wickDownColor: '#FFFFFF',
      });

      // Add volume series
      volumeSeriesRef.current = chartRef.current.addHistogramSeries({
        color: 'rgba(211, 211, 211, 0.2)',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      // Configure volume price scale
      chartRef.current.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Add VWAP series
      vwapSeries1Ref.current = chartRef.current.addLineSeries({
        color: 'orange',
        lineWidth: 1,
        lineStyle: 3, // Dotted
        title: '1-Year Anchored VWAP',
      });

      vwapSeries2Ref.current = chartRef.current.addLineSeries({
        color: 'lightgrey',
        lineWidth: 1,
        lineStyle: 3, // Dotted
        title: '100-Day Anchored VWAP',
      });
    }
  };

  /**
   * Updates the chart with new data
   */
  const updateChart = () => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current && vwapSeries1Ref.current && vwapSeries2Ref.current && stockData.length > 0) {
      // Calculate and set Heikin-Ashi data
      const heikinAshiData = stockDataService.calculateHeikinAshi(stockData);
      candlestickSeriesRef.current.setData(heikinAshiData as CandlestickData[]);

      // Prepare and set volume data
      const volumeData: HistogramData[] = stockData.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(211, 211, 211, 0.2)' : 'rgba(169, 169, 169, 0.1)',
      }));
      volumeSeriesRef.current.setData(volumeData);

      // Calculate and set 1-Year Anchored VWAP
      const oneYearVWAP = stockDataService.calculateAnchoredVWAP(stockData, 365);
      vwapSeries1Ref.current.setData(oneYearVWAP as LineData[]);

      // Calculate and set 100-Day Anchored VWAP
      const hundredDayVWAP = stockDataService.calculateAnchoredVWAP(stockData, 100);
      vwapSeries2Ref.current.setData(hundredDayVWAP as LineData[]);

      // Set visible range to last 12 months
      const twelfthMonthIndex = Math.max(0, heikinAshiData.length - 365);
      chartRef.current?.timeScale().setVisibleLogicalRange({
        from: twelfthMonthIndex,
        to: heikinAshiData.length - 1,
      });
    }
  };

  // Effect hook to fetch stock data when the component mounts or when symbol changes
  useEffect(() => {
    fetchStockData();
  }, [symbol]);

  // Effect hook to set up the chart when the component mounts
  useEffect(() => {
    setupChart();
    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Effect hook to update the chart when stock data changes
  useEffect(() => {
    if (stockData.length > 0) {
      updateChart();
    }
  }, [stockData]);

  // Render the chart container
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">{symbol} Anchored VWAP</h2>
      <div ref={chartContainerRef} className="w-full h-[600px]" />
    </div>
  );
};

export default StockChart;