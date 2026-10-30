import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/99-names-of-allah/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-dom') || id.includes('/node_modules/react/')) return 'react-vendor';
        },
      },
    },
  },
});
