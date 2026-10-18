import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'out/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/webview/index.tsx'),
      output: {
        format: 'iife',
        entryFileNames: 'index.js',
        assetFileNames: '[name][extname]',
      },
    },
    cssCodeSplit: false,
    minify: true,
  },
});
