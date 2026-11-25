import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 5000,
    rolldownOptions: {
      input: {
        menu: 'index.html',
        nivel1: 'nivel1.html',
        gameover: 'gameover.html',
        creditos: 'creditos.html',
      },
    },
  },
});
