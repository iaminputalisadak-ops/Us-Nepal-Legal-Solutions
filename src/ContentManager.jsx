import React, { useEffect, useState } from "react";
import { API_URL } from "./config.js";
import ImageField from "./ImageField.jsx";
import BackgroundPositionPicker from "./BackgroundPositionPicker.jsx";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CONTENT_TYPES = {
  practice_areas: { name: "Practice Areas", fields: ["title", "text", "icon_url"] },
  publications: { name: "Publications", fields: ["title", "text", "image_url"] },
  client_logos: { name: "Client Logos", fields: ["name", "image_url", "website_url"] },
  journals: { name: "Journals", fields: ["title", "image_url", "description"] },
  insights: { name: "Insights", fields: ["title", "text", "image_url"] },
  // hero_content is the single hero section content.
  // hero_content table does NOT have display_order, so disable ordering for it.
  hero_content: {
    name: "Hero Settings (Default)",
    fields: [
      "eyebrow_text",
      "main_title",
      "description",
      "button_text",
      "button_link",
      "slider_interval_seconds",
      "background_image_url",
      "background_fit",
      "background_position",
    ],
    supportsOrder: false,
    single: true,
  },
  // Multiple banners for the homepage hero slider
  hero_banners: {
    name: "Hero Banners",
    fields: [
      "eyebrow_text",
      "main_title",
      "description",
      "button_text",
      "button_link",
      "display_order",
      "background_image_url",
      "background_fit",
      "background_position",
    ],
  },
  about_content: { name: "About Us", fields: ["title", "text"], disableAdd: true },
  why_choose_us: { name: "Why Clients Choose Us", fields: ["title", "text"], single: true, supportsOrder: false },
  consultation_fees: { name: "Consultation Fees", fields: ["title", "text"], single: true, supportsOrder: false, singleLabel: "Set Fees" },
  feature_strips: { name: "Feature Strips", fields: ["title"] },
  articles: { name: "Articles", fields: ["title", "slug", "description", "text", "image_url"] },
};

