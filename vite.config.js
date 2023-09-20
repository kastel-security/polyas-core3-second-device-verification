import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path='https://election.polyas.com/bcd5805a-3d1a-4bce-b958-4da9ca80254f/ssd/rest/'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 4300, // This is the port which we will use in docker
    // Thanks @sergiomoura for the window fix
    // add the next lines if you're using windows and hot reload doesn't work
     watch: {
       usePolling: true
     },
     proxy: {
      '/electionData': {
        target: path+'electionData',
        changeOrigin: true
      },
      '/login': {
        target: path+'login',
        changeOrigin: true
      },
      '/challenge': {
        target: path+'challenge',
        changeOrigin: true
      }
     }
  }
})