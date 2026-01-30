import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/mad-mage-roguelike/',
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk - Vue and Pinia
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
              return 'vendor';
            }
          }
          // Data chunk - Large JSON data files
          if (id.includes('/data/encounters-') || id.includes('/data/monsters.json')) {
            return 'encounter-data';
          }
          // Utils chunk - Utility functions
          if (id.includes('/utils/')) {
            return 'utils';
          }
        }
      }
    }
  }
})
