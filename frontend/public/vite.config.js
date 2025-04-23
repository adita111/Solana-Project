import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  optimizeDeps: {
    include: ['buffer'],
  },
  define: {
    global: {},
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
});