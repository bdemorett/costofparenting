import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { normalizeSiteUrl } from "./utils/siteUrl";

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const metadata = {
  title: "Cost of Parenting — Localized 18-Year Family Roadmaps",
  description:
    "A localized 18-year financial roadmap for raising kids. Explore city baselines and premium forecasts.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cost of Parenting — Localized 18-Year Family Roadmaps",
    description:
      "A localized 18-year financial roadmap for raising kids — city baselines and premium forecasts.",
    url: siteUrl,
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <Navbar />

      <main>
        {/* Hero: brand, one line, one support, CTAs — no secondary cards */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(15,118,110,0.09),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_60%,rgba(15,118,110,0.05),transparent_40%)]" />

          <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
            <h1 className="font-serif text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
              Cost of Parenting
            </h1>
            <p className="font-serif mt-5 text-xl font-medium leading-snug text-teal-800 sm:text-2xl">
              Your localized 18-year financial roadmap
            </p>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
              See what raising kids actually costs where you live — then plan
              year by year with a premium forecast built for families.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link
                href="/cost-of-parenting/tx/austin"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
              >
                Explore Austin costs
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white/80 px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
              >
                View Premium pricing
              </Link>
            </div>

            <p className="mt-6 text-sm text-stone-500">
              Also live:{" "}
              <Link
                href="/cost-of-parenting/ny/new-york"
                className="font-medium text-teal-800 underline-offset-2 hover:underline"
              >
                New York City
              </Link>
            </p>
          </div>
        </section>

        {/* One job: explain the product, without card chrome */}
        <section className="border-t border-stone-200/50 bg-cream-muted/70">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-3 md:gap-12">
            {[
              {
                title: "Localized by design",
                body: "Childcare, housing, and healthcare shift by metro. We start with those city differences — not a national average.",
              },
              {
                title: "Eighteen years ahead",
                body: "Premium forecasts walk your household forward year by year as children age and costs change.",
              },
              {
                title: "Built for families",
                body: "Warm, readable planning tools — clarity without the noise of a generic relocation site.",
              },
            ].map((item) => (
              <article key={item.title}>
                <h2 className="font-serif text-xl font-semibold tracking-tight text-stone-900">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Premium CTA + free baselines */}
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
                Lifetime Premium Pass
              </p>
              <h2 className="font-serif mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                One payment. Eighteen years of clarity.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                City baselines stay free. Unlock age-banded household forecasts,
                lifestyle scenarios, and an inflation-aware outlook when you are
                ready.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "City baselines for childcare, food, healthcare & housing",
                  "Age bands from infant through teen",
                  "Secure 18-year household outlooks",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-stone-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200/50 bg-white px-6 py-8 text-center shadow-pillow sm:px-8">
              <p className="font-serif text-5xl font-semibold tracking-tight text-stone-900">
                $29
              </p>
              <p className="mt-2 text-sm text-stone-500">
                One-time · lifetime access
              </p>
              <Link
                href="/pricing"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
              >
                Get Lifetime Pass
              </Link>
              <Link
                href="/cost-of-parenting/tx/austin"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-stone-200 px-6 py-3 text-sm font-medium text-stone-700 transition-all hover:border-teal-700/40 hover:text-teal-900"
              >
                Preview Austin free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
