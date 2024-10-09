import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Exclude React DevTools in production
      babel: {
        plugins: process.env.NODE_ENV === 'production' 
          ? ['babel-plugin-dev-expression']
          : [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(import.meta.url), './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
    sourcemap: false, // Disable sourcemaps in production
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})