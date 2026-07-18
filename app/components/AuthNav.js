"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const variants = {
  dark: {
    signIn:
      "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white",
    signUp:
      "rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400",
  },
  light: {
    signIn:
      "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700",
    signUp:
      "rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700",
  },
};

export default function AuthNav({ variant = "dark" }) {
  const styles = variants[variant] || variants.dark;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className={styles.signIn}>
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className={styles.signUp}>
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </Show>
    </div>
  );
}
