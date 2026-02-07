// API Configuration
// LOCAL: Vite proxies /api → localhost:8080/backend. Use default.
// PRODUCTION: Use same origin as page so API hits same server (fixes www vs non-www)
const prod = import.meta.env.VITE_API_URL;
export const API_URL =
  typeof window !== "undefined" && /usnepallegalsolutions\.com/i.test(window.location?.hostname ?? "")
    ? window.location.origin + "/backend"
    : (prod ?? "/api");

// React app port (for CORS configuration)
export const REACT_PORT = window.location.port || "5173";
