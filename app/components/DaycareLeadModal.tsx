"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface DaycareLeadModalProps {
  open: boolean;
  onClose: () => void;
  cityName: string;
  stateName: string;
  calculatedMonthlyCost?: number;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Zip + email capture for local daycare openings interest.
 */
export default function DaycareLeadModal({
  open,
  onClose,
  cityName,
  stateName,
  calculatedMonthlyCost,
}: DaycareLeadModalProps) {
  const titleId = useId();
  const zipRef = useRef<HTMLInputElement>(null);
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setZip("");
    setEmail("");
    setName("");
    setStatus("idle");
    setErrorMessage("");
    const t = window.setTimeout(() => zipRef.current?.focus(), 50);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const monthly = Math.max(0, Math.round(calculatedMonthlyCost || 0));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const citySlug = slugify(cityName) || "city";
    const stateSlug = slugify(stateName).slice(0, 2) || "us";

    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Daycare inquiry",
          email,
          budget: {
            cityName,
            stateName,
            stateSlug,
            citySlug,
            cityPath: `/cost-of-parenting/${stateSlug}/${citySlug}`,
            childCount: 1,
            ageCategory: "infant",
            ageCategoryLabel: "Infant",
            careType: "center",
            careTypeLabel: "Center-Based Daycare",
            monthlyTotal: monthly || 1,
            annualTotal: (monthly || 1) * 12,
            monthlyBreakdown: {
              housing: 0,
              food: 0,
              healthcare: 0,
              childcare: monthly || 1,
              clothing: 0,
              education: 0,
            },
            tool: "daycare-openings",
          },
          targetMoveDate: zip.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close daycare inquiry"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-stone-200/70 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-stone-100 bg-teal-50/80 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
                Local daycare
              </p>
              <h2
                id={titleId}
                className="font-serif mt-1 text-xl font-semibold text-stone-900"
              >
                Check openings in {cityName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-2 py-1 text-sm text-stone-500 hover:bg-white hover:text-stone-800"
            >
              Close
            </button>
          </div>
        </div>

        {status === "success" ? (
          <div className="px-5 py-8 text-sm leading-relaxed text-stone-600">
            <p className="font-medium text-stone-900">You&apos;re on the list.</p>
            <p className="mt-2">
              We&apos;ll follow up with {cityName} daycare openings and rate
              context for ZIP {zip}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                ZIP code
              </span>
              <input
                ref={zipRef}
                required
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                placeholder="78701"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Email
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Name <span className="font-normal normal-case">(optional)</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                placeholder="Alex"
              />
            </label>
            {status === "error" ? (
              <p className="text-sm text-rose-700" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-teal-700 px-5 py-3 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Request local openings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
