"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const variants = {
  dark: {
    cta: "hidden rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 sm:inline-flex",
    badge:
      "hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 sm:inline-flex",
  },
  light: {
    cta: "hidden rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex",
    badge:
      "hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:inline-flex",
  },
};

function userHasPremium(user) {
  const premium = user?.publicMetadata?.premium;
  return (
    premium === true ||
    (premium && typeof premium === "object" && premium.active === true)
  );
}

export default function PremiumHeaderCta({ variant = "light" }) {
  const { isLoaded, user } = useUser();
  const styles = variants[variant] || variants.light;

  if (!isLoaded) {
    return null;
  }

  if (userHasPremium(user)) {
    return (
      <span className={styles.badge}>
        <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
        Premium Active
      </span>
    );
  }

  return (
    <Link href="/pricing" className={styles.cta}>
      Get Lifetime Pass
    </Link>
  );
}
