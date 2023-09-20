import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite';


export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  const path=process.env.VITE_POLYAS
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
      port: 4300,
       watch: {
         usePolling: true
       },
       proxy: {
        '/electionData': {
          target: path+'/electionData',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/login': {
          target: path+'/login',
          changeOrigin: true
        },
        '/challenge': {
          target: path+'/challenge',
          changeOrigin: true
        }
       }
    }
  });
}