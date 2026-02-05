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
  const [articles, setArticles] = useState([]);
  const [clientLogos, setClientLogos] = useState([]);
  const [journals, setJournals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [aboutContent, setAboutContent] = useState([]);
  const [whyChooseContent, setWhyChooseContent] = useState([]);
  const [consultationFeesContent, setConsultationFeesContent] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [heroBanners, setHeroBanners] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroBgLayer, setHeroBgLayer] = useState({ a: "", b: "", showA: true });
  const [featureStrips, setFeatureStrips] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [lawyersSlide, setLawyersSlide] = useState(0);
  const [lawyersPerView, setLawyersPerView] = useState(4);
  const [logosSlide, setLogosSlide] = useState(0);
  const [logosPerView, setLogosPerView] = useState(4);

  const [consultForm, setConsultForm] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultResult, setConsultResult] = useState("");

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Lawyers slider: responsive items per view
  useEffect(() => {
    const compute = () => {
      const w = Number(window?.innerWidth || 1200);
      const next = w < 640 ? 1 : w < 900 ? 2 : w < 1200 ? 3 : 4;
      setLawyersPerView(next);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Client logos slider: responsive items per view
  useEffect(() => {
    const compute = () => {
      const w = Number(window?.innerWidth || 1200);
      const next = w < 640 ? 2 : w < 900 ? 3 : w < 1200 ? 4 : 5;
      setLogosPerView(next);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
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
  const isAboutRoute = routePath === "/about";

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

  const seoTitleBase = siteSettings?.seo_title || siteSettings?.site_name || "US-NEPAL LEGAL SOLUTIONS";
  useEffect(() => {
    if (isLawyersRoute) {
      document.title = `Lawyers | ${seoTitleBase}`;
      return;
    }
    if (seoTitleBase) {
      document.title = seoTitleBase;
    }
  }, [isLawyersRoute, seoTitleBase]);

  useEffect(() => {
    applyFavicon(siteSettings?.favicon_url || "/favicon.svg");
  }, [siteSettings?.favicon_url]);

  useEffect(() => {
    const upsertMeta = (attr, key, content) => {
      if (!content) return;
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const upsertLink = (rel, href) => {
      if (!href) return;
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    const title = seoTitleBase;
    const description =
      siteSettings?.seo_description ||
      "US-NEPAL LEGAL SOLUTIONS provides trusted legal services in Nepal across corporate, litigation, and advisory matters.";
    const keywords = siteSettings?.seo_keywords || "law firm Nepal, corporate law, litigation, legal services";
    const canonical = siteSettings?.seo_canonical || window.location.href;
    const ogImage = siteSettings?.seo_og_image || siteSettings?.header_logo_url || "/favicon.svg";
    const siteName = siteSettings?.site_name || "US-NEPAL LEGAL SOLUTIONS";

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", "index,follow");
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", siteName);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);
    upsertLink("canonical", canonical);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: siteName,
      url: canonical,
      logo: ogImage,
      telephone: siteSettings?.contact_phone || "",
      email: siteSettings?.contact_email || "",
      address: siteSettings?.contact_address
        ? {
            "@type": "PostalAddress",
            streetAddress: siteSettings.contact_address,
          }
        : undefined,
    };
    let script = document.getElementById("site-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "site-jsonld";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [
    seoTitleBase,
    siteSettings?.seo_description,
    siteSettings?.seo_keywords,
    siteSettings?.seo_canonical,
    siteSettings?.seo_og_image,
    siteSettings?.site_name,
    siteSettings?.header_logo_url,
    siteSettings?.contact_phone,
    siteSettings?.contact_email,
    siteSettings?.contact_address,
  ]);

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

      if (lawyersData.success) setLawyers(lawyersData.data || []);
      if (practiceData.success) setPracticeAreas(practiceData.data || []);
      if (pubData.success) setPublications(pubData.data || []);
      if (logosData.success) setClientLogos(logosData.data || []);
      if (journalsData.success) setJournals(journalsData.data || []);
      if (insightsData.success) setInsights(insightsData.data || []);
      if (articlesData.success) setArticles(articlesData.data || []);
      if (aboutData.success) setAboutContent(aboutData.data || []);
      if (whyChooseData.success) setWhyChooseContent(whyChooseData.data || []);
      if (feesData.success) setConsultationFeesContent(feesData.data || []);
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
  const email = siteSettings?.contact_email || "info@usnepallegalsolutions.com";
  const phone = siteSettings?.contact_phone || "+1 (785) 506-3402";
  const siteName = siteSettings?.site_name || "US-NEPAL LEGAL SOLUTIONS";
  const tagline = siteSettings?.site_tagline || "LEGAL SOLUTIONS";
  const buildWhatsAppLink = () => {
    const direct = String(siteSettings?.whatsapp_link || "").trim();
    const number = String(siteSettings?.whatsapp_number || "").trim();
    const normalizeDigits = (value) => {
      let digits = String(value || "").replace(/[^\d]/g, "");
      if (!digits) return "";
      if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
      // If admin enters local Nepali mobile number (10 digits starting 98), add country code.
      if (digits.length === 10 && digits.startsWith("98")) digits = `977${digits}`;
      return digits;
    };

    if (direct) {
      const lower = direct.toLowerCase();
      const directDigits = normalizeDigits(direct);
      // If a full URL is provided, use it.
      if (direct.startsWith("http://") || direct.startsWith("https://")) return direct;
      // If user pasted a wa.me link without protocol.
      if (lower.startsWith("wa.me/") || lower.startsWith("api.whatsapp.com/") || lower.startsWith("www.whatsapp.com/")) {
        return `https://${direct}`;
      }
      // If a phone number was pasted into the URL field.
      if (directDigits) return `https://wa.me/${directDigits}`;
      // If the direct link is the generic WhatsApp download page, fall back to number.
      if (lower.includes("whatsapp.com/dl")) {
        const numberDigits = normalizeDigits(number);
        return numberDigits ? `https://wa.me/${numberDigits}` : `https://${direct}`;
      }
      return `https://${direct}`;
    }

    const digits = normalizeDigits(number);
    return digits ? `https://wa.me/${digits}` : "";
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
  const lawyersForHome =
    loading ? [] : lawyers && lawyers.length > 0 ? lawyers : DUMMY_LAWYERS;
  const practiceForHome =
    loading ? [] : practiceAreas && practiceAreas.length > 0 ? practiceAreas : DUMMY_PRACTICE_AREAS;
  const publicationsForHome =
    loading ? [] : publications && publications.length > 0 ? publications : DUMMY_PUBLICATIONS;
  const insightsForHome =
    loading ? [] : insights && insights.length > 0 ? insights : DUMMY_INSIGHTS;
  const articlesForHome = loading ? [] : articles || [];
  const aboutForHome = aboutContent && aboutContent.length > 0 ? aboutContent[0] : null;
  const whyChooseForHome = whyChooseContent && whyChooseContent.length > 0 ? whyChooseContent[0] : null;
  const consultationFeesForHome =
    consultationFeesContent && consultationFeesContent.length > 0 ? consultationFeesContent[0] : null;
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

  const formatAdminText = (value) => {
    const s = String(value || "").trim();
    if (!s) return "";
    // If HTML is provided from CKEditor, keep it as-is.
    if (s.includes("<") && s.includes(">")) return s;
    // Otherwise preserve line breaks for plain textarea input.
    return s.replace(/\n/g, "<br/>");
  };

  const lawyersSlidesCount = Math.max(1, Math.ceil(lawyersForHome.length / Math.max(1, lawyersPerView)));
  const canSlideLawyers = lawyersSlidesCount > 1;

  useEffect(() => {
    setLawyersSlide((prev) => Math.min(Math.max(0, prev), lawyersSlidesCount - 1));
  }, [lawyersSlidesCount]);

  const lawyersStartIndex = lawyersSlide * lawyersPerView;
  const lawyersVisible = lawyersForHome.slice(lawyersStartIndex, lawyersStartIndex + lawyersPerView);

  const goPrevLawyers = () => {
    if (!canSlideLawyers) return;
    setLawyersSlide((prev) => (prev - 1 + lawyersSlidesCount) % lawyersSlidesCount);
  };
  const goNextLawyers = () => {
    if (!canSlideLawyers) return;
    setLawyersSlide((prev) => (prev + 1) % lawyersSlidesCount);
  };

  const logosForHome = clientLogos && clientLogos.length > 0 ? clientLogos : [];
  const logosSlidesCount = Math.max(1, Math.ceil(logosForHome.length / Math.max(1, logosPerView)));
  const canSlideLogos = logosSlidesCount > 1;

  useEffect(() => {
    setLogosSlide((prev) => Math.min(Math.max(0, prev), logosSlidesCount - 1));
  }, [logosSlidesCount]);

  useEffect(() => {
    if (!canSlideLogos) return;
    const interval = window.setInterval(() => {
      setLogosSlide((prev) => (prev + 1) % logosSlidesCount);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [canSlideLogos, logosSlidesCount]);

  const logosStartIndex = logosSlide * logosPerView;
  const logosVisible = logosForHome.slice(logosStartIndex, logosStartIndex + logosPerView);

  const goPrevLogos = () => {
    if (!canSlideLogos) return;
    setLogosSlide((prev) => (prev - 1 + logosSlidesCount) % logosSlidesCount);
  };
  const goNextLogos = () => {
    if (!canSlideLogos) return;
    setLogosSlide((prev) => (prev + 1) % logosSlidesCount);
  };

  const submitConsultation = async (e) => {
    e.preventDefault();
    setConsultResult("");

    const payload = {
      name: consultForm.name.trim(),
      email: consultForm.email.trim(),
      phone: consultForm.phone.trim(),
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
              href="/about"
              onClick={(e) => {
                if (typeof navigate === "function") {
                  e.preventDefault();
                  go("/about");
                }
              }}
            >
              About Us
            </a>
            <a
              href="/#contact"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("contact");
              }}
            >
              Contact Us
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
              href="/#articles"
              onClick={(e) => {
                if (typeof navigate === "function") e.preventDefault();
                goToHomeSection("articles");
              }}
            >
              Articles
            </a>
          </nav>
        </div>
      </header>
      <main>
        {isLawyersRoute ? (
          <LawyersPage navigate={navigate} route={routePath} />
        ) : isAboutRoute ? (
          <section className="section bg-white">
            <div className="container two-column">
              <div>
                <h2 className="center" style={{ textAlign: "left" }}>
                  {aboutForHome?.title || "About Us"}
                </h2>
                {aboutForHome?.text ? (
                  <div
                    className="muted-text"
                    style={{ lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: aboutForHome.text }}
                  />
                ) : (
                  <p className="muted-text">
                    Share your firm story, focus areas, and the value you deliver to clients.
                  </p>
                )}
              </div>
              {aboutForHome?.image_url ? (
                <div>
                  <img
                    src={aboutForHome.image_url}
                    alt={aboutForHome.title || "About Us"}
                    className="rounded-2xl border border-neutral-200 shadow-sm"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          </section>
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

            {/* Message us strip - always visible on homepage */}
            <section className="message-us-strip" aria-label="Message us on social media">
              <div className="container message-us-strip__content">
                <p className="message-us-strip__text">
                  You can also message us on Instagram, Facebook, WhatsApp, LinkedIn &amp; TikTok
                </p>
                <div className="message-us-strip__icons">
                  {siteSettings?.facebook_url ? (
                    <a href={siteSettings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" className="message-us-strip__icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3H13.5V9.2c0-.9.3-1.6 1.6-1.6H16V5c-.5-.1-1.5-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H6.8v3H9v7h4.5Z" /></svg>
                    </a>
                  ) : (
                    <span className="message-us-strip__icon message-us-strip__icon--disabled" title="Add Facebook URL in Admin → Site Settings" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3H13.5V9.2c0-.9.3-1.6 1.6-1.6H16V5c-.5-.1-1.5-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H6.8v3H9v7h4.5Z" /></svg>
                    </span>
                  )}
                  {siteSettings?.instagram_url ? (
                    <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className="message-us-strip__icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-2.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" /></svg>
                    </a>
                  ) : (
                    <span className="message-us-strip__icon message-us-strip__icon--disabled" title="Add Instagram URL in Admin → Site Settings" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-2.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" /></svg>
                    </span>
                  )}
                  {whatsappHref ? (
                    <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp" className="message-us-strip__icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M12 2a9.7 9.7 0 0 0-8.3 14.8L2.5 22l5.4-1.1A9.7 9.7 0 1 0 12 2Zm0 2a7.7 7.7 0 0 1 0 15.4 7.6 7.6 0 0 1-3.8-1l-.5-.3-3.1.6.7-3-.3-.5A7.7 7.7 0 0 1 12 4Zm-3.1 4.5c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 2 0 1.2.8 2.4.9 2.6.1.2 1.6 2.6 4 3.6 2 .8 2.4.7 2.8.6.4-.1 1.3-.6 1.5-1.2.2-.6.2-1.1.1-1.2-.1-.1-.4-.2-.8-.4-.4-.2-1.3-.7-1.5-.8-.2-.1-.4-.2-.6.2-.2.4-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.4-1.9-.1-.3 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.6-1.6-.8-2.2-.2-.6-.4-.5-.6-.5Z" /></svg>
                    </a>
                  ) : (
                    <span className="message-us-strip__icon message-us-strip__icon--disabled" title="Add WhatsApp in Admin → Site Settings" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a9.7 9.7 0 0 0-8.3 14.8L2.5 22l5.4-1.1A9.7 9.7 0 1 0 12 2Zm0 2a7.7 7.7 0 0 1 0 15.4 7.6 7.6 0 0 1-3.8-1l-.5-.3-3.1.6.7-3-.3-.5A7.7 7.7 0 0 1 12 4Zm-3.1 4.5c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 2 0 1.2.8 2.4.9 2.6.1.2 1.6 2.6 4 3.6 2 .8 2.4.7 2.8.6.4-.1 1.3-.6 1.5-1.2.2-.6.2-1.1.1-1.2-.1-.1-.4-.2-.8-.4-.4-.2-1.3-.7-1.5-.8-.2-.1-.4-.2-.6.2-.2.4-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.4-1.9-.1-.3 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.6-1.6-.8-2.2-.2-.6-.4-.5-.6-.5Z" /></svg>
                    </span>
                  )}
                  {siteSettings?.linkedin_url ? (
                    <a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" className="message-us-strip__icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M4.98 3.5c0 1.38-1.11 2.5-2.48 2.5S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5ZM0.5 23.5h4V7.5h-4v16Zm7 0h4v-8.1c0-4.3 5.5-4.6 5.5 0v8.1h4v-9.6c0-7.6-8.5-7.3-9.5-3.6V7.5h-4v16Z" /></svg>
                    </a>
                  ) : (
                    <span className="message-us-strip__icon message-us-strip__icon--disabled" title="Add LinkedIn URL in Admin → Site Settings" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4.98 3.5c0 1.38-1.11 2.5-2.48 2.5S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5ZM0.5 23.5h4V7.5h-4v16Zm7 0h4v-8.1c0-4.3 5.5-4.6 5.5 0v8.1h4v-9.6c0-7.6-8.5-7.3-9.5-3.6V7.5h-4v16Z" /></svg>
                    </span>
                  )}
                  {siteSettings?.tiktok_url ? (
                    <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok" className="message-us-strip__icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M14 2h2c.2 2 1.5 3.8 3.6 4.4V8c-1.5-.1-2.9-.6-4-1.5V15a6 6 0 1 1-6-6c.4 0 .7 0 1 .1V11a3.9 3.9 0 0 0-1-.1 4 4 0 1 0 4 4V2Z" /></svg>
                    </a>
                  ) : (
                    <span className="message-us-strip__icon message-us-strip__icon--disabled" title="Add TikTok URL in Admin → Site Settings" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 2h2c.2 2 1.5 3.8 3.6 4.4V8c-1.5-.1-2.9-.6-4-1.5V15a6 6 0 1 1-6-6c.4 0 .7 0 1 .1V11a3.9 3.9 0 0 0-1-.1 4 4 0 1 0 4 4V2Z" /></svg>
                    </span>
                  )}
                </div>
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
              <>
                <div className="lawyers-carousel" aria-label="Lawyers slider">
                  {canSlideLawyers ? (
                    <button
                      type="button"
                      className="lawyers-carousel__arrow lawyers-carousel__arrow--left"
                      onClick={goPrevLawyers}
                      aria-label="Previous lawyers"
                    >
                      ‹
                    </button>
                  ) : null}

                  <div
                    className="lawyers-carousel__track"
                    style={{ ["--cols"]: String(Math.max(1, lawyersPerView)) }}
                  >
                    {lawyersVisible.map((lawyer, idx) => (
                      <article
                        key={String(lawyer?.id ?? lawyer?.name ?? idx)}
                        className="lawyers-carousel__item mx-auto w-full max-w-[320px]"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          const id = String(lawyer?.id ?? "").trim();
                          if (!id) return;
                          go(`/lawyers/${encodeURIComponent(id)}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          const id = String(lawyer?.id ?? "").trim();
                          if (!id) return;
                          go(`/lawyers/${encodeURIComponent(id)}`);
                        }}
                      >
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

                  {canSlideLawyers ? (
                    <button
                      type="button"
                      className="lawyers-carousel__arrow lawyers-carousel__arrow--right"
                      onClick={goNextLawyers}
                      aria-label="Next lawyers"
                    >
                      ›
                    </button>
                  ) : null}
                </div>

                {canSlideLawyers ? (
                  <div className="lawyers-carousel__dots" aria-label="Lawyers slider pagination">
                    {Array.from({ length: lawyersSlidesCount }).map((_, i) => (
                      <button
                        key={String(i)}
                        type="button"
                        className={`lawyers-carousel__dot ${i === lawyersSlide ? "is-active" : ""}`}
                        aria-label={`Go to lawyers slide ${i + 1}`}
                        aria-current={i === lawyersSlide ? "true" : "false"}
                        onClick={() => setLawyersSlide(i)}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-center text-sm text-neutral-600">No lawyers available</p>
            )}
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="container">
          <h2 className="center">{whyChooseForHome?.title || "Why Clients Choose Us?"}</h2>
          {whyChooseForHome?.text ? (
            <div
              className="center muted-text"
              style={{ lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: whyChooseForHome.text }}
            />
          ) : (
            <p className="center muted-text">
              US-NEPAL LEGAL SOLUTIONS boasts the best lawyers in Nepal, serving an
              extensive roster of corporate clients across specialized sectors
              including Energy, Banking, Insurance, Aviation, Capital Markets, and
              Infrastructure Law.
            </p>
          )}
          <div className="logo-slider">
            {canSlideLogos ? (
              <button className="slider-arrow" aria-label="Previous logos" onClick={goPrevLogos}>
                ‹
              </button>
            ) : (
              <span />
            )}
            <div className="logo-track" style={{ ["--logo-cols"]: String(Math.max(1, logosPerView)) }}>
              {loading ? (
                <p style={{ textAlign: "center", color: "#5a6b5f" }}>Loading client logos...</p>
              ) : logosForHome.length > 0 ? (
                logosVisible.map((logo) => (
                  <div key={logo.id} className="logo-card">
                    <img src={logo.image_url} alt={logo.name} />
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#5a6b5f" }}>No client logos available</p>
              )}
            </div>
            {canSlideLogos ? (
              <button className="slider-arrow" aria-label="Next logos" onClick={goNextLogos}>
                ›
              </button>
            ) : (
              <span />
            )}
          </div>
          {canSlideLogos ? (
            <div className="slider-dots" aria-label="Client logos slider">
              {Array.from({ length: logosSlidesCount }).map((_, i) => (
                <button
                  key={String(i)}
                  type="button"
                  className={`slider-dot ${i === logosSlide ? "is-active" : ""}`}
                  aria-label={`Go to logos slide ${i + 1}`}
                  aria-current={i === logosSlide ? "true" : "false"}
                  onClick={() => setLogosSlide(i)}
                />
              ))}
            </div>
          ) : null}
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
        <div className="container">
          <div className="consultation-fees">
            <h2 className="center consultation-fees__title">
              {consultationFeesForHome?.title || "CONSULTATION FEES"}
            </h2>
            {consultationFeesForHome?.text ? (
              <div
                className="consultation-fees__intro center"
                dangerouslySetInnerHTML={{ __html: formatAdminText(consultationFeesForHome.text) }}
              />
            ) : (
              <p className="consultation-fees__intro center">
                Please add Consultation Fees in Admin → Consultation Fees.
              </p>
            )}
          </div>
        </div>
        <div className="container" id="articles">
          <div className="articles-section">
            <div className="articles-section__header">
              <h2 className="center">ARTICLES</h2>
              <p className="articles-section__subtitle center">
                Latest legal insights and updates from US‑Nepal Legal Solutions.
              </p>
            </div>
            <div className="grid three articles-grid">
              {loading ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#5a6b5f" }}>
                  Loading articles...
                </p>
              ) : articlesForHome.length > 0 ? (
                articlesForHome.map((article) => (
                  <article key={article.id} className="card card--image article-card">
                    {article.image_url ? (
                      <img src={article.image_url} alt={article.title || "Article"} loading="lazy" />
                    ) : null}
                    <div className="card__body">
                      <h3>{article.title || "Untitled Article"}</h3>
                      {article.description ? (
                        <p className="article-card__excerpt">{article.description}</p>
                      ) : article.text ? (
                        <p className="article-card__excerpt">{clampText(article.text, 140)}</p>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#5a6b5f" }}>
                  <p>No articles available</p>
                  <a
                    href="/?login=true"
                    style={{ display: "inline-block", marginTop: 10, color: "#1f5e2e", fontWeight: 700 }}
                  >
                    Admin login to add Articles →
                  </a>
                </div>
              )}
            </div>
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

                <div className="mt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={consultSubmitting}
                    className="inline-flex rounded-md bg-brand-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {consultSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>

                {consultResult ? (
                  <div className="text-sm text-white/90">{consultResult}</div>
                ) : null}

                <div className="contact-social-strip" aria-label="Message us on social media">
                  <div className="contact-social-strip__icons">
                    {siteSettings?.linkedin_url ? (
                      <a
                        href={siteSettings.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="LinkedIn"
                        title="LinkedIn"
                        className="contact-social-strip__icon"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                          <path d="M4.98 3.5c0 1.38-1.11 2.5-2.48 2.5S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5ZM0.5 23.5h4V7.5h-4v16Zm7 0h4v-8.1c0-4.3 5.5-4.6 5.5 0v8.1h4v-9.6c0-7.6-8.5-7.3-9.5-3.6V7.5h-4v16Z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="contact-social-strip__icon contact-social-strip__icon--disabled" title="Add LinkedIn URL in Admin → Site Settings" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5c0 1.38-1.11 2.5-2.48 2.5S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5ZM0.5 23.5h4V7.5h-4v16Zm7 0h4v-8.1c0-4.3 5.5-4.6 5.5 0v8.1h4v-9.6c0-7.6-8.5-7.3-9.5-3.6V7.5h-4v16Z" /></svg>
                      </span>
                    )}

                    {siteSettings?.instagram_url ? (
                      <a
                        href={siteSettings.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        title="Instagram"
                        className="contact-social-strip__icon"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-2.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="contact-social-strip__icon contact-social-strip__icon--disabled" title="Add Instagram URL in Admin → Site Settings" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-2.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" /></svg>
                      </span>
                    )}

                    {siteSettings?.facebook_url ? (
                      <a
                        href={siteSettings.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        title="Facebook"
                        className="contact-social-strip__icon"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                          <path d="M13.5 21v-7h2.4l.4-3H13.5V9.2c0-.9.3-1.6 1.6-1.6H16V5c-.5-.1-1.5-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H6.8v3H9v7h4.5Z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="contact-social-strip__icon contact-social-strip__icon--disabled" title="Add Facebook URL in Admin → Site Settings" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3H13.5V9.2c0-.9.3-1.6 1.6-1.6H16V5c-.5-.1-1.5-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H6.8v3H9v7h4.5Z" /></svg>
                      </span>
                    )}

                    {siteSettings?.tiktok_url ? (
                      <a
                        href={siteSettings.tiktok_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="TikTok"
                        title="TikTok"
                        className="contact-social-strip__icon"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                          <path d="M14 2h2c.2 2 1.5 3.8 3.6 4.4V8c-1.5-.1-2.9-.6-4-1.5V15a6 6 0 1 1-6-6c.4 0 .7 0 1 .1V11a3.9 3.9 0 0 0-1-.1 4 4 0 1 0 4 4V2Z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="contact-social-strip__icon contact-social-strip__icon--disabled" title="Add TikTok URL in Admin → Site Settings" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 2h2c.2 2 1.5 3.8 3.6 4.4V8c-1.5-.1-2.9-.6-4-1.5V15a6 6 0 1 1-6-6c.4 0 .7 0 1 .1V11a3.9 3.9 0 0 0-1-.1 4 4 0 1 0 4 4V2Z" /></svg>
                      </span>
                    )}

                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        title="WhatsApp"
                        className="contact-social-strip__icon"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                          <path d="M12 2a9.7 9.7 0 0 0-8.3 14.8L2.5 22l5.4-1.1A9.7 9.7 0 1 0 12 2Zm0 2a7.7 7.7 0 0 1 0 15.4 7.6 7.6 0 0 1-3.8-1l-.5-.3-3.1.6.7-3-.3-.5A7.7 7.7 0 0 1 12 4Zm-3.1 4.5c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 2 0 1.2.8 2.4.9 2.6.1.2 1.6 2.6 4 3.6 2 .8 2.4.7 2.8.6.4-.1 1.3-.6 1.5-1.2.2-.6.2-1.1.1-1.2-.1-.1-.4-.2-.8-.4-.4-.2-1.3-.7-1.5-.8-.2-.1-.4-.2-.6.2-.2.4-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.4-1.9-.1-.3 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.6-1.6-.8-2.2-.2-.6-.4-.5-.6-.5Z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="contact-social-strip__icon contact-social-strip__icon--disabled" title="Add WhatsApp in Admin → Site Settings" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a9.7 9.7 0 0 0-8.3 14.8L2.5 22l5.4-1.1A9.7 9.7 0 1 0 12 2Zm0 2a7.7 7.7 0 0 1 0 15.4 7.6 7.6 0 0 1-3.8-1l-.5-.3-3.1.6.7-3-.3-.5A7.7 7.7 0 0 1 12 4Zm-3.1 4.5c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 2 0 1.2.8 2.4.9 2.6.1.2 1.6 2.6 4 3.6 2 .8 2.4.7 2.8.6.4-.1 1.3-.6 1.5-1.2.2-.6.2-1.1.1-1.2-.1-.1-.4-.2-.8-.4-.4-.2-1.3-.7-1.5-.8-.2-.1-.4-.2-.6.2-.2.4-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.4-1.9-.1-.3 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.6-1.6-.8-2.2-.2-.6-.4-.5-.6-.5Z" /></svg>
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Insights */}
          <div id="insights" className="px-6 py-10 sm:px-10 lg:px-10 lg:py-12">
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
              <li><a href="/lawyers" onClick={(e) => { e.preventDefault(); go("/lawyers"); }}>Lawyers</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); go("/about"); }}>About Us</a></li>
              <li><a href="/#contact" onClick={(e) => { e.preventDefault(); goToHomeSection("contact"); }}>Contact Us</a></li>
              <li><a href="/#practice" onClick={(e) => { e.preventDefault(); goToHomeSection("practice"); }}>Practice Areas</a></li>
              <li><a href="/#articles" onClick={(e) => { e.preventDefault(); goToHomeSection("articles"); }}>Articles</a></li>
              <li><a href="/admin" onClick={(e) => { e.preventDefault(); go("/admin"); }}>Admin</a></li>
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
