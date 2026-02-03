import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "./config.js";
import ImageField from "./ImageField.jsx";

const DEFAULTS = {
  site_name: "US-NEPAL LEGAL SOLUTIONS",
  site_tagline: "LEGAL SOLUTIONS",
  favicon_url: "/favicon.svg",
  header_logo_url: "",
  footer_logo_url: "",
  footer_background_image_url: "",
  footer_background_fit: "cover", // cover | contain
  footer_background_position: "center", // e.g. "center", "top", "50% 30%"
  footer_overlay_opacity: "0.40", // 0.00 - 0.80
  banner_image_url: "",
  // Hero background rendering
  hero_background_fit: "cover", // cover | contain
  hero_background_position: "center", // e.g. "center", "top", "50% 30%"
  contact_email: "info@usnepallegalsolutions.com",
  contact_phone: "+977-01-4685468",
  contact_address: "Annamnagar, Nepal",
  whatsapp_number: "",
  whatsapp_link: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  linkedin_url: "",
  youtube_url: "",
};

export default function SiteSettingsManager({ token: tokenProp }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = tokenProp || localStorage.getItem("adminToken") || "";

  const merged = useMemo(() => {
    return { ...DEFAULTS, ...(settings || {}) };
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/site_settings.php`, { method: "GET" });
        const data = await res.json().catch(() => null);
        if (!cancelled && data?.success && data?.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key, value) => {
    setSettings((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const handleSave = async () => {
    if (!token) {
      alert("Not logged in. Please logout and login again.");
      return;
    }
    try {
      setSaving(true);
      const url = `${API_URL}/site_settings.php`;
      const payload = JSON.stringify({ token, settings: merged });

      // Some local PHP/Apache setups (esp. XAMPP) can reject PUT requests.
      // The backend supports both POST and PUT, so we prefer POST for reliability.
      const attempt = async (method) => {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        });
        const data = await res.json().catch(() => null);
        return { res, data };
      };

      let { res, data } = await attempt("POST");

      // Fallback: if POST is blocked for some reason, try PUT.
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        ({ res, data } = await attempt("PUT"));
      }

      if (!res.ok || !data?.success) throw new Error(data?.message || `Save failed (${res.status})`);
      alert("Site settings saved successfully!");
    } catch (err) {
      alert(err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Loading site settings…
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-700">Site Settings</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Update your public website branding and contact details. Changes apply immediately.
            (Favicons can be cached—hard refresh if you don’t see updates.)
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-900">Branding</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">Site Name</label>
            <input
              type="text"
              value={merged.site_name}
              onChange={(e) => setField("site_name", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">Tagline</label>
            <input
              type="text"
              value={merged.site_tagline}
              onChange={(e) => setField("site_tagline", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ImageField
            label="Favicon (browser icon)"
            value={merged.favicon_url}
            onChange={(url) => setField("favicon_url", url)}
            helpText="Upload a favicon (ICO/SVG/PNG) or paste a URL. Example: /api/uploads/xxx.ico"
            token={token}
          />
          <ImageField
            label="Header Logo (optional)"
            value={merged.header_logo_url}
            onChange={(url) => setField("header_logo_url", url)}
            helpText="If empty, the text logo will be used."
            token={token}
          />
          <ImageField
            label="Footer Logo (optional)"
            value={merged.footer_logo_url}
            onChange={(url) => setField("footer_logo_url", url)}
            helpText="If empty, the header logo (or text logo) will be used. Recommended: SVG/PNG with transparent background, ~400×120px (or similar wide logo)."
            token={token}
          />
          <ImageField
            label="Footer Background Image (optional)"
            value={merged.footer_background_image_url}
            onChange={(url) => setField("footer_background_image_url", url)}
            helpText="Supported: JPG/PNG/WebP. Max upload: 6MB. Recommended: 1920×700–900 (or larger). Minimum: 1600×600. Note: the footer uses background-size: cover, so the image will be cropped to fit."
            token={token}
            recommendedWidth={1920}
            recommendedHeight={700}
            minWidth={1600}
            minHeight={600}
          />
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 md:col-span-2">
            <h4 className="text-sm font-bold text-neutral-900">Footer Background Options</h4>
            <p className="mt-1 text-sm text-neutral-600">
              Adjust how the footer background image fits and how dark the overlay is.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">Fit</label>
                <select
                  value={String(merged.footer_background_fit || "cover")}
                  onChange={(e) => setField("footer_background_fit", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                >
                  <option value="cover">Cover (fills footer, crops edges)</option>
                  <option value="contain">Contain (shows full image)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">Position</label>
                <input
                  type="text"
                  value={String(merged.footer_background_position || "center")}
                  onChange={(e) => setField("footer_background_position", e.target.value)}
                  placeholder='Examples: "center", "top", "bottom", "50% 30%"'
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    ["center", "Center"],
                    ["top", "Top"],
                    ["bottom", "Bottom"],
                    ["left", "Left"],
                    ["right", "Right"],
                    ["center top", "Center Top"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setField("footer_background_position", v)}
                      className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-neutral-800">Overlay darkness</label>
                <div className="text-sm font-bold text-brand-700">
                  {Math.round(Number(merged.footer_overlay_opacity || 0.4) * 100)}%
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={Number(merged.footer_overlay_opacity || 0.4)}
                onChange={(e) => setField("footer_overlay_opacity", e.target.value)}
                className="w-full accent-brand-700"
              />
              <p className="text-xs text-neutral-600">
                Higher values make the footer text easier to read on busy images.
              </p>
            </div>
          </div>
          <ImageField
            label="Banner Image (optional)"
            value={merged.banner_image_url}
            onChange={(url) => setField("banner_image_url", url)}
            helpText="Optional site-wide banner/hero fallback image."
            token={token}
          />
        </div>

        <div className="mt-4 rounded-xl bg-neutral-50 p-4">
          <h4 className="text-sm font-bold text-neutral-900">Hero Image Fit</h4>
          <p className="mt-1 text-sm text-neutral-600">
            Control how the hero background image scales and where it focuses on screen.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-800">Fit</label>
              <select
                value={String(merged.hero_background_fit || "cover")}
                onChange={(e) => setField("hero_background_fit", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              >
                <option value="cover">Cover (fills screen, crops edges)</option>
                <option value="contain">Contain (shows full image, may add empty space)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-800">Position</label>
              <input
                type="text"
                value={String(merged.hero_background_position || "center")}
                onChange={(e) => setField("hero_background_position", e.target.value)}
                placeholder='Examples: "center", "top", "bottom", "50% 30%"'
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  ["center", "Center"],
                  ["top", "Top"],
                  ["bottom", "Bottom"],
                  ["left", "Left"],
                  ["right", "Right"],
                  ["center top", "Center Top"],
                ].map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setField("hero_background_position", v)}
                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-900">Contact</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">Email</label>
            <input
              type="email"
              value={merged.contact_email}
              onChange={(e) => setField("contact_email", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">Phone</label>
            <input
              type="text"
              value={merged.contact_phone}
              onChange={(e) => setField("contact_phone", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-800">Address</label>
            <input
              type="text"
              value={merged.contact_address}
              onChange={(e) => setField("contact_address", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>

        <p className="mt-2 text-sm text-neutral-600">
          WhatsApp number or link is used for the WhatsApp icon below &quot;Send Message&quot; on the contact form.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">WhatsApp Number (optional)</label>
            <input
              type="text"
              value={merged.whatsapp_number}
              onChange={(e) => setField("whatsapp_number", e.target.value)}
              placeholder="e.g., +9779800000000"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">WhatsApp Link (optional)</label>
            <input
              type="text"
              value={merged.whatsapp_link}
              onChange={(e) => setField("whatsapp_link", e.target.value)}
              placeholder="e.g., https://wa.me/9779800000000"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-900">Social Links (optional)</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Add profile links for Instagram, Facebook, WhatsApp &amp; TikTok. These appear as icons below &quot;Send Message&quot; on the contact form. Paste full URLs (e.g. https://facebook.com/yourpage).
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ["facebook_url", "Facebook URL"],
            ["instagram_url", "Instagram URL"],
            ["whatsapp_link", "WhatsApp URL"],
            ["tiktok_url", "TikTok URL"],
            ["linkedin_url", "LinkedIn URL"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-800">{label}</label>
              <input
                type="text"
                value={merged[key] || ""}
                onChange={(e) => setField(key, e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

