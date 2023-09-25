import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


export default ({ mode }) => {
  const deployConfig = {
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
  }
  const devConfig = {
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
          target: 'https://elections-k8s-dev.polyas.com/10f9e7ec-a92d-43c5-8262-22d73ffc57ce/ssd/rest',
          changeOrigin: true
        },
        '/login': {
          target: 'https://elections-k8s-dev.polyas.com/10f9e7ec-a92d-43c5-8262-22d73ffc57ce/ssd/rest',
          changeOrigin: true
        },
        '/challenge': {
          target: 'https://elections-k8s-dev.polyas.com/10f9e7ec-a92d-43c5-8262-22d73ffc57ce/ssd/rest',
          changeOrigin: true
        }
      }
    }
  }
  return defineConfig(devConfig);

}