export default function ContentManager({ contentType, token: tokenProp }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const config = CONTENT_TYPES[contentType];
  if (!config) return <div className="text-sm text-rose-700">Invalid content type</div>;
  const isSingle = config.single === true;
  const canCreate = config.disableAdd !== true;
  const singleCtaLabel = config.singleLabel || (contentType === "hero_content" ? "Set Hero" : "Set");

  useEffect(() => {
    fetchItems();
    initializeForm();
  }, [contentType]);
  const ckeditorConfig = {
    toolbar: ["heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "undo", "redo"],
    removePlugins: [
      "CKFinderUploadAdapter",
      "CKFinder",
      "EasyImage",
      "ImageUpload",
      "MediaEmbed",
      "CloudServices",
    ],
  };

  const initializeForm = () => {
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field] = "";
    });
    // Most tables support display_order; hero_content does not.
    if (config.supportsOrder !== false) initialData.display_order = 0;
    initialData.is_active = 1;
    if (contentType === "hero_content") initialData.slider_interval_seconds = 6;
    if (contentType === "consultation_fees") {
      initialData.title = "CONSULTATION FEES";
      initialData.text = [
        "Consultation fees for the first legal query with the empanelled legal consultants of US‑Nepal Legal Solutions are outlined below.",
        "",
        "Property disputes — $150 for 30 minutes",
        "Family disputes — $100 for 30 minutes",
        "Business issues — $200 for 30 minutes",
        "Criminal law issues — $200 for 30 minutes",
        "Tax‑related issues — $200 for 30 minutes",
        "Other issues — $100 for 30 minutes",
        "",
        "Note: The consultation fee will be discussed with the service seeker on a personal basis, depending on the time required for consultation.",
      ].join("\n");
    }
    setFormData(initialData);
  };

  const getToken = () => tokenProp || localStorage.getItem("adminToken");

  const fetchItems = async () => {
    try {
      // Avoid browser caching so newly added items appear immediately
      const url = `${API_URL}/content_api.php?type=${contentType}&_=${Date.now()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    const method = editingItem ? "PUT" : "POST";
    const url = `${API_URL}/content_api.php?type=${contentType}`;

    const payload = { ...formData, token };
    if (editingItem) payload.id = editingItem.id;
    // Prevent sending fields that don't exist on the table
    if (contentType === "hero_content") delete payload.display_order;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        await fetchItems();
        resetForm();
        // Notify other tabs (homepage) to live-refresh content.
        try {
          localStorage.setItem("siteContentUpdatedAt", String(Date.now()));
        } catch {
          // ignore
        }
        alert(editingItem ? "Updated successfully!" : "Added successfully!");
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/content_api.php?type=${contentType}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, token }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchItems();
        try {
          localStorage.setItem("siteContentUpdatedAt", String(Date.now()));
        } catch {
          // ignore
        }
        alert("Deleted successfully!");
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Network error. Please try again.");
    }
  };

  const resetForm = () => {
    initializeForm();
    setEditingItem(null);
    setShowForm(false);
  };

  const getItemTitle = (item) =>
    item?.title || item?.name || item?.eyebrow_text || item?.main_title || "Untitled";

  const getItemImage = (item) =>
    item?.image_url || item?.background_image_url || item?.icon_url || "";

  const getItemPreview = (item) => {
    if (item?.text) return item.text;
    if (item?.description) return item.description;
    if (item?.main_title) return item.main_title;
    if (item?.button_text) return item.button_text;
    if (item?.website_url) return item.website_url;
    return "";
  };

  const renderField = (field) => {
    const isPlainTextarea = field === "main_title";
    const isRichText = field === "text" || field === "description";
    const label = field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const displayLabel =
      contentType === "consultation_fees" && field === "text" ? "Description" : label;
    const isImageField = field === "image_url" || field === "background_image_url" || field === "icon_url";

    if (field === "slider_interval_seconds") {
      const v = Number(formData[field] || 6);
      const value = Number.isFinite(v) ? Math.max(2, Math.min(60, v)) : 6;
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-800">
            Slide Duration (seconds)
          </label>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-neutral-800">Each slide shows for</div>
              <div className="text-sm font-bold text-brand-700">{value}s</div>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={value}
              onChange={(e) => setFormData((prev) => ({ ...prev, [field]: Number(e.target.value) }))}
              className="mt-3 w-full accent-brand-700"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[3, 5, 7, 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, [field]: preset }))}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                >
                  {preset}s
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-600">Custom</span>
                <input
                  type="number"
                  min="2"
                  max="60"
                  step="1"
                  value={value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [field]: Number(e.target.value) }))}
                  className="w-24 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
                <span className="text-xs font-semibold text-neutral-600">sec</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-600">Tip: 5–7 seconds usually feels best.</p>
          </div>
        </div>
      );
    }

    if (field === "background_fit") {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-800">
            Background Fit
          </label>
          <select
            name={field}
            value={formData[field] || "cover"}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="cover">Cover (fills, crops edges)</option>
            <option value="contain">Contain (show full image)</option>
          </select>
          <div className="text-sm text-neutral-600">
            Use <strong>Position</strong> below to keep faces/logos visible.
          </div>
        </div>
      );
    }

    if (field === "background_position") {
      const img = String(formData.background_image_url || "").trim();
      const fit = String(formData.background_fit || "cover");
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-800">
            Background Position
          </label>

          {img ? (
            <BackgroundPositionPicker
              imageUrl={img}
              fit={fit}
              position={formData[field] || "center"}
              onChange={(pos) => setFormData((prev) => ({ ...prev, [field]: pos }))}
            />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              Upload/select a background image first to enable drag reposition.
            </div>
          )}

          <input
            type="text"
            name={field}
            value={formData[field] || "center"}
            onChange={handleInputChange}
            placeholder='Examples: "center", "top", "bottom", "50% 30%"'
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              ["center", "Center"],
              ["top", "Top"],
              ["bottom", "Bottom"],
              ["left", "Left"],
              ["right", "Right"],
              ["center top", "Center Top"],
              ["50% 25%", "Face Up"],
            ].map(([v, t]) => (
              <button
                key={v}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, [field]: v }))}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                {t}
              </button>
            ))}
          </div>
          <div className="text-sm text-neutral-600">
            Tip: try <strong>50% 25%</strong> to move the focus upward (good for faces).
          </div>
        </div>
      );
    }

    if (isRichText) {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-800">
            {displayLabel} {field === "title" && "*"}
          </label>
          <div className="rounded-lg border border-neutral-300 bg-white p-2 focus-within:border-brand-700 focus-within:ring-4 focus-within:ring-brand-100">
            <CKEditor
              editor={ClassicEditor}
              config={ckeditorConfig}
              data={formData[field] || ""}
              onChange={(_, editor) => {
                const data = editor.getData();
                setFormData((prev) => ({ ...prev, [field]: data }));
              }}
            />
          </div>
        </div>
      );
    }

    if (isPlainTextarea) {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-800">{displayLabel}</label>
          <textarea
            name={field}
            value={formData[field] || ""}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          />
          <div className="text-xs text-neutral-500">
            Tip: use line breaks to split the title into multiple lines.
          </div>
        </div>
      );
    }

    if (field === "display_order") {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-800">Display Order</label>
          <input
            type="number"
            name={field}
            value={Number(formData[field] ?? 0)}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          />
          <div className="text-sm text-neutral-600">
            Lower numbers appear first in the homepage hero.
          </div>
        </div>
      );
    }

    if (isImageField) {
      const isHeroBg =
        field === "background_image_url" && (contentType === "hero_content" || contentType === "hero_banners");
      const help = isHeroBg
        ? "Homepage banner size: Recommended 1920×900px (or larger). Minimum 1600×600px. Tip: if faces get cropped, use Background Position (drag to reposition)."
        : "Paste a URL or upload a file from your computer.";
      return (
        <ImageField
          key={field}
          label={label}
          value={formData[field] || ""}
          onChange={(url) => setFormData((prev) => ({ ...prev, [field]: url }))}
          helpText={help}
          token={getToken()}
          // Hero background already has a drag-to-reposition preview below (Facebook-style),
          // so avoid showing a duplicate large preview block here.
          showPreview={!isHeroBg}
        />
      );
    }

    const isHeroButtonLink = field === "button_link";

    return (
      <div key={field} className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-800">
          {label} {field === "name" && "*"}
        </label>
        <input
          // For hero button_link we allow blank or non-URL values (e.g. "#about", "/lawyers").
          // Using type="url" triggers browser validation popups ("Please enter a URL.")
          // and makes it feel "required" even when it isn't.
          type={isHeroButtonLink ? "text" : field.includes("url") || field.includes("link") ? "url" : "text"}
          inputMode={isHeroButtonLink ? "url" : undefined}
          name={field}
          value={formData[field] || ""}
          onChange={handleInputChange}
          required={field === "name" || field === "title"}
          placeholder={
            isHeroButtonLink
              ? "Optional (examples: /lawyers, #about, https://example.com)"
              : undefined
          }
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Loading {config.name}…
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-700">Manage {config.name}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Table view for easy scanning. Use “Edit” or “Delete” on the right.
          </p>
        </div>
        {contentType === "hero_content" ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                // Create a brand-new hero banner row (older active ones are auto-deactivated by the backend).
                setEditingItem(null);
                initializeForm();
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              + Add New Banner
            </button>
            <button
              type="button"
              onClick={() => {
                if (items?.[0]) handleEdit(items[0]);
                else setShowForm(true);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              {items?.[0] ? "Edit" : "Set Hero"}
            </button>
          </div>
        ) : isSingle ? (
          <button
            type="button"
            onClick={() => {
              if (items?.[0]) handleEdit(items[0]);
              else setShowForm(true);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            {items?.[0] ? "Edit" : singleCtaLabel}
          </button>
        ) : canCreate ? (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              initializeForm();
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            + Add New
          </button>
        ) : null}
      </header>

      {showForm && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-brand-700">
                  {editingItem ? `Edit ${config.name.slice(0, -1)}` : `Add New ${config.name.slice(0, -1)}`}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">Fill in the fields and save.</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {config.fields.map(renderField)}

              <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-neutral-600">
            No items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <tr className="[&>th]:px-4 [&>th]:py-3">
                  <th>ID</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Preview</th>
                  {config.supportsOrder !== false ? <th className="text-right">Order</th> : null}
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item) => {
                  const img = getItemImage(item);
                  const title = getItemTitle(item);
                  const preview = getItemPreview(item);
                  const isActive = item.is_active == 1 || item.is_active === undefined;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-semibold text-neutral-800">#{item.id}</td>
                      <td className="px-4 py-3">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-neutral-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-100 ring-1 ring-neutral-200" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{title}</div>
                        {item.website_url ? (
                          <a
                            href={item.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block text-xs text-brand-700 underline underline-offset-2"
                          >
                            {item.website_url}
                          </a>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {preview ? (
                          <span className="line-clamp-2 block max-w-[420px]">
                            {String(preview).slice(0, 180)}
                            {String(preview).length > 180 ? "…" : ""}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      {config.supportsOrder !== false ? (
                        <td className="px-4 py-3 text-right font-semibold text-neutral-800">
                          {item.display_order ?? 0}
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <span
                          className={
                            isActive
                              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600"
                          }
                        >
                          {isActive ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
