import Link from "next/link";
import NeighborhoodSearch from "./components/NeighborhoodSearch";
import AuthNav from "./components/AuthNav";
import PremiumHeaderCta from "./components/PremiumHeaderCta";
import PremiumCheckoutButton from "./components/PremiumCheckoutButton";
import AdSenseUnit from "./components/AdSenseUnit";
import AgentMatchForm from "./components/AgentMatchForm";
import { FREE_PLAN, PREMIUM_PLAN } from "./utils/pricing";
import { getAdSenseSlots } from "./utils/adsense";
import { normalizeSiteUrl } from "./utils/siteUrl";

const adSlots = getAdSenseSlots();
const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const metadata = {
  title: "Before You Move There — Neighborhood Intelligence",
  description:
    "Research US neighborhoods before you move. Free safety, school, and environmental scores plus premium relocation intelligence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Before You Move There — Neighborhood Intelligence",
    description:
      "Research US neighborhoods before you move. Free safety, school, and environmental scores plus premium relocation intelligence.",
    url: siteUrl,
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              BY
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Before You Move There
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#preview" className="transition hover:text-emerald-600">
              Neighborhood Data
            </a>
            <a href="#agents" className="transition hover:text-emerald-600">
              Find an Agent
            </a>
            <a href="#pricing" className="transition hover:text-emerald-600">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <AuthNav variant="light" />
            <PremiumHeaderCta variant="light" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.25),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.15),transparent_40%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Analyzing data for over 10,000+ US neighborhoods
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Know every neighborhood
              <span className="block text-emerald-400">before you move there</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Instant insights on safety, schools, and cost of living — so you
              can choose the right place with confidence, not guesswork.
            </p>

            <NeighborhoodSearch />
            <p className="mt-4 text-sm text-slate-400">
              Popular:{" "}
              <Link href="/move-to/tx/austin" className="text-emerald-300 underline-offset-2 hover:underline">
                Austin TX
              </Link>
              {" · "}
              <Link href="/move-to/ny/new-york" className="text-emerald-300 underline-offset-2 hover:underline">
                New York
              </Link>
              {" · "}
              <Link href="/move-to/fl/miami" className="text-emerald-300 underline-offset-2 hover:underline">
                Miami
              </Link>
              {" · "}
              <Link href="/move-to/wa/seattle" className="text-emerald-300 underline-offset-2 hover:underline">
                Seattle
              </Link>
              {" · "}
              <Link href="/move-to/il/chicago" className="text-emerald-300 underline-offset-2 hover:underline">
                Chicago
              </Link>
            </p>
          </div>
        </section>

        {/* Data preview grid */}
        <section id="preview" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See what matters most
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Every neighborhood report includes the data families and
              professionals rely on when making a move.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <DataCard
              icon="shield"
              title="Safety Score"
              score="82/100"
              badge="Above Average"
              badgeColor="emerald"
              stats={[
                { label: "Crime rate", value: "12% below national avg" },
                { label: "Walkability", value: "78 — Very Walkable" },
                { label: "Night safety", value: "Low concern" },
              ]}
            />
            <DataCard
              icon="school"
              title="Schools"
              score="A- District"
              badge="Top 15% in state"
              badgeColor="blue"
              stats={[
                { label: "Elementary", value: "9/10 — Lincoln Park ES" },
                { label: "Middle school", value: "8/10 — Riverside MS" },
                { label: "High school", value: "9/10 — Central HS" },
              ]}
            />
            <DataCard
              icon="cost"
              title="Cost of Living"
              score="$2,840/mo"
              badge="Median rent"
              badgeColor="amber"
              stats={[
                { label: "vs. national avg", value: "+8% higher" },
                { label: "Median home price", value: "$425,000" },
                { label: "Property tax rate", value: "1.82%" },
              ]}
            />
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Sample preview for <span className="font-medium text-slate-700">Austin, TX 78704</span>.
            Unlock full reports with the Lifetime Premium Pass.
          </p>
          <div className="mx-auto mt-10 max-w-4xl">
            <AdSenseUnit
              slot={adSlots.leaderboard}
              theme="light"
              placeholderLabel="Advertisement"
            />
          </div>
        </section>

        {/* Find a Local Agent */}
        <section id="agents" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50 shadow-xl shadow-slate-200/50">
              <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-10 sm:p-14">
                  <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                    Free agent matching
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Find a local agent who knows your target area
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">
                    Get matched with vetted relocation specialists who live and
                    work in the neighborhoods you&apos;re researching. No
                    obligation — just expert guidance when you&apos;re ready to
                    buy or rent.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {[
                      "Licensed agents in your target market",
                      "Personalized to your zip code and timeline",
                      "No obligation to work with a matched agent",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-slate-700">
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-slate-200 bg-white p-10 sm:p-14 lg:border-l lg:border-t-0">
                  <AgentMatchForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Start with a free preview. Pay once for lifetime access when you&apos;re ready
              for true cost, hazard, and commute intelligence.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <PricingCard
              name={FREE_PLAN.name}
              price={FREE_PLAN.price}
              period={FREE_PLAN.period}
              description={FREE_PLAN.description}
              features={FREE_PLAN.features}
              cta={FREE_PLAN.cta}
              ctaHref="#preview"
              highlighted={false}
            />
            <PricingCard
              name={PREMIUM_PLAN.name}
              price={PREMIUM_PLAN.price}
              period={PREMIUM_PLAN.period}
              description={PREMIUM_PLAN.description}
              features={PREMIUM_PLAN.features}
              cta={PREMIUM_PLAN.cta}
              highlighted={true}
              badge={PREMIUM_PLAN.badge}
              ctaElement={
                <PremiumCheckoutButton variant="lightPrimary">
                  {PREMIUM_PLAN.cta}
                </PremiumCheckoutButton>
              }
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Before You Move There. All rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <Link href="/privacy-policy" className="transition hover:text-emerald-600">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="transition hover:text-emerald-600">
              Terms
            </Link>
            <Link href="/about" className="transition hover:text-emerald-600">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-emerald-600">
              Contact
            </Link>
            <Link href="/pricing" className="transition hover:text-emerald-600">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DataCard({ icon, title, score, badge, badgeColor, stats }) {
  const badgeClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };

  const icons = {
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
    school: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
      />
    ),
    cost: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            {icons[icon]}
          </svg>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[badgeColor]}`}
        >
          {badge}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-3xl font-bold text-slate-900">{score}</p>
      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
        {stats.map((stat) => (
          <li
            key={stat.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-500">{stat.label}</span>
            <span className="font-medium text-slate-800">{stat.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  ctaElement,
  highlighted,
  badge,
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-8 ${
        highlighted
          ? "border-emerald-500 bg-gradient-to-b from-emerald-50 to-white shadow-xl shadow-emerald-100/60 ring-2 ring-emerald-500/20"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
        <span className="text-slate-500">/{period}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
      <ul className="mt-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
            <svg
              className={`mt-0.5 h-5 w-5 shrink-0 ${highlighted ? "text-emerald-500" : "text-slate-400"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      {ctaElement ? (
        <div className="mt-8">{ctaElement}</div>
      ) : (
        <Link
          href={ctaHref}
          className={`mt-8 block rounded-xl py-4 text-center text-sm font-bold transition ${
            highlighted
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          {cta}
        </Link>
      )}
    </article>
  );
}
