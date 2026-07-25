"use client";

import { useEffect, useRef } from "react";
import {
  getAdSenseClientId,
  isAdSenseUnitReady,
} from "../utils/adsense";

function AdPlaceholder({ label, className = "", theme = "light" }) {
  const styles =
    theme === "light"
      ? "border-dashed border-stone-300 bg-cream-muted text-stone-500"
      : "border-dashed border-stone-600 bg-stone-900/60 text-stone-400";

  return (
    <aside
      className={`flex min-h-[100px] w-full items-center justify-center rounded-2xl border text-xs font-mono tracking-wider ${styles} ${className}`}
      style={{ minHeight: 100 }}
      aria-label="Advertisement"
    >
      {label}
    </aside>
  );
}

export default function AdSenseUnit({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  className = "",
  placeholderLabel = "Advertisement",
  theme = "light",
}) {
  const pushedRef = useRef(false);
  const clientId = getAdSenseClientId();
  const ready = isAdSenseUnitReady(slot);

  useEffect(() => {
    if (!ready || pushedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (error) {
      console.error("[AdSenseUnit] Failed to initialize ad:", error);
    }
  }, [ready, slot]);

  if (!ready) {
    return (
      <AdPlaceholder label={placeholderLabel} className={className} theme={theme} />
    );
  }

  return (
    <aside
      className={`relative w-full overflow-hidden ${className}`}
      style={{ minHeight: 100 }}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle block min-h-[100px] w-full"
        style={{ display: "block", minHeight: 100 }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </aside>
  );
}
