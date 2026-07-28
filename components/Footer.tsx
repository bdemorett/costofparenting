import Link from "next/link";

/**
 * High-end data-network footer — editorial columns, not a generic landing strip.
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200/60 bg-cream-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
            Cost of Parenting
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
            A localized family-cost intelligence network. Transparent baselines,
            age-banded models, and multi-year outlooks for the cities families
            actually live in.
          </p>
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-teal-800">
            Data network · US metros
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                <Link href="/cost-of-parenting/tx/austin" className="hover:text-teal-800">
                  Austin costs
                </Link>
              </li>
              <li>
                <Link href="/cost-of-parenting/ny/new-york" className="hover:text-teal-800">
                  New York costs
                </Link>
              </li>
              <li>
                <Link href="/tools/can-we-afford-a-baby" className="hover:text-teal-800">
                  Can we afford a baby?
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-800">
                  Premium access
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Company
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                <Link href="/about" className="hover:text-teal-800">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-800">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-teal-800">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-teal-800">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Methodology
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                <Link href="/methodology" className="hover:text-teal-800">
                  Data &amp; calculation models
                </Link>
              </li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Curated city baselines, global age multipliers, and secure Premium
              forecasts. Illustrative planning figures — verify locally before
              major decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200/50">
        <div className="mx-auto max-w-6xl px-6 py-5 sm:px-8">
          <p className="font-sans text-xs leading-relaxed text-stone-500">
            © 2026 Cost of Parenting. All rights reserved. Cost of Parenting is owned
            and operated by DeMorett Holdings LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
