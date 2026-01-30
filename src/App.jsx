import React, { useState, useEffect } from "react";
import { API_URL } from "./config.js";
import LawyersPage from "./LawyersPage.jsx";
import { DUMMY_LAWYERS } from "./dummyLawyers.js";
import { DUMMY_PRACTICE_AREAS } from "./dummyPracticeAreas.js";
import { DUMMY_PUBLICATIONS } from "./dummyPublications.js";
import { DUMMY_INSIGHTS } from "./dummyInsights.js";

export default function App({ navigate, route }) {
  const [lawyers, setLawyers] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [publications, setPublications] = useState([]);
  const [clientLogos, setClientLogos] = useState([]);
  const [journals, setJournals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [heroBanners, setHeroBanners] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroBgLayer, setHeroBgLayer] = useState({ a: "", b: "", showA: true });
  const [featureStrips, setFeatureStrips] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const [consultForm, setConsultForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    hour: "01",
    minute: "00",
    about: "",
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultResult, setConsultResult] = useState("");

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Live update: when admin saves content in another tab, refresh homepage data
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === "siteContentUpdatedAt") {
        fetchAllContent();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const go = (to) => {
    if (typeof navigate === "function") navigate(to);
    else window.location.assign(to);
  };

  const routePath = String(route || window.location.pathname || "/").toLowerCase();
  const isLawyersRoute = routePath === "/lawyers" || routePath.startsWith("/lawyers/");

  const applyFavicon = (href) => {
    if (typeof document === "undefined") return;
    if (!href) return;
    let link =
      document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]') ||
      document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    const lower = String(href).toLowerCase();
    if (lower.endsWith(".ico")) link.setAttribute("type", "image/x-icon");
    else if (lower.endsWith(".svg")) link.setAttribute("type", "image/svg+xml");
    else link.removeAttribute("type");
    link.setAttribute("href", href);

    // also update OG/Twitter image to match if they exist
    const og = document.querySelector('meta[property="og:image"]');
    if (og) og.setAttribute("content", href);
    const tw = document.querySelector('meta[name="twitter:image"]');
    if (tw) tw.setAttribute("content", href);
  };

  useEffect(() => {
    if (!isLawyersRoute) {
      const name = siteSettings?.site_name || "US-NEPAL LEGAL SOLUTIONS";
      document.title = name;
    }
  }, [isLawyersRoute, siteSettings?.site_name]);

  useEffect(() => {
    applyFavicon(siteSettings?.favicon_url || "/favicon.svg");
  }, [siteSettings?.favicon_url]);

  const goToHomeSection = (hash) => {
    const h = hash.startsWith("#") ? hash : `#${hash}`;
    if (routePath === "/") {
      window.location.hash = h;
      return;
    }
    if (typeof navigate === "function") {
      navigate("/");
      setTimeout(() => {
        window.location.hash = h;
      }, 0);
      return;
    }
    window.location.assign(`/${h}`);
  };

  const fetchAllContent = async () => {
    try {
      // Fetch all content in parallel
      const [lawyersRes, practiceRes, pubRes, logosRes, journalsRes, insightsRes, heroRes, heroBannersRes, featuresRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/lawyers.php`),
        fetch(`${API_URL}/content_api.php?type=practice_areas`),
        fetch(`${API_URL}/content_api.php?type=publications`),
        fetch(`${API_URL}/content_api.php?type=client_logos`),
        fetch(`${API_URL}/content_api.php?type=journals`),
        fetch(`${API_URL}/content_api.php?type=insights`),
        fetch(`${API_URL}/content_api.php?type=hero_content`),
        fetch(`${API_URL}/content_api.php?type=hero_banners`),
        fetch(`${API_URL}/content_api.php?type=feature_strips`),
        fetch(`${API_URL}/site_settings.php`),
      ]);

      const [lawyersData, practiceData, pubData, logosData, journalsData, insightsData, heroData, heroBannersData, featuresData, settingsData] = await Promise.all([
        lawyersRes.json(),
        practiceRes.json(),
        pubRes.json(),
        logosRes.json(),
        journalsRes.json(),
        insightsRes.json(),
        heroRes.json(),
        heroBannersRes.json(),
        featuresRes.json(),
        settingsRes.json(),
      ]);

      if (lawyersData.success) setLawyers(lawyersData.data || []);
      if (practiceData.success) setPracticeAreas(practiceData.data || []);
      if (pubData.success) setPublications(pubData.data || []);
      if (logosData.success) setClientLogos(logosData.data || []);
      if (journalsData.success) setJournals(journalsData.data || []);
      if (insightsData.success) setInsights(insightsData.data || []);
      if (heroData.success && heroData.data && heroData.data.length > 0) setHeroContent(heroData.data[0]);
      if (heroBannersData?.success) setHeroBanners(heroBannersData.data || []);
      if (featuresData.success) setFeatureStrips(featuresData.data || []);
      if (settingsData?.success) setSiteSettings(settingsData.data || {});
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  const address = siteSettings?.contact_address || "Anamnagar, Kathmandu";
  const email = siteSettings?.contact_email || "info@primelawnepal.com";
  const phone = siteSettings?.contact_phone || "+977-01-4102849";
  const siteName = siteSettings?.site_name || "US-NEPAL LEGAL SOLUTIONS";
  const tagline = siteSettings?.site_tagline || "LEGAL SOLUTIONS";
  const buildWhatsAppLink = () => {
    const direct = String(siteSettings?.whatsapp_link || "").trim();
    if (direct) return direct;

    let digits = String(siteSettings?.whatsapp_number || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
    // If admin enters local Nepali mobile number (10 digits starting 98), add country code.
    if (digits.length === 10 && digits.startsWith("98")) digits = `977${digits}`;
    return `https://wa.me/${digits}`;
  };

  const whatsappHref = buildWhatsAppLink();
  const sliderSecondsRaw = Number(heroContent?.slider_interval_seconds ?? 6);
  const sliderSeconds = Number.isFinite(sliderSecondsRaw) ? Math.max(2, sliderSecondsRaw) : 6;
  // Default hero background rendering (can be overridden per-slide)
  const heroBgFitDefault = String(siteSettings?.hero_background_fit || "cover").toLowerCase();
  const heroBgPosDefault = String(siteSettings?.hero_background_position || "center");
  // Hero banners slider: use hero_banners if present, otherwise fall back to hero_content.
  const heroContentSlide = heroContent ? { ...heroContent, id: `hero_content_${heroContent.id ?? 0}` } : null;
  const heroSlides = (heroBanners && heroBanners.length > 0 ? heroBanners : [heroContentSlide]).filter(Boolean);
  const hasSlides = heroSlides.length > 1;
  const activeHero = heroSlides[Math.min(heroIndex, heroSlides.length - 1)] || heroContent;
  const heroBgFit = String(activeHero?.background_fit || heroBgFitDefault).toLowerCase();
  const heroBgPos = String(activeHero?.background_position || heroBgPosDefault);
  const heroBg =
    activeHero?.background_image_url || siteSettings?.banner_image_url || "";

  // Use the fit chosen by admin (cover/contain). No automatic overrides.
  const heroEffectiveFit = heroBgFit === "contain" ? "contain" : "cover";

  // Crossfade hero background for a smoother slider feel
  useEffect(() => {
    const url = heroBg ? `url(${heroBg})` : "";
    if (!url) return;
    setHeroBgLayer((prev) => {
      // Initial set
      if (!prev.a && !prev.b) return { a: url, b: "", showA: true };
      if (prev.showA) return { ...prev, b: url, showA: false };
      return { ...prev, a: url, showA: true };
    });
  }, [heroBg]);

  useEffect(() => {
    // Keep index in range
    if (!hasSlides) {
      if (heroIndex !== 0) setHeroIndex(0);
      return;
    }
    if (heroIndex > heroSlides.length - 1) setHeroIndex(0);
  }, [hasSlides, heroSlides.length, heroIndex]);

  useEffect(() => {
    // Auto-rotate banners
    if (!hasSlides) return;
    const id = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, sliderSeconds * 1000);
    return () => window.clearInterval(id);
  }, [hasSlides, heroSlides.length, sliderSeconds]);

  const goPrevHero = () => {
    if (!hasSlides) return;
    setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  const goNextHero = () => {
    if (!hasSlides) return;
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  };
  const heroProgressKey = `${heroIndex}_${sliderSeconds}`;
  const lawyersForHome = lawyers && lawyers.length > 0 ? lawyers : DUMMY_LAWYERS;
  const practiceForHome =
    practiceAreas && practiceAreas.length > 0 ? practiceAreas : DUMMY_PRACTICE_AREAS;
  const publicationsForHome =
    publications && publications.length > 0 ? publications : DUMMY_PUBLICATIONS;
  const insightsForHome =
    insights && insights.length > 0 ? insights : DUMMY_INSIGHTS;
  const footerBgUrl = String(siteSettings?.footer_background_image_url || "").trim();
  const footerBgFit = String(siteSettings?.footer_background_fit || "cover").toLowerCase();
  const footerBgPos = String(siteSettings?.footer_background_position || "center");
  const footerOverlay = Number(siteSettings?.footer_overlay_opacity ?? 0.4);
  const footerStyle = footerBgUrl
    ? {
        ["--footer-bg-image"]: `url("${footerBgUrl}")`,
        ["--footer-bg-size"]: footerBgFit === "contain" ? "contain" : "cover",
        ["--footer-bg-position"]: footerBgPos,
        ["--footer-overlay"]: Number.isFinite(footerOverlay) ? String(Math.min(0.8, Math.max(0, footerOverlay))) : "0.4",
      }
    : undefined;

  const clampText = (value, max = 140) => {
    const s = String(value || "").trim();
    if (!s) return "";
    return s.length > max ? `${s.slice(0, max).trim()}…` : s;
  };

  const submitConsultation = async (e) => {
    e.preventDefault();
    setConsultResult("");

    const payload = {
      name: consultForm.name.trim(),
      email: consultForm.email.trim(),
      phone: consultForm.phone.trim(),
      date: consultForm.date || "",
      hour: consultForm.hour || "",
      minute: consultForm.minute || "",
      about: consultForm.about.trim(),
    };

    if (!payload.name || !payload.email || !payload.phone) {
      setConsultResult("Please fill Name, Email and Phone.");
      return;
    }

    try {
      setConsultSubmitting(true);
      const res = await fetch(`${API_URL}/consultations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit. Please try again.");
      }
      setConsultResult("Submitted successfully! We will contact you soon.");
      setConsultForm((p) => ({
        ...p,
        name: "",
        email: "",
        phone: "",
        date: "",
        hour: "01",
        minute: "00",
        about: "",
      }));
    } catch (err) {
      setConsultResult(err?.message || "Failed to submit. Please try again.");
    } finally {
      setConsultSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="top-bar">
        <div className="container top-bar__content">
          <div className="top-bar__info">
            <span>{address}</span>
            <span>{email}</span>
          </div>
          <div className="top-bar__actions">
            <span className="pill">{phone}</span>
            <a
              className="button button--outline"
              href="/login"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                // SPA navigation when available
                if (typeof navigate === "function") {
                  e.preventDefault();
                  go("/login");
                }
              }}
            >
              Login
            </a>
            <a
              className="button button--outline"
              href="/admin"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                // SPA navigation when available
                if (typeof navigate === "function") {
                  e.preventDefault();
                  go("/admin");
                }
              }}
            >
              Admin
            </a>
            <a
              className="button button--outline"
              href={whatsappHref || "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!whatsappHref) {
                  e.preventDefault();
                  alert("WhatsApp link is not set yet. Please set it in Admin → Site Settings.");
                }
              }}
            >
              Book Appointment Whatsapp
            </a>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container header__content">
          <div className="logo">
            <a
              href="/"
              onClick={(e) => {
                // Always go to homepage and refresh (even if we're already on "/")
                e.preventDefault();
                try {
                  const isHome =
                    window.location.pathname === "/" &&
                    window.location.search === "" &&
                    window.location.hash === "";
                  if (isHome) window.location.reload();
                  else window.location.assign("/");
                } catch {
                  window.location.assign("/");
                }
              }}
              style={{ textDecoration: "none", color: "inherit", display: "inline-flex", flexDirection: "column" }}
              aria-label="Go to homepage"
            >
              {siteSettings?.header_logo_url ? (
                <img
                  src={siteSettings.header_logo_url}
                  alt={siteName}
                  loading="lazy"
                  style={{ height: 44, width: "auto", objectFit: "contain" }}
                />
              ) : (
                <>
                  <span className="logo__mark">
                    <span className="logo__us">US-</span>
                    <span className="logo__nepal">NEPAL</span>
                  </span>
                  <span className="logo__sub">{tagline}</span>
                </>
              )}
            </a>
          </div>
          <nav className="nav">
            <a
              href="/#home"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("home");
              }}
            >
              Home
            </a>
            <a
              href="/#about"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("about");
              }}
            >
              About
            </a>
            <a
              href="/#practice"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("practice");
              }}
            >
              Practice Areas
            </a>
            <a
              href="/lawyers"
              onClick={(e) => {
                // SPA navigation when available
                if (typeof navigate === "function") {
                  e.preventDefault();
                  go("/lawyers");
                }
              }}
            >
              Lawyers
            </a>
            <a
              href="/#articles"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("articles");
              }}
            >
              Articles
            </a>
            <a
              href="/#contact"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("contact");
              }}
            >
              Contact
            </a>
          </nav>
        </div>
      </header>
      <main>
        {isLawyersRoute ? (
          <LawyersPage navigate={navigate} route={routePath} />
        ) : (
          <>
            <section
              className="hero"
              id="home"
            >
              {heroEffectiveFit === "contain" ? (
                <div
                  className="hero__bg hero__bg--blur"
                  aria-hidden="true"
                  style={{
                    backgroundImage: heroBgLayer.showA ? heroBgLayer.a : heroBgLayer.b,
                    backgroundSize: "cover",
                    backgroundPosition: heroBgPos,
                    backgroundRepeat: "no-repeat",
                    opacity: 1,
                  }}
                />
              ) : null}
              <div
                className="hero__bg"
                aria-hidden="true"
                style={{
                  backgroundImage: heroBgLayer.a,
                  backgroundSize: heroEffectiveFit === "contain" ? "contain" : "cover",
                  backgroundPosition: heroBgPos,
                  backgroundRepeat: "no-repeat",
                  opacity: heroBgLayer.showA ? 1 : 0,
                }}
              />
              <div
                className="hero__bg"
                aria-hidden="true"
                style={{
                  backgroundImage: heroBgLayer.b,
                  backgroundSize: heroEffectiveFit === "contain" ? "contain" : "cover",
                  backgroundPosition: heroBgPos,
                  backgroundRepeat: "no-repeat",
                  opacity: heroBgLayer.showA ? 0 : 1,
                }}
              />
              <div className="hero__overlay"></div>
              <div key={heroIndex} className="container hero__content hero__content--animate">
                <p className="hero__eyebrow">{activeHero?.eyebrow_text || "Experience Matters"}</p>
                <h1>
                  {activeHero?.main_title ? activeHero.main_title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < activeHero.main_title.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  )) : (
                    <>
                      Serving with 100 Years
                      <br />
                      of Combined Expertise
                    </>
                  )}
                </h1>
                <p className="hero__text">
                  {activeHero?.description || "Our lawyers offer clients a range of integrated global capabilities. It includes some of the world's most active Commercial Law, Corporate Law, Aviation Law, Banking & Finance Law and Corporate Litigation."}
                </p>
                {activeHero?.button_link ? (
                  <button
                    className="button button--primary"
                    type="button"
                    onClick={() => {
                      const link = String(activeHero.button_link || "");
                      if (link.startsWith("/")) go(link);
                      else if (link.startsWith("#")) goToHomeSection(link);
                      else window.open(link, "_blank");
                    }}
                  >
                    {activeHero?.button_text || "Learn more →"}
                  </button>
                ) : (
                  <button className="button button--primary" type="button">
                    {activeHero?.button_text || "WHY CLIENTS CHOOSE US? →"}
                  </button>
                )}
              </div>
              {hasSlides ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={goPrevHero}
                    className="hero__arrow hero__arrow--left"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    onClick={goNextHero}
                    className="hero__arrow hero__arrow--right"
                  >
                    ›
                  </button>

                  <div className="hero__nav" aria-label="Slides">
                    <div className="hero__dotsRow">
                      {heroSlides.map((s, idx) => (
                        <button
                          key={String(s?.id ?? idx)}
                          type="button"
                          onClick={() => setHeroIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          aria-current={idx === heroIndex ? "true" : "false"}
                          className={`hero__dot ${idx === heroIndex ? "is-active" : ""}`}
                        />
                      ))}
                    </div>
                    <div className="hero__progress" aria-hidden="true">
                      <div
                        key={heroProgressKey}
                        className="hero__progressFill"
                        style={{ animationDuration: `${Math.max(2, sliderSeconds)}s` }}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </section>

            <section className="feature-strip">
              <div className="container feature-strip__grid">
                {featureStrips.length > 0 ? (
                  featureStrips.map((feature, index) => (
                    <div key={feature.id} className={`feature-card ${index === 1 ? 'feature-card--dark' : ''}`}>
                      <h3>{feature.title}</h3>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="feature-card">
                      <h3>Leading Law Firm in Nepal providing complete Legal Solutions</h3>
                    </div>
                    <div className="feature-card feature-card--dark">
                      <h3>US-NEPAL LEGAL SOLUTIONS | Law Firm in Nepal | Lawyers in Nepal</h3>
                    </div>
                    <div className="feature-card">
                      <h3>Team of Recognized Lawyers with 100 Years of Experience</h3>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section id="practice" className="bg-white py-14">
              <div className="mx-auto w-[min(1100px,92%)]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                    Our Areas of Practice
                  </h2>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => goToHomeSection("practice")}
                      className="inline-flex items-center justify-center gap-2 rounded border border-brand-700 px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      Find Practice Area <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>

                <div className="mt-12">
                  {loading ? (
                    <p className="text-center text-sm text-neutral-600">
                      Loading practice areas...
                    </p>
                  ) : (
                    <div className="grid gap-y-12 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                      {practiceForHome.map((item) => (
                        <article
                          key={item.id}
                          className="mx-auto flex w-full max-w-[320px] flex-col items-center text-center"
                        >
                          <div className="mb-4 flex h-12 w-12 items-center justify-center text-brand-700">
                            {item.icon_url ? (
                              <img
                                src={item.icon_url}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10">
                                <path
                                  d="M12 2 20 6v6c0 5-3.6 9.4-8 10-4.4-.6-8-5-8-10V6l8-4Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M9 12h6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-neutral-900">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs leading-5 text-neutral-700">
                            {item.text}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

      <section id="publications" className="bg-white py-14">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              Recent Publication
            </h2>
          </div>

          <div className="mt-10">
            {loading ? (
              <p className="text-center text-sm text-neutral-600">Loading publications...</p>
            ) : publicationsForHome.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {publicationsForHome.slice(0, 3).map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="aspect-[16/9] w-full bg-neutral-100">
                      <img
                        src={item.image_url || "https://via.placeholder.com/1200x675?text=Publication"}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold leading-snug text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-neutral-700">
                        {clampText(item.text, 160)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-neutral-600">No publications available</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto w-[min(1100px,92%)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              Experienced Lawyers in Nepal
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
              US-NEPAL LEGAL SOLUTIONS is renowned for its lawyers in Nepal with decades of
              experience on corporate &amp; litigation sector. Our lawyers are associated with
              the Bar Associations of the Supreme Court, High Court &amp; District Courts of Nepal.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => go("/lawyers")}
                className="inline-flex items-center justify-center gap-2 rounded border border-brand-700 px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                View our Lawyers <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="mt-10">
            {loading ? (
              <p className="text-center text-sm text-neutral-600">Loading lawyers...</p>
            ) : lawyersForHome.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {lawyersForHome.slice(0, 4).map((lawyer) => (
                  <article key={lawyer.id} className="mx-auto w-full max-w-[320px]">
                    <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                      <img
                        src={lawyer.image_url || "https://via.placeholder.com/600x600?text=No+Image"}
                        alt={lawyer.name}
                        loading="lazy"
                        className="h-full w-full"
                        style={{
                          objectFit: String(lawyer?.image_fit || "").toLowerCase() === "contain" ? "contain" : "cover",
                          objectPosition: String(lawyer?.image_position || "50% 25%"),
                        }}
                      />
                    </div>
                    <h3 className="mt-4 font-serif text-base font-semibold text-neutral-900">
                      {lawyer.name}
                    </h3>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-900">
                      {lawyer.role}
                    </p>
                    {lawyer.focus ? (
                      <p className="mt-3 text-xs leading-5 text-neutral-700">{lawyer.focus}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-neutral-600">No lawyers available</p>
            )}
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="container">
          <h2 className="center">Why Clients Choose Us?</h2>
          <p className="center muted-text">
            US-NEPAL LEGAL SOLUTIONS boasts the best lawyers in Nepal, serving an
            extensive roster of corporate clients across specialized sectors
            including Energy, Banking, Insurance, Aviation, Capital Markets, and
            Infrastructure Law.
          </p>
          <div className="logo-slider">
            <button className="slider-arrow" aria-label="Previous logos">
              ‹
            </button>
            <div className="logo-track">
              {loading ? (
                <p style={{ textAlign: "center", color: "#5a6b5f" }}>Loading client logos...</p>
              ) : clientLogos.length > 0 ? (
                clientLogos.map((logo) => (
                  <div key={logo.id} className="logo-card">
                    <img src={logo.image_url} alt={logo.name} />
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#5a6b5f" }}>No client logos available</p>
              )}
            </div>
            <button className="slider-arrow" aria-label="Next logos">
              ›
            </button>
          </div>
          <div className="slider-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="container two-column">
          <div>
            <h3>Thought Leaders of the Country's Legal Sector</h3>
            <p>
              US-NEPAL LEGAL SOLUTIONS prides itself on its dedication to Legal
              Research. The Firm is recognized as being innovative, modern and
              maintaining international standard of communication & quality. We
              have a dedicated Research Team for developing innovative insights
              into our Legal Sector.
            </p>
          </div>
          <div>
            <h3>Empowering Nepali Communities: Pro-Bono & Legal Aid</h3>
            <p>
              US-NEPAL LEGAL SOLUTIONS in Nepal offers vital legal services to those
              who cannot afford private attorneys. Our team of lawyers provides
              free or low-cost legal assistance to disadvantaged individuals and
              communities across the country.
            </p>
            <p>
              We help clients navigate complex legal issues in areas like family
              law, property disputes, criminal defense, and human rights. Our
              attorneys offer guidance on legal processes, represent clients in
              court, and work to protect their rights and interests.
            </p>
          </div>
        </div>
        <div className="container">
          <h2 className="center">OUR JOURNALS</h2>
          <div className="grid three journals">
            {loading ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#5a6b5f" }}>Loading journals...</p>
            ) : journals.length > 0 ? (
              journals.map((item) => (
                <div key={item.id} className="card card--image">
                  <img src={item.image_url || "https://via.placeholder.com/300x200"} alt={item.title} />
                  <div className="card__body">
                    <h4>{item.title}</h4>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#5a6b5f" }}>No journals available</p>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white">
        <div className="mx-auto w-[min(1200px,100%)] lg:px-[4%]">
          <div className="grid overflow-hidden lg:grid-cols-2 lg:rounded-2xl lg:border lg:border-neutral-200">
          {/* Left: Consultation form */}
          <div className="bg-brand-800 px-6 py-10 text-white sm:px-10 lg:px-10 lg:py-12">
            <div className="mx-auto w-full max-w-[560px]">
              <h3 className="font-serif text-lg font-bold">
                Request a Consultation with the Leading Law Firm in Nepal
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/90">
                Contacting the firm is free. We understand that the disputes facing you, your family
                or your business can seem daunting. We pride ourselves in dispensing effective &amp;
                solution oriented Law Service in Nepal.
              </p>

              <form className="mt-6 space-y-4" onSubmit={submitConsultation}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Name of Individual or Organization</label>
                  <input
                    type="text"
                    placeholder="Name of Individual or Organization"
                    value={consultForm.name}
                    onChange={(e) => setConsultForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Email Address</label>
                    <input
                      type="email"
                      placeholder={`Eg: ${email}`}
                      value={consultForm.email}
                      onChange={(e) => setConsultForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Phone</label>
                    <input
                      type="tel"
                      placeholder="E.g. +977 9800000000"
                      value={consultForm.phone}
                      onChange={(e) => setConsultForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-xs font-semibold">Date</label>
                    <input
                      type="date"
                      value={consultForm.date}
                      onChange={(e) => setConsultForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-xs font-semibold">Hours</label>
                    <select
                      value={consultForm.hour}
                      onChange={(e) => setConsultForm((p) => ({ ...p, hour: e.target.value }))}
                      className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-xs font-semibold">Minutes</label>
                    <select
                      value={consultForm.minute}
                      onChange={(e) => setConsultForm((p) => ({ ...p, minute: e.target.value }))}
                      className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                    >
                      {["00", "15", "30", "45"].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">What is the Appointment About?</label>
                  <input
                    type="text"
                    placeholder="Describe in Brief"
                    value={consultForm.about}
                    onChange={(e) => setConsultForm((p) => ({ ...p, about: e.target.value }))}
                    className="w-full rounded-md border border-white/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-4 focus:ring-white/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={consultSubmitting}
                  className="mt-2 inline-flex rounded-md bg-brand-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {consultSubmitting ? "Sending..." : "Send Message"}
                </button>

                {consultResult ? (
                  <div className="text-sm text-white/90">{consultResult}</div>
                ) : null}
              </form>
            </div>
          </div>

          {/* Right: Insights */}
          <div id="articles" className="px-6 py-10 sm:px-10 lg:px-10 lg:py-12">
            <div className="mx-auto w-full max-w-[560px] text-center">
              <h3 className="text-lg font-bold text-neutral-900">
                Practical Insights &amp; Articles on the Legal Regime of Nepal
              </h3>
            </div>

            <div className="mx-auto mt-8 w-full max-w-[560px] space-y-10">
              {loading ? (
                <p className="text-center text-sm text-neutral-600">Loading insights...</p>
              ) : insightsForHome.length > 0 ? (
                insightsForHome.slice(0, 3).map((item) => (
                  <article key={item.id} className="text-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="mx-auto h-auto w-[220px] rounded-md border border-neutral-200 object-cover"
                      />
                    ) : null}
                    <h4 className="mt-4 text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="mx-auto mt-2 max-w-[520px] text-xs leading-6 text-neutral-700">
                      {clampText(item.text, 260)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-center text-sm text-neutral-600">No insights available</p>
              )}
            </div>
          </div>
          </div>
        </div>
      </section>

          </>
        )}
      </main>

      <footer className="footer" style={footerStyle}>
        <div className="container footer__grid">
          <div className="footer__brand">
            <div className="logo logo--light">
              {siteSettings?.footer_logo_url || siteSettings?.header_logo_url ? (
                <img
                  src={siteSettings.footer_logo_url || siteSettings.header_logo_url}
                  alt={siteName}
                  loading="lazy"
                  style={{ height: 44, width: "auto", objectFit: "contain" }}
                />
              ) : (
                <>
                  <span className="logo__mark">
                    <span className="logo__us">US-</span>
                    <span className="logo__nepal">NEPAL</span>
                  </span>
                  <span className="logo__sub">{tagline}</span>
                </>
              )}
            </div>
            <p>
              Head Office {address}
              <br />
              {email}
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Areas of Practice</li>
              <li>Lawyers</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4>Lawyers</h4>
            <ul>
              <li>Pradeep Thapa</li>
              <li>Kedar Pyakurel</li>
              <li>Muktinath Acharya</li>
              <li>Amit Kerna</li>
              <li>Deepak Khanal</li>
              <li>Sudeep Pradhan</li>
            </ul>
          </div>
          <div>
            <h4>Area of Practice</h4>
            <ul>
              <li>ADR</li>
              <li>Aviation Law</li>
              <li>Company Law</li>
              <li>Due Diligence</li>
              <li>Hydropower Law</li>
              <li>Foreign Direct Investment</li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li>Construction</li>
              <li>Hospitality</li>
              <li>Education</li>
              <li>Health</li>
              <li>Travel & Tourism</li>
            </ul>
          </div>
        </div>
        <div className="container footer__bottom">
          <span>© 2024 US-NEPAL LEGAL SOLUTIONS. All rights reserved.</span>
          <button className="button button--outline button--light">
            Get In Touch
          </button>
        </div>
      </footer>

      {whatsappHref ? (
        <div className="whatsapp">
          <span className="whatsapp__bubble">How can we help you?</span>
          <a
            className="whatsapp__button"
            aria-label="WhatsApp"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            W
          </a>
        </div>
      ) : null}
    </div>
  );
}
