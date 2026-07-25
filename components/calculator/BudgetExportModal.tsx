"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LeadCaptureBudgetSummary } from "@/types/leadCapture";

export type BudgetExportScenario = LeadCaptureBudgetSummary;

export interface BudgetExportModalProps {
  open: boolean;
  onClose: () => void;
  scenario: BudgetExportScenario;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Lead-capture drawer for emailing / exporting a personalized budget PDF summary.
 */
export default function BudgetExportModal({
  open,
  onClose,
  scenario,
}: BudgetExportModalProps) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetMoveDate, setTargetMoveDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    setName("");
    setEmail("");
    setTargetMoveDate("");
    setStatus("idle");
    setErrorMessage("");

    const t = window.setTimeout(() => nameRef.current?.focus(), 50);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          targetMoveDate: targetMoveDate || undefined,
          budget: scenario,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

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

  const place = `${scenario.cityName}, ${scenario.stateName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close export dialog"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-stone-200/70 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-stone-100 bg-teal-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
                Export budget
              </p>
              <h2
                id={titleId}
                className="font-serif mt-1 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
              >
                Get your {place} breakdown
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-600 hover:text-stone-900"
            >
              Close
            </button>
          </div>
          <p className="mt-2 text-sm text-stone-600">
            {scenario.childCount} kid{scenario.childCount === 1 ? "" : "s"} ·{" "}
            {scenario.ageCategoryLabel} · {scenario.careTypeLabel} ·{" "}
            <span className="font-semibold text-stone-900">
              {formatUsd(scenario.monthlyTotal)}/mo
            </span>
          </p>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {status === "success" ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                ✓
              </div>
              <p className="font-serif mt-4 text-2xl font-semibold text-stone-900">
                Check your inbox!
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Your custom budget breakdown is on its way.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="budget-export-name"
                  className="text-xs font-semibold uppercase tracking-wider text-stone-500"
                >
                  Name
                </label>
                <input
                  ref={nameRef}
                  id="budget-export-name"
                  name="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900"
                  placeholder="Alex Parent"
                />
              </div>

              <div>
                <label
                  htmlFor="budget-export-email"
                  className="text-xs font-semibold uppercase tracking-wider text-stone-500"
                >
                  Email
                </label>
                <input
                  id="budget-export-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="budget-export-move-date"
                  className="text-xs font-semibold uppercase tracking-wider text-stone-500"
                >
                  Target move date{" "}
                  <span className="font-normal normal-case tracking-normal text-stone-400">
                    (optional)
                  </span>
                </label>
                <input
                  id="budget-export-move-date"
                  name="targetMoveDate"
                  type="month"
                  value={targetMoveDate}
                  onChange={(e) => setTargetMoveDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900"
                />
              </div>

              {status === "error" && errorMessage ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading"
                  ? "Sending…"
                  : "Email my budget breakdown"}
              </button>

              <p className="text-center text-xs text-stone-500">
                We&apos;ll send a summary you can save as PDF or forward to a
                partner. No spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
