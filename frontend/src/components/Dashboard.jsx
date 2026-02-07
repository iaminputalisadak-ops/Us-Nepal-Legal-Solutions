import React, { useState, useEffect } from "react";
import "../AdminDashboard.css";
import * as api from "../services/api.js";
import LawyersManagement from "./LawyersManagement.jsx";
import ContentManager from "./ContentManager.jsx";
import SiteSettingsManager from "./SiteSettingsManager.jsx";
import ConsultationsManagement from "./ConsultationsManagement.jsx";
import HeroSectionManager from "./HeroSectionManager.jsx";

export default function Dashboard({ admin, onLogout, token }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    // You can add API calls here to fetch dashboard stats
    // For now, we'll just show basic info
  }, []);

  const handleLogout = async () => {
    const tok = localStorage.getItem("adminToken");

    if (tok) {
      try {
        await api.logout(tok);
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    onLogout();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header__content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>US-NEPAL LEGAL SOLUTIONS</p>
          </div>
          <div className="admin-header__user">
            <div className="user-info">
              <span className="user-name">{admin.full_name}</span>
              <span className="user-email">{admin.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === "lawyers" ? "active" : ""}`}
            onClick={() => setActiveTab("lawyers")}
          >
            Lawyers
          </button>
          <button
            className={`tab-button ${activeTab === "practice_areas" ? "active" : ""}`}
            onClick={() => setActiveTab("practice_areas")}
          >
            Practice Areas
          </button>
          <button
            className={`tab-button ${activeTab === "publications" ? "active" : ""}`}
            onClick={() => setActiveTab("publications")}
          >
            Publications
          </button>
          <button
            className={`tab-button ${activeTab === "client_logos" ? "active" : ""}`}
            onClick={() => setActiveTab("client_logos")}
          >
            Client Logos
          </button>
          <button
            className={`tab-button ${activeTab === "journals" ? "active" : ""}`}
            onClick={() => setActiveTab("journals")}
          >
            Journals
          </button>
          <button
            className={`tab-button ${activeTab === "insights" ? "active" : ""}`}
            onClick={() => setActiveTab("insights")}
          >
            Insights
          </button>
          <button
            className={`tab-button ${activeTab === "articles" ? "active" : ""}`}
            onClick={() => setActiveTab("articles")}
          >
            Articles
          </button>
          <button
            className={`tab-button ${activeTab === "hero_content" ? "active" : ""}`}
            onClick={() => setActiveTab("hero_content")}
          >
            Hero Section
          </button>
          <button
            className={`tab-button ${activeTab === "feature_strips" ? "active" : ""}`}
            onClick={() => setActiveTab("feature_strips")}
          >
            Feature Strips
          </button>
          <button
            className={`tab-button ${activeTab === "about_content" ? "active" : ""}`}
            onClick={() => setActiveTab("about_content")}
          >
            About Us
          </button>
          <button
            className={`tab-button ${activeTab === "why_choose_us" ? "active" : ""}`}
            onClick={() => setActiveTab("why_choose_us")}
          >
            Why Choose Us
          </button>
          <button
            className={`tab-button ${activeTab === "consultation_fees" ? "active" : ""}`}
            onClick={() => setActiveTab("consultation_fees")}
          >
            Consultation Fees
          </button>
          <button
            className={`tab-button ${activeTab === "site_settings" ? "active" : ""}`}
            onClick={() => setActiveTab("site_settings")}
          >
            Site Settings
          </button>
          <button
            className={`tab-button ${activeTab === "consultations" ? "active" : ""}`}
            onClick={() => setActiveTab("consultations")}
          >
            Consultations
          </button>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Welcome Back!</h3>
                <p className="stat-value">{admin.full_name}</p>
                <p className="stat-label">Administrator</p>
              </div>
              <div className="stat-card">
                <h3>Username</h3>
                <p className="stat-value">{admin.username}</p>
                <p className="stat-label">Login ID</p>
              </div>
              <div className="stat-card">
                <h3>Email</h3>
                <p className="stat-value">{admin.email}</p>
                <p className="stat-label">Contact Email</p>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="content-card">
                <h2>Dashboard Overview</h2>
                <p>
                  Welcome to the admin dashboard for US-NEPAL LEGAL SOLUTIONS.
                  This is where you can manage the website content, view statistics,
                  and perform administrative tasks.
                </p>
                <div className="info-box">
                  <h3>Quick Actions</h3>
                  <ul>
                    <li>Manage website content</li>
                    <li>View user statistics</li>
                    <li>Update practice areas</li>
                    <li>Manage publications</li>
                    <li>View contact submissions</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "lawyers" && <LawyersManagement token={token} />}
        {activeTab === "practice_areas" && <ContentManager contentType="practice_areas" token={token} />}
        {activeTab === "publications" && <ContentManager contentType="publications" token={token} />}
        {activeTab === "client_logos" && <ContentManager contentType="client_logos" token={token} />}
        {activeTab === "journals" && <ContentManager contentType="journals" token={token} />}
        {activeTab === "insights" && <ContentManager contentType="insights" token={token} />}
        {activeTab === "articles" && <ContentManager contentType="articles" token={token} />}
        {activeTab === "hero_content" && <HeroSectionManager token={token} />}
        {activeTab === "feature_strips" && <ContentManager contentType="feature_strips" token={token} />}
        {activeTab === "about_content" && <ContentManager contentType="about_content" token={token} />}
        {activeTab === "why_choose_us" && <ContentManager contentType="why_choose_us" token={token} />}
        {activeTab === "consultation_fees" && <ContentManager contentType="consultation_fees" token={token} />}
        {activeTab === "site_settings" && <SiteSettingsManager token={token} />}
        {activeTab === "consultations" && <ConsultationsManagement token={token} />}
      </main>
    </div>
  );
}
