import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Apache on port 8080, MySQL on 3308 - backend at http://localhost:8080/backend/
function getBackendTarget() {
  const port = Number.parseInt(process.env.BACKEND_PORT || "8080", 10);
  return `http://localhost:${port}`;
}

// Proxy the PHP backend through Vite so the browser stays same-origin (no CORS issues).
// Use /api to avoid clashing with the local ./backend folder (otherwise Vite may serve PHP as static files).
// Frontend calls /api/... → Vite forwards to <target>/backend/...
// Your backend folder in XAMPP should be at: C:\xampp\htdocs\backend\
export default defineConfig(() => {
  const target = getBackendTarget();
  console.log(`[vite] Backend: ${target}/backend (Apache port 8080)`);

  return {
    appType: "spa",
    plugins: [react()],
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

