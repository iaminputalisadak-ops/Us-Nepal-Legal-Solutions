import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Apache on port 8080, MySQL on 3308 - api at http://localhost:8080/api/
function getApiTarget() {
  const port = Number.parseInt(process.env.BACKEND_PORT || "8080", 10);
  return `http://localhost:${port}`;
}

// Proxy the PHP API through Vite so the browser stays same-origin (no CORS issues).
// Frontend calls /api/* → Vite forwards to <target>/backend/* (for local XAMPP)
// Copy project backend/ or api/ folder to: C:\xampp\htdocs\backend\
export default defineConfig(() => {
  const target = getApiTarget();
  console.log(`[vite] API: ${target}/backend (C:\\xampp\\htdocs\\backend\\)`);

  return {
    appType: "spa",
    plugins: [react()],
    root: ".",
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      port: 5175,
      strictPort: false,
      host: true,
      proxy: {
        // Serve uploaded images from a persistent Apache folder
        "/api/uploads": {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/uploads/, "/backend/uploads"),
        },
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/backend"),
        },
      },
    },
  };
});
