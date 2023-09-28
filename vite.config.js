import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import vue from "@vitejs/plugin-vue";

const defaultConfig = {
  plugins: [
    EnvironmentPlugin('all', { prefix: 'ELECTION_' }),
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5000,
    listen: 5000,
  }
}

export default defineConfig(({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    ...defaultConfig,
    server: {
      host: true,
      port: 5000,
      listen: 5000,
      proxy: {
        '/electionData': {
          target: process.env.VITE_ELECTION_URL + '/' + process.env.VITE_ELECTION_HASH + '/ssd/rest',
          changeOrigin: true
        },
        '/login': {
          target: process.env.VITE_ELECTION_URL + '/' + process.env.VITE_ELECTION_HASH + '/ssd/rest',
          changeOrigin: true
        },
        '/challenge': {
          target: process.env.VITE_ELECTION_URL + '/' + process.env.VITE_ELECTION_HASH + '/ssd/rest',
          changeOrigin: true
        }
      }
    }
  }
})
