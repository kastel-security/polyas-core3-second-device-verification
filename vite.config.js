import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 3000,
    
    proxy: {
      '/electionData': {
        target: "https://elections-k8s-dev.polyas.com/10f9e7ec-a92d-43c5-8262-22d73ffc57ce/ssd/rest",
        changeOrigin: true
      }
    }
  }
});
