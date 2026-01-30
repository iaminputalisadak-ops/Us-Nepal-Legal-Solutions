import React from "react";
import ContentManager from "./ContentManager.jsx";

export default function HeroSectionManager({ token }) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-brand-700">Hero Section</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Add multiple hero banners here. They will display sequentially on the homepage.
          Updates you make will reflect on the homepage automatically.
        </p>
      </div>

      {/* Global hero settings + fallback hero (used if no banners exist) */}
      <ContentManager contentType="hero_content" token={token} />

      {/* The actual rotating banners */}
      <ContentManager contentType="hero_banners" token={token} />
    </section>
  );
}

