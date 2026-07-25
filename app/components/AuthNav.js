"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const variants = {
  dark: {
    signIn:
      "rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-all hover:border-teal-700/40 hover:text-teal-800 sm:px-4 sm:py-2 sm:text-sm",
    signUp:
      "rounded-full bg-teal-700 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-teal-800 sm:px-4 sm:py-2 sm:text-sm",
  },
  light: {
    signIn:
      "rounded-full border border-stone-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 transition-all hover:border-teal-700/30 hover:text-teal-800 sm:px-4 sm:py-2 sm:text-sm",
    signUp:
      "rounded-full bg-teal-700 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-teal-800 sm:px-4 sm:py-2 sm:text-sm",
  },
};

export default function AuthNav({ variant = "light" }) {
  const styles = variants[variant] || variants.light;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
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
              avatarBox: "h-8 w-8 sm:h-9 sm:w-9",
            },
          }}
        />
      </Show>
    </div>
  );
}
