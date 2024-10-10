import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Function to determine the base path
  const getBasePath = () => {
    if (process.env.VERCEL_URL && !process.env.VERCEL_URL.includes('xqlzv.com')) {
      // We're on Vercel, and it's not the custom domain
      return '/'
    }
    // We're either in development or on the custom domain
    return '/seo/'
  }

  return {
    plugins: [react()],
    base: getBasePath(),

    resolve: {
      alias: {
        '@': path.resolve(fileURLToPath(import.meta.url), './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'seo-assets', // Changed to match vercel.json configuration
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
      sourcemap: false,
    },
    server: {
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    define: {
      'import.meta.env.BASE_PATH': JSON.stringify(getBasePath()),
      'import.meta.env.VERCEL_URL': JSON.stringify(process.env.VERCEL_URL || '')
    }
  }
})