import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react-map-gl': 'react-map-gl/dist/esm'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react-map-gl', 'maplibre-gl']
  },
  
  // ADDED: CSS fixes for mobile builds
  build: {
    cssCodeSplit: false, // Keep all CSS together for mobile
    rollupOptions: {
      output: {
        manualChunks: undefined, // Prevent CSS splitting
      }
    }
  },
  
  // ADDED: Explicit CSS configuration
  css: {
    postcss: './postcss.config.js',
  }
});