"use client";

import { useEffect, useRef } from "react";
import {
  getAdSenseClientId,
  isAdSenseUnitReady,
} from "../utils/adsense";

function AdPlaceholder({ label, className = "", theme = "dark" }) {
  const styles =
    theme === "light"
      ? "border-dashed border-slate-300 bg-slate-100 text-slate-500"
      : "border-dashed border-white/15 bg-slate-900/60 text-slate-500";

  return (
    <aside
      className={`flex min-h-[90px] w-full items-center justify-center rounded-xl border text-xs font-mono tracking-wider ${styles} ${className}`}
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
  theme = "dark",
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
    <aside className={className} aria-label="Advertisement">
      <ins
        className="adsbygoogle block min-h-[90px] w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </aside>
  );
}
