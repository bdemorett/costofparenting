import Link from "next/link";
import AuthNav from "@/app/components/AuthNav";

export interface NavbarProps {
  /** Optional city context shown under the serif wordmark. */
  placeLabel?: string;
}

/**
 * Floating glass navigation — compact on mobile, editorial on desktop.
 */
export default function Navbar({ placeLabel }: NavbarProps) {
  return (
    <div className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
      <header className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between gap-2 rounded-full border border-stone-200/50 bg-white/75 px-3 py-2 shadow-glass backdrop-blur-xl sm:gap-4 sm:px-5 sm:py-2.5">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-semibold tracking-wide text-white transition group-hover:bg-teal-800 sm:h-9 sm:w-9 sm:text-[11px]">
            CP
          </span>
          <span className="min-w-0">
            <span className="font-serif block truncate text-[15px] font-semibold leading-tight tracking-tight text-stone-900 sm:text-[17px]">
              Cost of Parenting
            </span>
            <span className="mt-0.5 hidden truncate text-[11px] font-medium tracking-wide text-stone-500 sm:block">
              {placeLabel
                ? `Local costs · ${placeLabel}`
                : "Family finances, city by city"}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex"
          aria-label="Primary"
        >
          <Link href="/pricing" className="transition hover:text-teal-800">
            Pricing
          </Link>
          <Link href="/about" className="transition hover:text-teal-800">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-teal-800">
            Contact
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <AuthNav variant="light" />
          <Link
            href="/cost-of-parenting/tx/austin"
            className="hidden rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-800 sm:inline-flex sm:px-5 sm:py-2.5"
          >
            Open dashboard
          </Link>
        </div>
      </header>
    </div>
  );
}
