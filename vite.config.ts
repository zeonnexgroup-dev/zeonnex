import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Generates a real /admin/index.html fallback in addition to the SPA
    // rewrite, so direct /admin visits remain resilient on static hosts.
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        admin: resolve(projectRoot, "admin/index.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
});
