/**
 * @file ChartComponent.tsx
 * @description A component that renders a TradingView chart comparing SMH to other major indices.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { MAJOR_INDICES, CHART_COLORS } from '../constants';

/**
 * ChartComponent renders a TradingView chart for comparing indices
 * @returns {JSX.Element} The rendered chart component
 */
const ChartComponent: React.FC = () => {
  // Reference to the chart container element
  const chartRef = useRef<HTMLDivElement>(null);

  /**
   * Creates the comparison chart using TradingView widget
   */
  const createComparisonChart = useCallback(() => {
    // Check if the chart container and TradingView library are available
    if (chartRef.current && window.TradingView) {
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
    style: '3', // Use area style
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
      "volume.volume.transparency": 50, // Set volume bars transparency
        },
      });
    }
  }, []); // Empty dependency array as this function doesn't depend on any props or state

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
  }, [createComparisonChart]);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Comparing Semiconductors against Major Indices</h2>
      <div id="comparison-chart" ref={chartRef} className="w-full h-[400px]" />
    </div>
  );
};

export default ChartComponent;