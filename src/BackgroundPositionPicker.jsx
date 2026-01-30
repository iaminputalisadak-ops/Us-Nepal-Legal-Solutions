import React, { useEffect, useMemo, useRef, useState } from "react";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function parsePositionToPercent(posRaw) {
  const pos = String(posRaw || "center").trim().toLowerCase();
  if (!pos) return { x: 50, y: 50 };

  // Keywords
  const keyword = (k) => {
    switch (k) {
      case "left":
        return { axis: "x", value: 0 };
      case "right":
        return { axis: "x", value: 100 };
      case "top":
        return { axis: "y", value: 0 };
      case "bottom":
        return { axis: "y", value: 100 };
      case "center":
        return { axis: "both", value: 50 };
      default:
        return null;
    }
  };

  // Percent format: "50% 25%"
  const parts = pos.split(/\s+/g).filter(Boolean);
  if (parts.length >= 2 && parts[0].includes("%") && parts[1].includes("%")) {
    const x = clamp(Number.parseFloat(parts[0]), 0, 100);
    const y = clamp(Number.parseFloat(parts[1]), 0, 100);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }

  // Two keywords: "center top", "left center", etc.
  if (parts.length >= 2) {
    const a = keyword(parts[0]);
    const b = keyword(parts[1]);
    let x = 50;
    let y = 50;
    for (const k of [a, b]) {
      if (!k) continue;
      if (k.axis === "x") x = k.value;
      if (k.axis === "y") y = k.value;
      if (k.axis === "both") {
        x = 50;
        y = 50;
      }
    }
    return { x, y };
  }

  // Single keyword
  const single = keyword(parts[0]);
  if (single) {
    if (single.axis === "x") return { x: single.value, y: 50 };
    if (single.axis === "y") return { x: 50, y: single.value };
    return { x: 50, y: 50 };
  }

  return { x: 50, y: 50 };
}

function formatPercentPosition(x, y) {
  const xx = clamp(Math.round(x), 0, 100);
  const yy = clamp(Math.round(y), 0, 100);
  return `${xx}% ${yy}%`;
}

export default function BackgroundPositionPicker({
  imageUrl,
  fit = "cover",
  position,
  onChange,
  height = 190,
}) {
  const ref = useRef(null);
  const initial = useMemo(() => parsePositionToPercent(position), [position]);
  const [xy, setXy] = useState(initial);

  useEffect(() => {
    setXy(parsePositionToPercent(position));
  }, [position]);

  const applyFromEvent = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    const next = { x, y };
    setXy(next);
    onChange?.(formatPercentPosition(x, y));
  };

  const onPointerDown = (e) => {
    // Only left click / primary touch
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    applyFromEvent(e);
  };

  const onPointerMove = (e) => {
    // Only when captured
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    if (e.pressure === 0 && e.pointerType !== "mouse") return;
    applyFromEvent(e);
  };

  const bgPos = formatPercentPosition(xy.x, xy.y);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-neutral-800">Drag to reposition</div>
        <div className="text-xs font-semibold text-neutral-600">{bgPos}</div>
      </div>

      <div
        ref={ref}
        role="application"
        aria-label="Background position editor"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
        style={{
          height,
          backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
          backgroundSize: String(fit).toLowerCase() === "contain" ? "contain" : "cover",
          backgroundPosition: bgPos,
          backgroundRepeat: "no-repeat",
          cursor: "grab",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        {/* Darken overlay to visualize composition */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18))",
          }}
        />

        {/* Crosshair */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${xy.x}%`,
            top: `${xy.y}%`,
            transform: "translate(-50%, -50%)",
            width: 18,
            height: 18,
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.95)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            background: "rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${xy.x}%`,
            top: `${xy.y}%`,
            transform: "translate(-50%, -50%)",
            width: 44,
            height: 1,
            background: "rgba(255,255,255,0.85)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${xy.x}%`,
            top: `${xy.y}%`,
            transform: "translate(-50%, -50%)",
            width: 1,
            height: 44,
            background: "rgba(255,255,255,0.85)",
            pointerEvents: "none",
          }}
        />
      </div>

      <p className="text-xs text-neutral-600">
        Click and drag to move the focus point (e.g., face). This controls cropping when Fit is “Cover”.
      </p>
    </div>
  );
}

