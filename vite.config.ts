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
  
  // ADD THESE CSS FIXES FOR MOBILE
  build: {
    // Keep CSS together for mobile builds
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Ensure CSS is properly bundled
        manualChunks: undefined,
      }
    }
  },
  
  // Ensure PostCSS/Tailwind is processed correctly
  css: {
    postcss: './postcss.config.js'
  }
});