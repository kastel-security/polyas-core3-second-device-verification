import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'


export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  if (process.env.VITE_MODE == 'dev') {
    return defineConfig({
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
        port: 5000,
        
        proxy: {
          '/electionData': {
            target: process.env.VITE_POLYAS + '/ssd/rest',
            changeOrigin: true
          },
          '/login': {
            target: process.env.VITE_POLYAS + '/ssd/rest',
            changeOrigin: true
          },
          '/challenge': {
            target: process.env.VITE_POLYAS + '/ssd/rest',
            changeOrigin: true
          }
        }
      }
    })
  } else {
    return defineConfig({
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
        port: 5000
      }
    });
  }

}
