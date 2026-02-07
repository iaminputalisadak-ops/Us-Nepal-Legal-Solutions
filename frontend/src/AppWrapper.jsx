import React, { useState, useEffect } from "react";
import App from "./App.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import Dashboard from "./components/Dashboard.jsx";
import * as api from "./services/api.js";

export default function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  useEffect(() => {
    const onPopState = () => {
      setLocationState({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };

    window.addEventListener("popstate", onPopState);

    // Check if user is already logged in
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");

    if (token && adminData) {
      verifySession(token);
    } else {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const isAdminIntent = (() => {
    const pathname = (locationState.pathname || "").toLowerCase();
    // Explicit routes
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
    if (pathname === "/login" || pathname.startsWith("/login/")) return true;

    const urlParams = new URLSearchParams(locationState.search || "");
    // Common: ?admin=true or ?login=true
    if (urlParams.get("login") === "true" || urlParams.get("admin") === "true") return true;
    // Handle incorrectly encoded links like ?admin%3Dtrue (key is "admin=true" with empty value)
    if (urlParams.has("admin=true") || urlParams.has("login=true")) return true;

    return false;
  })();

  const navigate = (to) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, "", to);
    setLocationState({
      pathname: window.location.pathname,
      search: window.location.search,
    });
    // Scroll to top on route change (SPA-style navigation)
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const pathname = (locationState.pathname || "/").toLowerCase();

  const verifySession = async (token) => {
    try {
      const data = await api.verifySession(token);

      if (data.success) {
        setAdminToken(token);
        // Ensure token is persisted for uploads/actions
        localStorage.setItem("adminToken", token);
        setAdmin(data.data.admin);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
      }
    } catch (err) {
      console.error("Session verification error:", err);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (loginData) => {
    if (loginData?.token) {
      setAdminToken(loginData.token);
      localStorage.setItem("adminToken", loginData.token);
    }
    setAdmin(loginData.admin);
    setIsAuthenticated(true);
    navigate("/admin");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdmin(null);
    setAdminToken("");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        background: "#f5f7f5"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #e6ede8",
            borderTop: "4px solid #1f5e2e",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }}></div>
          <p style={{ color: "#5a6b5f" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // IMPORTANT: Only show Admin UI when the URL indicates admin intent.
  // This prevents other homepage tabs from switching to admin just because you're logged in.
  if (isAdminIntent) {
    const isLoginRoute = pathname === "/login" || pathname.startsWith("/login/");

    // /login should always show the login screen (even if already logged in)
    if (isLoginRoute) {
      return (
        <AdminLogin
          onLogin={handleLogin}
          onCancel={() => {
            navigate("/");
          }}
        />
      );
    }

    // /admin shows the dashboard when authenticated; otherwise show login.
    if (isAuthenticated && admin) {
      return <Dashboard admin={admin} onLogout={handleLogout} token={adminToken} />;
    }

    return (
      <AdminLogin
        onLogin={handleLogin}
        onCancel={() => {
          navigate("/");
        }}
      />
    );
  }

  return (
    <>
      <App navigate={navigate} route={pathname} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
