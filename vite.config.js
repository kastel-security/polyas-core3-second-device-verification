import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return defineConfig({
    plugins: [
      vue(),
    ],
    server: {
      host: true,
      port: 5000,
      listen: 5000,
      
      proxy: {
        '/electionData': {
          target: "https://elections-k8s-dev.polyas.com/" + process.env.VITE_ELECTION_HASH + '/ssd/rest',
          changeOrigin: true
        },
        '/login': {
          target: "https://elections-k8s-dev.polyas.com/" + process.env.VITE_ELECTION_HASH + '/ssd/rest',
          changeOrigin: true
        },
        '/challenge': {
          target: "https://elections-k8s-dev.polyas.com/" + process.env.VITE_ELECTION_HASH + '/ssd/rest',
          changeOrigin: true
        }
      }
    }
  })
}