import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import net from "node:net";

function isPortOpen(port, host = "127.0.0.1", timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onDone = (result) => {
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("error", () => onDone(false));
    socket.once("timeout", () => onDone(false));
    socket.connect(port, host, () => onDone(true));
  });
}

async function detectBackendTarget() {
  // You can override with BACKEND_PORT=8080 npm run dev
  const fromEnv = Number.parseInt(process.env.BACKEND_PORT || "", 10);
  if (Number.isFinite(fromEnv)) return `http://localhost:${fromEnv}`;

  // Most common: Apache is on 8080 (if port 80 is taken). Otherwise 80.
  if (await isPortOpen(8080)) return "http://localhost:8080";
  if (await isPortOpen(80)) return "http://localhost";

  // Fallback to 8080 (original project assumption)
  return "http://localhost:8080";
}

// Proxy the PHP backend through Vite so the browser stays same-origin (no CORS issues).
// Use /api to avoid clashing with the local ./backend folder (otherwise Vite may serve PHP as static files).
// Frontend will call /api/... and Vite will forward to <target>/us-nepal-legal-backend/...
export default defineConfig(async () => {
  const target = await detectBackendTarget();
  console.log(`[vite] Using PHP backend target: ${target}/us-nepal-legal-backend`);

  return {
    plugins: [react()],
    server: {
      port: 5175,
      strictPort: true,
      host: true,
      proxy: {
        // Serve uploaded images from a persistent Apache folder
        "/api/uploads": {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/uploads/, "/us-nepal-legal-uploads"),
        },
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/us-nepal-legal-backend"),
        },
      },
    },
  };
});

