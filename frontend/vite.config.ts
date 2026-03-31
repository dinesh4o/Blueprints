import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  return {
    envDir: '..',
    plugins: [react(), tailwindcss(), basicSsl()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',          // 🔥 important (not just true)
      port: 5173,
      strictPort: true,
      allowedHosts: true,  
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
