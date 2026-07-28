import DaycareLeadCard from "@/app/components/DaycareLeadCard";

export interface RevenueEngineProps {
  cityName: string;
  stateName: string;
  calculatedMonthlyCost?: number;
}

function affiliateLifeUrl(stateName: string): string {
  const base =
    process.env.NEXT_PUBLIC_LIFE_INSURANCE_AFFILIATE_URL?.trim() ||
    "https://www.policygenius.com/life-insurance/";
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "costofparenting");
    url.searchParams.set("utm_medium", "affiliate");
    url.searchParams.set("utm_campaign", "term_life");
    url.searchParams.set("state", stateName);
    return url.toString();
  } catch {
    return base;
  }
}

function affiliate529Url(stateName: string): string {
  const base =
    process.env.NEXT_PUBLIC_529_AFFILIATE_URL?.trim() ||
    "https://www.savingforcollege.com/529-plans/";
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "costofparenting");
    url.searchParams.set("utm_medium", "affiliate");
    url.searchParams.set("utm_campaign", "529_planning");
    url.searchParams.set("state", stateName);
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Server-rendered monetization grid with a client daycare lead island.
 * Cards: local daycare capture, term life affiliate, 529 planning CTA.
 */
export default function RevenueEngine({
  cityName,
  stateName,
  calculatedMonthlyCost,
}: RevenueEngineProps) {
  const lifeHref = affiliateLifeUrl(stateName);
  const collegeHref = affiliate529Url(stateName);

  return (
    <section
      id="local-offers"
      className="rounded-2xl border border-stone-200/50 bg-cream-muted/40 p-5 sm:p-7"
      aria-labelledby="revenue-engine-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Family planning offers
      </p>
      <h2
        id="revenue-engine-heading"
        className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
      >
        Next steps for {cityName} families
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        Pair your cost estimate with local care openings, life coverage, and{" "}
        {stateName} college-savings options.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <DaycareLeadCard
          cityName={cityName}
          stateName={stateName}
          calculatedMonthlyCost={calculatedMonthlyCost}
        />

        <article className="flex h-full flex-col rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
            Term life
          </p>
          <h3 className="font-serif mt-2 text-xl font-semibold tracking-tight text-stone-900">
            Protect Your Family in {stateName}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
            Compare 30-second term life insurance quotes starting at $15/month.
          </p>
          <a
            href={lifeHref}
            target="_blank"
            rel="noopener sponsored"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-teal-700/30 bg-teal-50 px-5 py-2.5 text-sm font-medium text-teal-900 transition-colors hover:border-teal-700 hover:bg-teal-100"
          >
            Compare term life quotes
          </a>
        </article>

        <article className="flex h-full flex-col rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
            529 &amp; college
          </p>
          <h3 className="font-serif mt-2 text-xl font-semibold tracking-tight text-stone-900">
            Optimize {stateName} 529 Tax Advantages
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
            See how much you can save on state taxes while building your
            child&apos;s college fund.
          </p>
          <a
            href={collegeHref}
            target="_blank"
            rel="noopener sponsored"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-stone-200 bg-cream px-5 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:border-teal-700/40 hover:text-teal-900"
          >
            Explore {stateName} 529 options
          </a>
        </article>
      </div>
    </section>
  );
}
