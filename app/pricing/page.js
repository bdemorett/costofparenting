import Link from "next/link";
import PremiumCheckoutButton from "../components/PremiumCheckoutButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { FREE_PLAN, PREMIUM_PLAN } from "../utils/pricing";

export const metadata = {
  title: "Pricing",
  description:
    "Free location cost previews and a $29 lifetime premium pass for hyper-localized 18-year parenting cost forecasts.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-800">
            <span className="h-2 w-2 rounded-full bg-teal-700" />
            One price. Lifetime access.
          </p>
          <h1 className="font-serif mt-5 text-4xl font-semibold tracking-tight text-stone-900 sm:mt-6 sm:text-5xl">
            Pay once,
            <span className="block text-teal-800">plan for eighteen years</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">
            City baselines stay free. Unlock a full hyper-localized parenting cost
            forecast with a single $29 lifetime pass — no subscriptions.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:mt-14 sm:gap-8 lg:grid-cols-2">
          <PricingCard
            name={FREE_PLAN.name}
            price={FREE_PLAN.price}
            period={FREE_PLAN.period}
            description={FREE_PLAN.description}
            features={FREE_PLAN.features}
            cta={FREE_PLAN.cta}
            ctaHref="/cost-of-parenting/tx/austin"
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

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-sm text-stone-500">
            One-time payment · Lifetime access on your account · Secure checkout via
            Stripe
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium uppercase tracking-wider text-stone-500">
            <span className="flex items-center gap-2">
              <TrustIcon />
              SSL encrypted
            </span>
            <span className="flex items-center gap-2">
              <TrustIcon />
              No hidden fees
            </span>
            <span className="flex items-center gap-2">
              <TrustIcon />
              Instant access
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustIcon() {
  return (
    <svg className="h-4 w-4 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
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
      className={`relative flex flex-col rounded-2xl border p-6 shadow-pillow sm:p-8 ${
        highlighted
          ? "border-teal-200 bg-white ring-2 ring-teal-700/15"
          : "border-stone-200/60 bg-white"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-700 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
          {badge}
        </span>
      )}
      <h2 className="font-serif text-xl font-semibold text-stone-900">{name}</h2>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          {price}
        </span>
        <span className="font-sans text-sm text-stone-500">/{period}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{description}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-stone-700">
            <svg
              className={`mt-0.5 h-5 w-5 shrink-0 ${highlighted ? "text-teal-700" : "text-stone-400"}`}
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
        <div className="mt-7">{ctaElement}</div>
      ) : (
        <Link href={ctaHref} className="btn-pill-outline mt-7 w-full">
          {cta}
        </Link>
      )}
    </article>
  );
}
