import Link from "next/link";
import PremiumCheckoutButton from "../components/PremiumCheckoutButton";
import { FREE_PLAN, PREMIUM_PLAN } from "../utils/pricing";

export const metadata = {
  title: "Pricing — Before You Move There",
  description:
    "Free neighborhood previews and a $29 lifetime premium pass for true cost, hazard, and commute intelligence.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
              BY
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              Before You Move There
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition hover:text-emerald-400"
          >
            Back to search
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            One price. Lifetime access.
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Pay once,
            <span className="block text-emerald-400">research forever</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Start free with open-access neighborhood scores. Unlock the full relocation brief
            with a single $29 lifetime pass — no subscriptions, no surprise renewals.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          <PricingCard
            name={FREE_PLAN.name}
            price={FREE_PLAN.price}
            period={FREE_PLAN.period}
            description={FREE_PLAN.description}
            features={FREE_PLAN.features}
            cta={FREE_PLAN.cta}
            ctaHref="/#preview"
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
              <PremiumCheckoutButton variant="darkPrimary">
                {PREMIUM_PLAN.cta}
              </PremiumCheckoutButton>
            }
          />
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-sm text-slate-500">
            One-time payment · Lifetime access on your account · Secure checkout via Stripe
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium uppercase tracking-wider text-slate-600">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              SSL encrypted
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              No hidden fees
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Instant access
            </span>
          </div>
        </div>
      </main>
    </div>
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
      className={`relative flex flex-col rounded-3xl border p-8 sm:p-10 ${
        highlighted
          ? "border-emerald-500/50 bg-gradient-to-b from-emerald-950/50 to-slate-900 shadow-2xl shadow-emerald-900/20 ring-2 ring-emerald-500/30"
          : "border-white/10 bg-slate-900/80 shadow-xl"
      }`}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/40">
          {badge}
        </span>
      )}
      <h2 className="text-xl font-semibold text-white">{name}</h2>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight text-white">{price}</span>
        <span className="text-slate-400">/{period}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">{description}</p>
      <ul className="mt-8 flex-1 space-y-3.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
            <svg
              className={`mt-0.5 h-5 w-5 shrink-0 ${highlighted ? "text-emerald-400" : "text-slate-500"}`}
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
              ? "bg-emerald-500 text-white hover:bg-emerald-400"
              : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          {cta}
        </Link>
      )}
    </article>
  );
}
