import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // This allows process.env.API_KEY to be used in the client code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // Using default minifier (esbuild) instead of terser to avoid extra dependency issues
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});