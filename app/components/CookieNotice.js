"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "costofparenting-cookie-notice-dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures and still hide the banner.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200/60 bg-cream/95 px-4 py-4 shadow-lg backdrop-blur-sm"
      role="dialog"
      aria-label="Cookie notice"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-stone-600">
          We use cookies for sign-in, site functionality, and advertising on our
          free tier. See our{" "}
          <Link href="/privacy-policy" className="font-medium text-teal-800 underline">
            Privacy Policy
          </Link>{" "}
          for details, including how Google AdSense may use cookies.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
