import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths so Electron can load from the local file system
  base: './',
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
