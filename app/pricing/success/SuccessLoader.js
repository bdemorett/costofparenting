"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PREMIUM_PLAN } from "../../utils/pricing";

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function SuccessLoader() {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError(
        "Missing checkout session. If you just paid, check your email for a receipt.",
      );
      setComplete(true);
      return;
    }

    let cancelled = false;

    async function verifyCheckoutSession() {
      try {
        const response = await fetch("/api/premium/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();

        if (!cancelled && response.ok && data.premium) {
          if (data.summary) setSummary(data.summary);
          await user?.reload();
        } else if (!cancelled) {
          setError(data.error || "We could not confirm your payment yet.");
        }
      } catch (verifyError) {
        if (!cancelled) {
          console.error(
            "[pricing/success] Session verification failed:",
            verifyError,
          );
          setError(
            "Unable to verify your payment. Please refresh or contact support.",
          );
        }
      } finally {
        if (!cancelled) {
          // Keep a short confirmation window, then clean the session id from the URL.
          params.delete("session_id");
          const remainingQuery = params.toString();
          const cleanUrl = `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}`;
          window.history.replaceState({}, "", cleanUrl);
        }
      }
    }

    verifyCheckoutSession();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (!cancelled) setComplete(true);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const dashboardHref =
    summary?.stateSlug && summary?.citySlug
      ? `/cost-of-parenting/${summary.stateSlug}/${summary.citySlug}`
      : summary?.cityContext && summary.cityContext.includes("/")
        ? `/cost-of-parenting/${summary.cityContext}`
        : "/cost-of-parenting/tx/austin";

  const placeLabel = summary?.cityLabel || "your city";

  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <header className="border-b border-stone-200/60 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
              CP
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight text-stone-900">
              Cost of Parenting
            </span>
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200/50 bg-white shadow-editorial">
          <div className="border-b border-stone-100 bg-teal-50 px-8 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              {complete && !error ? (
                <svg
                  className="h-8 w-8 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : complete && error ? (
                <svg
                  className="h-8 w-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 animate-spin text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="px-8 py-10 text-center">
            <h1 className="font-serif text-2xl font-semibold text-stone-900">
              {complete
                ? error
                  ? "Almost there"
                  : summary?.intent === "pdf_report"
                    ? "Report unlocked"
                    : "You're all set!"
                : "Payment successful!"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {complete
                ? error ||
                  (summary?.intent === "pdf_report"
                    ? `Your detailed ${placeLabel} budget report access is ready with ${PREMIUM_PLAN.name}.`
                    : `Your ${PREMIUM_PLAN.name} is active. Open a city dashboard to run your 18-year forecast.`)
                : "Unlocking your lifetime premium access..."}
            </p>

            {!error && (
              <div className="mt-8">
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 font-sans text-xs text-stone-500">
                  {complete
                    ? "Access granted"
                    : `Activating premium features… ${progress}%`}
                </p>
              </div>
            )}

            {complete && !error && summary && (
              <div className="mt-6 rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                  Checkout summary
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  {summary.cityLabel ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-stone-500">City</dt>
                      <dd className="font-medium text-stone-900">
                        {summary.cityLabel}
                        {summary.stateCode ? ` · ${summary.stateCode}` : ""}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <dt className="text-stone-500">Children</dt>
                    <dd className="font-medium text-stone-900">
                      {summary.childCount || 0}
                      {summary.childCount > 0 ? (
                        <span className="ml-1 text-xs font-normal text-stone-500">
                          ({summary.infantCount} infant · {summary.toddlerCount}{" "}
                          toddler · {summary.schoolAgeCount} school-age)
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-stone-500">Care</dt>
                    <dd className="font-medium capitalize text-stone-900">
                      {summary.childcareType}
                    </dd>
                  </div>
                  {summary.monthlyTotal > 0 ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-stone-500">Est. monthly</dt>
                      <dd className="font-serif font-semibold text-stone-900">
                        {formatUsd(summary.monthlyTotal)}
                      </dd>
                    </div>
                  ) : null}
                  {summary.annualTotal > 0 ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-stone-500">Est. annual</dt>
                      <dd className="font-serif font-semibold text-stone-900">
                        {formatUsd(summary.annualTotal)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            )}

            {complete && (
              <div className="mt-8 space-y-3">
                <Link href={dashboardHref} className="btn-pill w-full">
                  {summary?.cityLabel
                    ? `Open ${summary.cityLabel.split(",")[0]} dashboard`
                    : "Open Austin dashboard"}
                </Link>
                <Link href="/" className="btn-pill-outline w-full">
                  Back to home
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
