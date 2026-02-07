import React, { useEffect, useRef, useState } from "react";
import * as api from "../services/api.js";

function isProbablyImageUrl(url) {
  if (!url) return false;
  return (
    /\.(png|jpe?g|gif|webp|svg|ico|avif)(\?.*)?$/i.test(url) ||
    url.startsWith("data:image/")
  );
}

export default function ImageField({
  label,
  value,
  onChange,
  helpText,
  token: tokenProp,
  required = false,
  recommendedWidth,
  recommendedHeight,
  minWidth,
  minHeight,
  showPreview = true,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imgMeta, setImgMeta] = useState(null);

  useEffect(() => {
    setImgMeta(null);
  }, [value]);

  const doUpload = async (file) => {
    return api.uploadImage(file);
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setUploading(true);
      const url = await doUpload(file);
      if (!url) throw new Error("Upload succeeded but returned no URL");
      onChange(url);
    } catch (err) {
      alert(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group space-y-2">
      <label className="block text-sm font-semibold text-neutral-800">
        {label} {required ? "*" : ""}
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          // Use text input so relative URLs like "/api/uploads/..." don't fail
          // native browser URL validation (which blocks form submit).
          type="text"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL (https://...) or /api/uploads/..."
          required={required}
          className="w-full flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="whitespace-nowrap rounded-lg border border-brand-700 bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {helpText ? (
        <div className="text-sm text-neutral-600">{helpText}</div>
      ) : null}

      {showPreview && value ? (
        <div className="pt-1">
          <div className="mb-1 text-sm font-semibold text-neutral-700">
            Preview
          </div>
          {isProbablyImageUrl(value) ? (
            <>
              <img
                src={value}
                alt="Preview"
                loading="lazy"
                onLoad={(e) => {
                  const w = e.currentTarget.naturalWidth || 0;
                  const h = e.currentTarget.naturalHeight || 0;
                  if (w > 0 && h > 0) setImgMeta({ width: w, height: h });
                  else setImgMeta({ width: null, height: null });
                }}
                onError={() => setImgMeta({ error: true })}
                className="max-h-48 w-full rounded-xl border border-neutral-200 object-cover"
              />
              <div className="mt-2 text-sm text-neutral-600">
                {imgMeta?.error ? (
                  <span className="text-amber-700">
                    Couldn’t load this image preview. (It can still be saved if the URL is correct.)
                  </span>
                ) : imgMeta?.width && imgMeta?.height ? (
                  <>
                    <div>
                      Image size: <strong>{imgMeta.width}×{imgMeta.height}</strong> px
                    </div>
                    {(minWidth || minHeight || recommendedWidth || recommendedHeight) ? (
                      <div className="mt-1">
                        {(() => {
                          const warnings = [];
                          if (minWidth && imgMeta.width < minWidth) warnings.push(`width < ${minWidth}px minimum`);
                          if (minHeight && imgMeta.height < minHeight) warnings.push(`height < ${minHeight}px minimum`);
                          if (warnings.length > 0) {
                            return (
                              <span className="text-amber-700">
                                Warning: image is too small ({warnings.join(", ")}).
                              </span>
                            );
                          }
                          if (recommendedWidth && imgMeta.width < recommendedWidth) warnings.push(`width < ${recommendedWidth}px recommended`);
                          if (recommendedHeight && imgMeta.height < recommendedHeight) warnings.push(`height < ${recommendedHeight}px recommended`);
                          if (warnings.length > 0) {
                            return (
                              <span className="text-neutral-700">
                                Tip: for best quality, use at least {recommendedWidth || "?"}×{recommendedHeight || "?"} px.
                              </span>
                            );
                          }
                          return (
                            <span className="text-emerald-700">
                              Size looks good.
                            </span>
                          );
                        })()}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <span>Image size: (unknown)</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-amber-700">
              (This doesn’t look like an image URL, but it will still be saved.)
            </div>
          )}
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPickFile}
        style={{ display: "none" }}
      />
    </div>
  );
}

