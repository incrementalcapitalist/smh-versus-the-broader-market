# Relative Strength of Semiconductors App

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) 

## Overview

This application is designed to help traders generate options strategy recommendations by analyzing the relative performance of the SMH Semiconductor ETF against major market indices. It provides a comparison chart using TradingView's Advanced Chart widget, allows users to fetch opinions from various AI models, and displays detailed stock charts.

## Features

- **Major Indices Comparison Chart**: Displays a comparison chart of major indices using TradingView's Advanced Chart widget.
- **AI Opinions**: Fetches opinions from multiple AI models to analyze relative performance.
- **Detailed Stock Charts**: Allows users to view detailed TradingView charts of individual stocks.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- API keys for the AI models (OpenAI, Groq, Claude, Gemini) and Polygon.
- TradingView widget library (included via CDN in the HTML file).

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:incrementalcapitalist/smh-versus-the-broader-market.git
   cd smh-versus-the-broader-market
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_CLAUDE_API_KEY=your_claude_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_POLYGON_API_KEY=your_polygon_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Comparison Chart**: The main page displays a comparison chart of major indices using the TradingView widget.
2. **AI Opinions**: Enter system and user prompts, then click on the AI model buttons to fetch opinions.
3. **Detailed Stock Charts**: Enter a stock symbol and click "Fetch Data" to view a detailed TradingView chart of the stock.

## Components

### App.tsx

The main application component that handles the following functionalities:

- **State Management**: Manages the state for stock symbols, AI opinions, and prompts.
- **Event Handlers**: Handles input changes, form submissions, and keydown events.
- **AI Opinions**: Fetches opinions from AI models based on the provided prompts and stock data.
- **TradingView Chart**: Creates a comparison chart using the TradingView widget.
- **TradingViewStockChart Component**: Renders detailed stock charts based on the submitted stock symbol.

### TradingViewStockChart.tsx

A React component that displays stock data using the TradingView Advanced Chart widget.

- **Props**: Accepts a `symbol` prop to specify which stock to display.
- **Functionality**: 
  - Uses the TradingView widget library to create an advanced chart.
  - Configures the chart with daily candles, Heikin-Ashi style, and volume indicator.
  - Allows symbol changes and drawing on the chart.
  - Uses a dark theme for better visibility.

### StockDataService.ts

A service for fetching and processing stock data from the Polygon.io API.

- **fetchStockData**: Fetches historical stock data.
- **fetchShortVolumeData**: Fetches short volume data.
- **calculateHeikinAshi**: Calculates Heikin-Ashi data from regular candlestick data.
- **calculateAnchoredVWAP**: Calculates Anchored VWAP (Volume Weighted Average Price).
- **getChartOptions**: Gets the chart options for a standard chart setup.

## Configuration

### AI Models

The application supports multiple AI models:

- **OpenAI**: Uses the OpenAI API for generating opinions.
- **Groq**: Uses the Groq API for generating opinions.
- **Claude**: Uses the Claude API for generating opinions.
- **Gemini**: Uses the Gemini API for generating opinions.

### TradingView Chart Configuration

The TradingView chart is configured with the following options:

- Dark theme
- Daily interval
- Heikin-Ashi candles
- Volume indicator
- Symbol change allowed
- Drawing tools enabled

### Major Indices

The major indices to compare are defined in the `MAJOR_INDICES` constant:

```typescript
const MAJOR_INDICES = [
  { symbol: 'SMH', description: 'Semiconductor ETF' },
  { symbol: 'SPY', description: 'S&P 500' },
  { symbol: 'DIA', description: 'Dow Jones Industrial Average' },
  { symbol: 'QQQ', description: 'NASDAQ Composite' },
  { symbol: 'IWM', description: 'Russell 2000' },
];
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the GNU General Public License (GPL) v3.0. See the [LICENSE](LICENSE) file for more information.

### Why GPL v3?

The GPL v3 license enforces strong copyleft requirements and ensures that all derivative works of this project remain open source. This license also provides additional protections against patent claims, which aligns with the goal to keep contributions and derivatives freely available and to safeguard the project's integrity and freedom.

## Contact

For any questions or feedback, please contact [incrementalcapitalist@hotmail.com](mailto:incrementalcapitalist@hotmail.com).