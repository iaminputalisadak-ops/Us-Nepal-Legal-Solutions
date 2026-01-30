// API Configuration
// Update this if your PHP backend is on a different URL
// We proxy /api through Vite to avoid CORS issues, but you can override with VITE_API_URL
// Example (Windows): create `.env.local` with:
// VITE_API_URL=http://localhost:8080/backend
export const API_URL = import.meta.env.VITE_API_URL || "/api";

// React app port (for CORS configuration)
export const REACT_PORT = window.location.port || "5173";
