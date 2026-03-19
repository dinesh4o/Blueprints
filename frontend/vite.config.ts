import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      fs: {
        allow: ['..'],
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    optimizeDeps: {
      exclude: ['@langchain/langgraph', '@langchain/core', '@langchain/google-genai', 'chromadb', 'better-sqlite3', '@xenova/transformers', 'html2pdf.js'],
      include: ['lucide-react', 'recharts', 'framer-motion', 'clsx', 'tailwind-merge', 'axios', 'react-router-dom', 'd3']
    }
  };
});
