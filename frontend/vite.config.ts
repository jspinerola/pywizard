import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    checker({ typescript: false }),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Any request starting with /api will be forwarded
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        // Optional: Rewrite the path (e.g., remove /api)
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
