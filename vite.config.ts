/**
 * @file vite.config.ts
 * @description Configuration file for Vite
 */

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Export the Vite configuration
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // Configure plugins
    plugins: [react()],
    // Define global constants for the app
    define: {
      // Make environment variables available as global constants in the app
      'import.meta.env.VITE_POLYGON_API_KEY': JSON.stringify(env.VITE_POLYGON_API_KEY),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY),
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
      'import.meta.env.VITE_CLAUDE_API_KEY': JSON.stringify(env.VITE_CLAUDE_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_MISTRAL_API_KEY': JSON.stringify(env.VITE_MISTRAL_API_KEY),
      // Add any other environment variables you need here
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})