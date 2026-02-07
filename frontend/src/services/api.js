/**
 * Centralized API service - ALL API calls go through this file.
 * Uses API_URL from config.js
 */
import { API_URL } from "../config.js";

// ---- Auth ----
export async function login(username, password) {
  const res = await fetch(`${API_URL}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { ok: res.ok, status: res.status, data, text };
}

export async function logout(token) {
  return fetch(`${API_URL}/logout.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export async function verifySession(token) {
  const res = await fetch(`${API_URL}/verify_session.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return res.json();
}

// ---- Content (content_api.php) ----
export function getContentUrl(type, cacheBust = true) {
  const q = cacheBust ? `&_=${Date.now()}` : "";
  return `${API_URL}/content_api.php?type=${type}${q}`;
}

export async function getContent(type) {
  const res = await fetch(getContentUrl(type), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return res.json();
}

export async function createContent(type, payload) {
  const token = payload.token || localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/content_api.php?type=${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, token }),
  });
  return res.json();
}

export async function updateContent(type, payload) {
  const token = payload.token || localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/content_api.php?type=${type}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, token }),
  });
  return res.json();
}

export async function deleteContent(type, id) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/content_api.php?type=${type}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, token }),
  });
  return res.json();
}

// ---- Lawyers ----
export async function getLawyers() {
  const res = await fetch(`${API_URL}/lawyers.php`);
  return res.json();
}

export async function getLawyersWithAuth(token) {
  const res = await fetch(`${API_URL}/lawyers.php`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createLawyer(payload) {
  const token = payload.token || localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/lawyers.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, token }),
  });
  return res.json();
}

export async function updateLawyer(payload) {
  const token = payload.token || localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/lawyers.php`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, token }),
  });
  return res.json();
}

export async function deleteLawyer(id) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/lawyers.php`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, token }),
  });
  return res.json();
}

// ---- Site Settings ----
export async function getSiteSettings() {
  const res = await fetch(`${API_URL}/site_settings.php`, { method: "GET" });
  return res.json();
}

export async function updateSiteSettings(payload) {
  const token = payload.token || localStorage.getItem("adminToken");
  const res = await fetch(`${API_URL}/site_settings.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, token }),
  });
  return res.json();
}

// ---- Consultations ----
export async function submitConsultation(payload) {
  const res = await fetch(`${API_URL}/consultations.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getConsultations(token) {
  const url = `${API_URL}/consultations.php?token=${encodeURIComponent(token)}&_=${Date.now()}`;
  const res = await fetch(url);
  return res.json();
}

export async function updateConsultationStatus(id, status, token) {
  const res = await fetch(`${API_URL}/consultations.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, status, token }),
  });
  return res.json();
}

export async function deleteConsultation(id, token) {
  const res = await fetch(`${API_URL}/consultations.php`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, token }),
  });
  return res.json();
}

// ---- Fetch all public content (for homepage) ----
export async function fetchAllContent() {
  const [lawyersRes, practiceRes, pubRes, logosRes, journalsRes, insightsRes, articlesRes, aboutRes, whyChooseRes, feesRes, heroRes, heroBannersRes, featuresRes, settingsRes] = await Promise.all([
    fetch(`${API_URL}/lawyers.php`),
    fetch(`${API_URL}/content_api.php?type=practice_areas`),
    fetch(`${API_URL}/content_api.php?type=publications`),
    fetch(`${API_URL}/content_api.php?type=client_logos`),
    fetch(`${API_URL}/content_api.php?type=journals`),
    fetch(`${API_URL}/content_api.php?type=insights`),
    fetch(`${API_URL}/content_api.php?type=articles`),
    fetch(`${API_URL}/content_api.php?type=about_content`),
    fetch(`${API_URL}/content_api.php?type=why_choose_us`),
    fetch(`${API_URL}/content_api.php?type=consultation_fees`),
    fetch(`${API_URL}/content_api.php?type=hero_content`),
    fetch(`${API_URL}/content_api.php?type=hero_banners`),
    fetch(`${API_URL}/content_api.php?type=feature_strips`),
    fetch(`${API_URL}/site_settings.php`),
  ]);

  const [lawyersData, practiceData, pubData, logosData, journalsData, insightsData, articlesData, aboutData, whyChooseData, feesData, heroData, heroBannersData, featuresData, settingsData] = await Promise.all([
    lawyersRes.json(),
    practiceRes.json(),
    pubRes.json(),
    logosRes.json(),
    journalsRes.json(),
    insightsRes.json(),
    articlesRes.json(),
    aboutRes.json(),
    whyChooseRes.json(),
    feesRes.json(),
    heroRes.json(),
    heroBannersRes.json(),
    featuresRes.json(),
    settingsRes.json(),
  ]);

  return {
    lawyers: lawyersData,
    practiceAreas: practiceData,
    publications: pubData,
    clientLogos: logosData,
    journals: journalsData,
    insights: insightsData,
    articles: articlesData,
    aboutContent: aboutData,
    whyChooseContent: whyChooseData,
    consultationFeesContent: feesData,
    heroContent: heroData,
    heroBanners: heroBannersData,
    featureStrips: featuresData,
    siteSettings: settingsData,
  };
}

// ---- Upload ----
export async function uploadImage(file) {
  const token = localStorage.getItem("adminToken");
  const fd = new FormData();
  fd.append("image", file);
  fd.append("token", token);

  const res = await fetch(`${API_URL}/upload.php`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || `Upload failed (${res.status})`);
  }
  return data.data?.url;
}
