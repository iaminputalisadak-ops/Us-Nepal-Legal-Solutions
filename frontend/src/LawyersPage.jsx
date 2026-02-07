import React, { useEffect, useMemo, useState } from "react";
import * as api from "./services/api.js";
import { DUMMY_LAWYERS } from "./dummyLawyers.js";

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function digitsOnly(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function buildWhatsAppLinkFromPhone(phone) {
  const digits = digitsOnly(phone);
  if (!digits) return "";
  // If admin enters local Nepali mobile number (10 digits starting 98), add country code.
  if (digits.length === 10 && digits.startsWith("98")) return `https://wa.me/977${digits}`;
  return `https://wa.me/${digits}`;
}

function getObjectFit(value) {
  const v = String(value || "").toLowerCase();
  return v === "contain" ? "contain" : "cover";
}

function getObjectPosition(value) {
  const v = String(value || "").trim();
  return v || "50% 25%";
}

function setMetaDescription(content) {
  if (typeof document === "undefined") return;
  const el = document.querySelector('meta[name="description"]');
  if (el) el.setAttribute("content", content);
}

export default function LawyersPage({ navigate, route }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Lawyers | US-NEPAL LEGAL SOLUTIONS";
    setMetaDescription(
      "Meet our lawyers in Nepal. Explore profiles, specializations, experience, and contact details for the US-NEPAL LEGAL SOLUTIONS team."
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const data = await api.getLawyers();
        if (!cancelled && data?.success) setLawyers(data.data || []);
      } catch (e) {
        // ignore; we'll show dummy list
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    return lawyers && lawyers.length > 0 ? lawyers : DUMMY_LAWYERS;
  }, [lawyers]);

  const pathname = String(route || window.location.pathname || "/").toLowerCase();
  const isDetailsRoute = pathname.startsWith("/lawyers/") && pathname.split("/").filter(Boolean).length >= 2;
  const selectedId = isDetailsRoute ? decodeURIComponent(pathname.split("/").filter(Boolean)[1] || "") : "";
  const selectedLawyer = isDetailsRoute ? items.find((l) => String(l.id) === String(selectedId)) : null;

  const go = (to) => {
    if (typeof navigate === "function") navigate(to);
    else window.location.assign(to);
  };

  if (isDetailsRoute) {
    if (!selectedLawyer) {
      return (
        <section className="bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto w-[min(1100px,92%)] py-12">
            <p className="font-serif text-brand-700">Lawyer profile</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Profile not found</h1>
            <p className="mt-3 text-neutral-600">
              This lawyer profile doesn’t exist (or was removed). Go back to the list.
            </p>
            <button
              type="button"
              onClick={() => go("/lawyers")}
              className="mt-6 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              ← Back to Lawyers
            </button>
          </div>
        </section>
      );
    }

    const specs = splitList(selectedLawyer.specializations);
    const wa = buildWhatsAppLinkFromPhone(selectedLawyer.phone);

    return (
      <>
        <section className="bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto w-[min(1200px,92%)] py-10 md:py-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="font-serif text-base text-brand-700">Lawyer profile</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  {selectedLawyer.name}
                </h1>
                <p className="mt-2 text-sm font-semibold text-brand-700">{selectedLawyer.role}</p>
                {selectedLawyer.focus ? (
                  <p className="mt-2 text-neutral-700">{selectedLawyer.focus}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => go("/lawyers")}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    ← Back to list
                  </button>
                  <a
                    href="/#contact"
                    className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                  >
                    Request a consultation
                  </a>
                </div>
              </div>

              <div className="w-full max-w-[520px]">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] w-full bg-neutral-100">
                    {selectedLawyer.image_url ? (
                      <img
                        src={selectedLawyer.image_url}
                        alt={selectedLawyer.name}
                        className="h-full w-full"
                        style={{
                          objectFit: getObjectFit(selectedLawyer.image_fit),
                          objectPosition: getObjectPosition(selectedLawyer.image_position),
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2 p-4 sm:grid-cols-2">
                    {selectedLawyer.email ? (
                      <a
                        href={`mailto:${selectedLawyer.email}`}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                      >
                        Email
                        <div className="mt-1 break-all text-xs font-normal text-neutral-600">
                          {selectedLawyer.email}
                        </div>
                      </a>
                    ) : null}
                    {selectedLawyer.phone ? (
                      <a
                        href={`tel:${selectedLawyer.phone}`}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                      >
                        Call
                        <div className="mt-1 text-xs font-normal text-neutral-600">{selectedLawyer.phone}</div>
                      </a>
                    ) : null}
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                      >
                        WhatsApp
                        <div className="mt-1 text-xs font-normal text-neutral-600">Message on WhatsApp</div>
                      </a>
                    ) : null}
                    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900">
                      Position
                      <div className="mt-1 text-xs font-normal text-neutral-600">
                        {selectedLawyer.role || "—"}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Tip: Add email/phone in Admin → Lawyers to enable contact buttons.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto w-[min(1200px,92%)]">
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="space-y-6">
                {selectedLawyer.bio ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">About</h2>
                    <p className="mt-2 text-sm leading-7 text-neutral-700">{selectedLawyer.bio}</p>
                  </div>
                ) : null}

                {selectedLawyer.experience ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Experience</h2>
                    <p className="mt-2 text-sm leading-7 text-neutral-700">{selectedLawyer.experience}</p>
                  </div>
                ) : null}

                {selectedLawyer.education ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Education</h2>
                    <p className="mt-2 text-sm leading-7 text-neutral-700">{selectedLawyer.education}</p>
                  </div>
                ) : null}
              </div>

              <aside className="space-y-6">
                {specs.length > 0 ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Specializations</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {specs.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedLawyer.bar_associations ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Bar Associations</h2>
                    <p className="mt-2 text-sm leading-7 text-neutral-700">{selectedLawyer.bar_associations}</p>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto w-[min(1200px,92%)] py-10 md:py-14">
          <div className="max-w-3xl">
            <p className="font-serif text-base text-brand-700">
              Experienced lawyers in Nepal
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Meet Our Legal Team
            </h1>
            <p className="mt-3 text-neutral-600">
              Browse detailed profiles, specializations, and contact information.
              Any updates made in the admin panel will appear here automatically.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/#contact"
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Request a consultation
              </a>
              <button
                type="button"
                onClick={() => {
                  setLawyers([]);
                  setLoading(true);
                  api.getLawyers()
                    .then((d) => {
                      if (d?.success) setLawyers(d.data || []);
                    })
                    .finally(() => setLoading(false));
                }}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Refresh list
              </button>
            </div>
            {loading ? (
              <p className="mt-4 text-sm text-neutral-500">Loading lawyers…</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto w-[min(1200px,92%)]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((lawyer) => {
                const id = String(lawyer.id);
                const specs = splitList(lawyer.specializations);

                return (
                  <article
                    key={id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => go(`/lawyers/${encodeURIComponent(id)}`)}
                      className="aspect-[4/3] w-full bg-neutral-100 text-left"
                      aria-label={`Open ${lawyer.name} profile`}
                    >
                      {lawyer.image_url ? (
                        <img
                          src={lawyer.image_url}
                          alt={lawyer.name}
                          className="h-full w-full"
                          style={{
                            objectFit: getObjectFit(lawyer.image_fit),
                            objectPosition: getObjectPosition(lawyer.image_position),
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                          No photo
                        </div>
                      )}
                    </button>

                    <div className="p-5">
                      <header>
                        <h2 className="text-lg font-bold">{lawyer.name}</h2>
                        <p className="mt-1 text-sm font-semibold text-brand-700">
                          {lawyer.role}
                        </p>
                        {lawyer.focus ? (
                          <p className="mt-1 text-sm text-neutral-600">
                            {lawyer.focus}
                          </p>
                        ) : null}
                      </header>

                      {specs.length > 0 ? (
                        <div className="mt-4">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Specializations
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {specs.slice(0, 6).map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => go(`/lawyers/${encodeURIComponent(id)}`)}
                          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                        >
                          View profile
                        </button>
                        {lawyer.email ? (
                          <a
                            href={`mailto:${lawyer.email}`}
                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                          >
                            Email
                          </a>
                        ) : null}
                        {lawyer.phone ? (
                          <a
                            href={`tel:${lawyer.phone}`}
                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                          >
                            Call
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
      </section>
    </>
  );
}

