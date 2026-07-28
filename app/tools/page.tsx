import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Planning Tools",
  description:
    "Interactive Cost of Parenting tools — baby affordability, city cost guides, and more.",
  alternates: {
    canonical: "https://costofparenting.com/tools",
  },
};

export default function ToolsIndexPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
          Tools
        </p>
        <h1 className="font-serif mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">
          Planning tools
        </h1>
        <p className="mt-3 text-base text-stone-600">
          Calculators and readiness checks built on localized parenting cost
          baselines.
        </p>
        <ul className="mt-8 space-y-3">
          <li>
            <Link
              href="/tools/can-we-afford-a-baby"
              className="block rounded-xl border border-stone-200/60 bg-white px-5 py-4 hover:border-teal-700/40"
            >
              <span className="font-serif text-lg font-semibold text-stone-900">
                Can We Afford a Baby?
              </span>
              <span className="mt-1 block text-sm text-stone-600">
                Year 1 financial readiness score with leave, care, and gear.
              </span>
            </Link>
          </li>
        </ul>
      </main>
      <Footer />
    </div>
  );
}
