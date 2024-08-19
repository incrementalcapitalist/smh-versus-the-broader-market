/**
 * @file vite.config.ts
 * @description Configuration file for Vite
 */

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Export the Vite configuration
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // Configure plugins
    plugins: [react()],
    // Define global constants for the app
    define: {
      // Make the Polygon API key available as an environment variable in the app
      'import.meta.env.VITE_POLYGON_API_KEY': JSON.stringify(env.VITE_POLYGON_API_KEY)
    }
  }
})