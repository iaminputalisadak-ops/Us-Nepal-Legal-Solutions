import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "./config.js";

export default function ConsultationsManagement({ token: tokenProp }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = tokenProp || localStorage.getItem("adminToken") || "";

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      if (!token) {
        setItems([]);
        setError("Not logged in. Please logout and login again.");
        return;
      }

      // NOTE: We send token via query too because some Apache/PHP setups
      // do not reliably pass the Authorization header to PHP on GET.
      const url = `${API_URL}/consultations.php?token=${encodeURIComponent(token)}&_=${Date.now()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setItems([]);
        setError(data?.message || `Failed to load (${res.status})`);
        return;
      }
      setItems(data.data || []);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this consultation request?")) return;
    try {
      const res = await fetch(`${API_URL}/consultations.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.message || "Delete failed");
      await fetchItems();
    } catch (e) {
      alert(e?.message || "Failed to delete");
    }
  };

  const rows = useMemo(() => items || [], [items]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Loading consultation requests…
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-700">Consultations</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Submissions from the homepage consultation form.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchItems}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Refresh
        </button>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-600">
            No consultation requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[950px] w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <tr className="[&>th]:px-4 [&>th]:py-3">
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>About</th>
                  <th>Submitted</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {rows.map((r) => (
                  <tr key={r.id} className="[&>td]:px-4 [&>td]:py-3 align-top">
                    <td className="font-semibold text-neutral-900">{r.id}</td>
                    <td className="font-semibold text-neutral-900">{r.name}</td>
                    <td className="text-neutral-700">{r.email}</td>
                    <td className="text-neutral-700">{r.phone}</td>
                    <td className="text-neutral-700">
                      <div className="max-w-[460px] whitespace-pre-wrap">
                        {r.about || "-"}
                      </div>
                    </td>
                    <td className="text-neutral-600">{r.created_at || "-"}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

