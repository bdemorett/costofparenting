"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PREMIUM_PLAN } from "../../utils/pricing";

export default function SuccessLoader() {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError("Missing checkout session. If you just paid, check your email for a receipt.");
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
          await user?.reload();
        } else if (!cancelled) {
          setError(data.error || "We could not confirm your payment yet.");
        }
      } catch (verifyError) {
        if (!cancelled) {
          console.error("[pricing/success] Session verification failed:", verifyError);
          setError("Unable to verify your payment. Please refresh or contact support.");
        }
      } finally {
        if (!cancelled) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
              BY
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              Before You Move There
            </span>
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-black/50">
          <div className="border-b border-white/10 bg-emerald-500/10 px-8 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              {complete && !error ? (
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : complete && error ? (
                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </div>
          </div>

          <div className="px-8 py-10 text-center">
            <h1 className="text-2xl font-bold text-white">
              {complete
                ? error
                  ? "Almost there"
                  : "You're all set!"
                : "Payment successful!"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {complete
                ? error ||
                  `Your ${PREMIUM_PLAN.name} is active. Start exploring premium neighborhood data now.`
                : "Unlocking your lifetime premium access..."}
            </p>

            {!error && (
              <div className="mt-8">
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {complete ? "Access granted" : `Activating premium features… ${progress}%`}
                </p>
              </div>
            )}

            {complete && (
              <div className="mt-8 space-y-3">
                <Link
                  href="/"
                  className="block w-full rounded-xl bg-emerald-500 py-4 text-sm font-bold text-white transition hover:bg-emerald-400"
                >
                  Search a neighborhood
                </Link>
                <Link
                  href="/move-to/tx/austin"
                  className="block w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Try Austin, TX
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
