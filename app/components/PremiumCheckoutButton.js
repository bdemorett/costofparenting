"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useState } from "react";

const variantStyles = {
  lightPrimary:
    "rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60",
  lightOutline:
    "rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-60",
  darkPrimary:
    "rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60",
  darkOutline:
    "rounded-full border border-stone-300 bg-cream px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-60",
};

/**
 * Starts Stripe Checkout. Pass `scenario` for calculator metadata
 * (city, kids, monthly/annual totals, intent).
 *
 * @param {object} props
 * @param {string} [props.cityContext]
 * @param {Record<string, unknown> | null} [props.scenario]
 * @param {string} [props.className]
 * @param {import("react").ReactNode} [props.children]
 * @param {keyof typeof variantStyles} [props.variant]
 * @param {boolean} [props.disabled]
 */
export default function PremiumCheckoutButton({
  cityContext = "general",
  scenario = undefined,
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
      const payload = {
        cityContext,
        ...(scenario && typeof scenario === "object" ? scenario : {}),
      };

      const response = await fetch("/api/checkout/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      className={`block w-full text-center ${variantStyles[variant] || variantStyles.lightPrimary} ${className}`}
    >
      {label}
    </button>
  );
}
