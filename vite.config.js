import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [react()],
    server: {
      port: 8081,
      host: true,
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: 8081,
    }
  };
});
