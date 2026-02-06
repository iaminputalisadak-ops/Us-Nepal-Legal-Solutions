// API Configuration
// LOCAL: Vite proxies /api → localhost:8080/backend. Use default.
// PRODUCTION: Set in .env.production (e.g. VITE_API_URL=https://usnepallegalsolutions.com/backend)
export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// React app port (for CORS configuration)
export const REACT_PORT = window.location.port || "5173";
