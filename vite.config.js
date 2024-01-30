import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: './index.js',
      formats: ['es'],
    },
  },
})
