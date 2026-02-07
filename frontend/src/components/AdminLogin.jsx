import React, { useState } from "react";
import "../Login.css";
import * as api from "../services/api.js";

export default function AdminLogin({ onLogin, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ok, status, data, text } = await api.login(username, password);

      if (!ok) {
        let serverMessage = "";
        try {
          const maybeJson = text ? JSON.parse(text) : null;
          if (maybeJson && typeof maybeJson.message === "string") serverMessage = maybeJson.message;
        } catch {
          // ignore parse errors
        }

        if (status === 404) {
          setError(
            serverMessage ||
              "API not found (404).\n\nFix:\n1) Make sure XAMPP Apache is running.\n2) Copy your project `api` folder to: C:\\xampp\\htdocs\\api\\\n3) Test in browser:\n   - http://localhost/api/login.php\n   - http://localhost:8080/api/login.php\n\n(Whichever one opens, that is your Apache port.)"
          );
        } else if (status === 500) {
          const dbHint = "Edit api/config.db.php (copy from config.db.php.example). Add your MySQL username, password, database name. LOCAL: port 3308. CPANEL: port 3306.";
          setError(serverMessage || `Database connection failed.\n\n${dbHint}`);
        } else {
          setError(serverMessage || `Server error (${status}). Please try again.`);
        }
        setLoading(false);
        return;
      }

      if (data && data.success) {
        localStorage.setItem("adminToken", data.data.token);
        localStorage.setItem("adminData", JSON.stringify(data.data.admin));
        onLogin(data.data);
      } else {
        setError((data && data.message) || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError(
          "Cannot connect to API.\n\nFix checklist:\n1) Make sure ONLY ONE Vite dev server is running (close old terminals).\n2) Make sure you opened the CURRENT Vite URL shown in the terminal.\n3) Apache must be running (XAMPP) and api folder must work:\n   http://localhost:8080/api/login.php\n\nIf api works in browser but login still fails, restart Vite (Ctrl+C then npm run dev)."
        );
      } else {
        setError(`Network error: ${err.message}. Please check if PHP API is running.`);
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
