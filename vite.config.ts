import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { join } from 'path'

export default defineConfig({
  plugins: [crx({ manifest })],
  base: '/',
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  }
})
