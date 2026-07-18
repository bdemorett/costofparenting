"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useState } from "react";

const variantStyles = {
  lightPrimary:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60",
  lightOutline:
    "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
  darkPrimary:
    "bg-emerald-500 text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60",
  darkOutline:
    "border border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60",
};

export default function PremiumCheckoutButton({
  cityContext = "general",
  className = "",
  children = "Get Lifetime Pass",
  variant = "lightPrimary",
  disabled = false,
}) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const label = !isLoaded
    ? "Loading..."
    : isLoading
      ? "Redirecting to Stripe..."
      : children;

  async function handleCheckout() {
    if (!isLoaded || disabled) return;

    if (!isSignedIn) {
      clerk.openSignUp();
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!user?.id || !email) {
      alert("We need a verified email on your account before checkout.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityContext }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error.message || "Unable to start checkout. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || isLoading || !isLoaded}
      className={`block w-full rounded-xl py-4 text-center text-sm font-bold transition ${variantStyles[variant] || variantStyles.lightPrimary} ${className}`}
    >
      {label}
    </button>
  );
}
