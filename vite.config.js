import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig({
      plugins: [
        vue(),
      ],
      server: {
        host: true,
        port: 5000,
        
        proxy: {
          '/electionData': {
            target: process.env.VITE_INSTANCE + '/ssd/rest',
            changeOrigin: true
          },
          '/login': {
            target: process.env.VITE_INSTANCE + '/ssd/rest',
            changeOrigin: true
          },
          '/challenge': {
            target: process.env.VITE_INSTANCE + '/ssd/rest',
            changeOrigin: true
          }
        }
      }
})
