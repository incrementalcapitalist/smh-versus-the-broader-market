/**
 * @file main.tsx
 * @description The entry point of the application
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a root for the React application
const root = createRoot(document.getElementById('root')!)

// Render the App component wrapped in StrictMode
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)