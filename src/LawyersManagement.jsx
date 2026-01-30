import React, { useState, useEffect } from "react";
import { API_URL } from "./config.js";
import ImageField from "./ImageField.jsx";
import BackgroundPositionPicker from "./BackgroundPositionPicker.jsx";

export default function LawyersManagement({ token: tokenProp }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    focus: "",
    image_url: "",
    image_fit: "cover",
    image_position: "50% 25%",
    bio: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
    specializations: "",
    bar_associations: "",
    display_order: 0,
    is_active: 1,
  });

  useEffect(() => {
    fetchLawyers();
  }, []);

  const getToken = () => tokenProp || localStorage.getItem("adminToken");

  const fetchLawyers = async () => {
    try {
      const response = await fetch(`${API_URL}/lawyers.php`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLawyers(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching lawyers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    try {
      const url = editingLawyer
        ? `${API_URL}/lawyers.php`
        : `${API_URL}/lawyers.php`;
      const method = editingLawyer ? "PUT" : "POST";

      const payload = {
        ...formData,
        token,
      };

      if (editingLawyer) {
        payload.id = editingLawyer.id;
      }

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
        fetchLawyers();
        resetForm();
        alert(editingLawyer ? "Lawyer updated successfully!" : "Lawyer added successfully!");
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error saving lawyer:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleEdit = (lawyer) => {
    setEditingLawyer(lawyer);
    setFormData({
      name: lawyer.name || "",
      role: lawyer.role || "",
      focus: lawyer.focus || "",
      image_url: lawyer.image_url || "",
      image_fit: lawyer.image_fit || "cover",
      image_position: lawyer.image_position || "50% 25%",
      bio: lawyer.bio || "",
      email: lawyer.email || "",
      phone: lawyer.phone || "",
      education: lawyer.education || "",
      experience: lawyer.experience || "",
      specializations: lawyer.specializations || "",
      bar_associations: lawyer.bar_associations || "",
      display_order: lawyer.display_order || 0,
      is_active: lawyer.is_active !== undefined ? lawyer.is_active : 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lawyer?")) {
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/lawyers.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, token }),
      });

      const data = await response.json();

      if (data.success) {
        fetchLawyers();
        alert("Lawyer deleted successfully!");
      } else {
        alert(data.message || "Failed to delete lawyer");
      }
    } catch (err) {
      console.error("Error deleting lawyer:", err);
      alert("Network error. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      focus: "",
      image_url: "",
      image_fit: "cover",
      image_position: "50% 25%",
      bio: "",
      email: "",
      phone: "",
      education: "",
      experience: "",
      specializations: "",
      bar_associations: "",
      display_order: 0,
      is_active: 1,
    });
    setEditingLawyer(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Loading lawyers…
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-700">Manage Lawyers</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Add, edit, or delete lawyers. Changes are reflected immediately on
            the public Lawyers page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + Add New Lawyer
        </button>
      </header>

      {showForm && (
        <div
          className="fixed inset-0 z-[1000] overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-brand-700">
                  {editingLawyer ? "Edit Lawyer" : "Add New Lawyer"}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Upload a photo and fill out the profile details.
                </p>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-800">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-800">
                    Role *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Managing Partner"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">
                  Focus Areas
                </label>
                <input
                  type="text"
                  name="focus"
                  value={formData.focus}
                  onChange={handleInputChange}
                  placeholder="e.g., Energy, Hydropower, Aviation & FDI"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              <ImageField
                label="Photo"
                value={formData.image_url}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image_url: url }))
                }
                helpText="Paste a URL or upload a photo from your computer."
                token={getToken()}
                showPreview={false}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-800">
                    Photo Fit
                  </label>
                  <select
                    name="image_fit"
                    value={formData.image_fit || "cover"}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  >
                    <option value="cover">Cover (fills, crops edges)</option>
                    <option value="contain">Contain (show full image)</option>
                  </select>
                  <div className="text-sm text-neutral-600">
                    Use <strong>Position</strong> to keep faces centered.
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-800">
                    Photo Position
                  </label>
                  {formData.image_url ? (
                    <BackgroundPositionPicker
                      imageUrl={formData.image_url}
                      fit={formData.image_fit || "cover"}
                      position={formData.image_position || "50% 25%"}
                      onChange={(pos) => setFormData((prev) => ({ ...prev, image_position: pos }))}
                      height={160}
                    />
                  ) : (
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                      Upload/select a photo first to enable drag reposition.
                    </div>
                  )}
                  <input
                    type="text"
                    name="image_position"
                    value={formData.image_position || "50% 25%"}
                    onChange={handleInputChange}
                    placeholder='Examples: "50% 25%", "center", "center top"'
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">
                  Biography
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Brief biography..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-800">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-800">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">
                  Education
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Educational background..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Professional experience..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">
                  Specializations
                </label>
                <textarea
                  name="specializations"
                  value={formData.specializations}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Comma-separated (e.g., FDI, Arbitration, Corporate Compliance)"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-800">
                  Bar Associations
                </label>
                <textarea
                  name="bar_associations"
                  value={formData.bar_associations}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Bar associations memberships..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </div>

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
                  {editingLawyer ? "Update Lawyer" : "Add Lawyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        {lawyers.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-600">
            No lawyers found. Click “Add New Lawyer” to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <tr className="[&>th]:px-4 [&>th]:py-3">
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Focus</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {lawyers.map((lawyer) => {
                  const isActive = lawyer.is_active == 1 || lawyer.is_active === undefined;
                  return (
                    <tr key={lawyer.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-semibold text-neutral-800">
                        #{lawyer.id}
                      </td>
                      <td className="px-4 py-3">
                        {lawyer.image_url ? (
                          <img
                            src={lawyer.image_url}
                            alt={lawyer.name}
                            className="h-10 w-10 rounded-lg ring-1 ring-neutral-200"
                            style={{
                              objectFit: String(lawyer?.image_fit || "").toLowerCase() === "contain" ? "contain" : "cover",
                              objectPosition: String(lawyer?.image_position || "50% 25%"),
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-100 ring-1 ring-neutral-200" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        {lawyer.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-800">{lawyer.role}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {lawyer.focus ? lawyer.focus : <span className="text-neutral-400">—</span>}
                      </td>
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
                            onClick={() => handleEdit(lawyer)}
                            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(lawyer.id)}
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
