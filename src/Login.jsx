import React, { useState } from "react";
import "./Login.css";
import { API_URL } from "./config.js";

export default function Login({ onLogin, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // Check if response is OK
      if (!response.ok) {
        let serverMessage = "";
        try {
          const maybeJson = await response.json();
          if (maybeJson && typeof maybeJson.message === "string") serverMessage = maybeJson.message;
        } catch {
          // ignore parse errors
        }

        if (response.status === 404) {
          setError(
            serverMessage ||
              "Backend not found (404).\n\nFix:\n1) Make sure XAMPP Apache is running.\n2) Copy your project `backend` folder to: C:\\xampp\\htdocs\\backend\\\n3) Test in browser:\n   - http://localhost/backend/login.php\n   - http://localhost:8080/backend/login.php\n\n(Whichever one opens, that is your Apache port.)"
          );
        } else if (response.status === 500) {
          setError(
            serverMessage ||
              "Server error. Please check database connection and XAMPP MySQL is running."
          );
        } else {
          setError(serverMessage || `Server error (${response.status}). Please try again.`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem("adminToken", data.data.token);
        localStorage.setItem("adminData", JSON.stringify(data.data.admin));
        onLogin(data.data);
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError(
          "Cannot connect to backend.\n\nFix checklist:\n1) Make sure ONLY ONE Vite dev server is running (close old terminals).\n2) Make sure you opened the CURRENT Vite URL shown in the terminal.\n3) Apache must be running (XAMPP) and backend must work:\n   http://localhost:8080/backend/login.php\n\nIf backend works in browser but login still fails, restart Vite (Ctrl+C then npm run dev)."
        );
      } else {
        setError(`Network error: ${err.message}. Please check if PHP backend is running.`);
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>US-NEPAL LEGAL SOLUTIONS</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter username or email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="login-footer">
          <p className="default-credentials">
            Default: <strong>admin</strong> / <strong>admin123</strong>
          </p>
          {typeof onCancel === "function" && (
            <button
              type="button"
              onClick={onCancel}
              className="login-button"
              style={{
                background: "transparent",
                color: "#1f5e2e",
                border: "1px solid #1f5e2e",
                marginTop: "0.75rem",
              }}
            >
              Back to website
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
