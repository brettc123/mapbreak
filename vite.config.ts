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
});