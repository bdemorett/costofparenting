import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import BabyAffordabilityWizard from "@/components/tools/BabyAffordabilityWizard";

const CANONICAL_URL =
  "https://costofparenting.com/tools/can-we-afford-a-baby";

const TITLE = "Can We Afford a Baby? | 2026 Financial Readiness Calculator";
const DESCRIPTION =
  "Calculate the real Year 1 cost of having a baby in your city. Account for paid leave, daycare rates, healthcare, and gear to check your financial readiness score.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL_URL,
    type: "website",
  },
};

const toolSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_URL}#webpage`,
      url: CANONICAL_URL,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: {
        "@type": "WebSite",
        name: "Cost of Parenting",
        url: "https://costofparenting.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://costofparenting.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://costofparenting.com/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Can We Afford a Baby?",
          item: CANONICAL_URL,
        },
      ],
    },
  ],
};

export default function CanWeAffordABabyPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <JsonLd data={toolSchema} />
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6 sm:pt-8 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-teal-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/tools" className="hover:text-teal-800">
                Tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-stone-700" aria-current="page">
              Can We Afford a Baby?
            </li>
          </ol>
        </nav>

        <header className="mt-5 border-b border-stone-200/60 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
            Planning tools · 2026
          </p>
          <h1 className="font-serif mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Can We Afford a Baby?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Estimate Year 1 costs in your city — paid leave, childcare type,
            healthcare, and gear — then get a financial preparedness score with
            clear next steps.
          </p>
        </header>

        <div className="mt-8">
          <BabyAffordabilityWizard />
        </div>

        <p className="mt-8 text-sm leading-relaxed text-stone-500">
          Illustrative planning model only — not financial, tax, or medical
          advice. City care rates use curated Cost of Parenting baselines; see{" "}
          <Link href="/methodology" className="text-teal-700 underline">
            methodology
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
