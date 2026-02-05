import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Note: rollup-plugin-visualizer removed for now
    // Run 'npm install' to get all dev dependencies
    // Then uncomment to enable bundle analysis
  ].filter(Boolean),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Production build optimizations
  build: {
    // Source maps only in development
    sourcemap: mode === 'development',

    // Use Terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.logs in production
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Vendor code splitting for better caching
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Monaco Editor (large dependency)
          'vendor-monaco': ['@monaco-editor/react'],

          // Document processing libraries
          'vendor-doc': ['pdf-lib', 'jspdf', 'mammoth', 'docx', 'pdfjs-dist'],

          // Data processing libraries
          'vendor-data': ['xlsx', 'papaparse'],

          // UI libraries
          'vendor-ui': ['lucide-react'],
        },

        // Consistent chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Enable module preload for faster loading
    modulePreload: {
      polyfill: true,
    },
  },

  // Define global constants
  define: {
    __DEV__: mode === 'development',
  },
}));
