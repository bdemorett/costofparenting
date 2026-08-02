"use client";

export type FinancialOfferId = "term_life" | "college_529" | "estate_planning";

export interface FinancialLeadCtaProps {
  cityName: string;
  stateName?: string;
  /** Optional placement label for UTM content / analytics. */
  placement?: string;
}

type OfferConfig = {
  id: FinancialOfferId;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  campaign: string;
  href: string;
};

function resolveEnvUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function buildAffiliateUrl(
  base: string,
  params: {
    campaign: string;
    cityName: string;
    stateName?: string;
    placement: string;
    offerId: FinancialOfferId;
  },
): string {
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "costofparenting");
    url.searchParams.set("utm_medium", "affiliate");
    url.searchParams.set("utm_campaign", params.campaign);
    url.searchParams.set("utm_content", params.placement);
    url.searchParams.set(
      "utm_term",
      params.cityName.toLowerCase().replace(/\s+/g, "-"),
    );
    url.searchParams.set("city", params.cityName);
    if (params.stateName) url.searchParams.set("state", params.stateName);
    url.searchParams.set("offer", params.offerId);
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Placeholder conversion hook — swap for Segment/GA4/affiliate pixels later.
 * Fires a CustomEvent and optional gtag event before navigation.
 */
export function trackFinancialLeadClick(detail: {
  offerId: FinancialOfferId;
  cityName: string;
  stateName?: string;
  placement: string;
  href: string;
}): void {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent("cop:financial_lead_click", { detail }),
    );
  } catch {
    // Ignore environments without CustomEvent support.
  }

  const gtag = (
    window as Window & {
      gtag?: (...args: unknown[]) => void;
    }
  ).gtag;

  if (typeof gtag === "function") {
    gtag("event", "affiliate_click", {
      event_category: "financial_lead_cta",
      event_label: detail.offerId,
      city: detail.cityName,
      state: detail.stateName,
      placement: detail.placement,
      transport_type: "beacon",
    });
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[FinancialLeadCta] click", detail);
  }
}

/**
 * High-converting family-finance CTA card for expense breakdown views.
 * Term life, 529 / junior investing, and estate planning with UTM attribution.
 */
export default function FinancialLeadCta({
  cityName,
  stateName,
  placement = "expense_breakdown",
}: FinancialLeadCtaProps) {
  const lifeBase = resolveEnvUrl(
    process.env.NEXT_PUBLIC_LIFE_INSURANCE_AFFILIATE_URL,
    "https://www.policygenius.com/life-insurance/",
  );
  const collegeBase = resolveEnvUrl(
    process.env.NEXT_PUBLIC_529_AFFILIATE_URL,
    "https://www.savingforcollege.com/529-plans/",
  );
  const estateBase = resolveEnvUrl(
    process.env.NEXT_PUBLIC_ESTATE_PLANNING_AFFILIATE_URL,
    "https://www.legalzoom.com/personal/estate-planning/last-will-and-testament-overview.html",
  );

  const offers: OfferConfig[] = [
    {
      id: "term_life",
      eyebrow: "Term life",
      title: `Protect your family in ${cityName}`,
      body: "Compare term life rates with zero medical exam — quotes in about 30 seconds, often starting near $15/month.",
      cta: "Compare term life rates",
      campaign: "term_life",
      href: buildAffiliateUrl(lifeBase, {
        campaign: "term_life",
        cityName,
        stateName,
        placement,
        offerId: "term_life",
      }),
    },
    {
      id: "college_529",
      eyebrow: "529 & junior investing",
      title: `Build ${cityName} college & kid investing plans`,
      body:
        stateName != null
          ? `Explore ${stateName} 529 tax advantages and junior investing apps that automate small monthly contributions.`
          : "Explore 529 college plans and junior investing apps that automate small monthly contributions.",
      cta: "See 529 & investing options",
      campaign: "529_junior_investing",
      href: buildAffiliateUrl(collegeBase, {
        campaign: "529_junior_investing",
        cityName,
        stateName,
        placement,
        offerId: "college_529",
      }),
    },
    {
      id: "estate_planning",
      eyebrow: "Wills & estate planning",
      title: "Lock in guardianship & a basic will",
      body: "Create a simple will, name guardians, and organize essentials — a practical next step once baby costs are on the calendar.",
      cta: "Start estate planning",
      campaign: "estate_planning_wills",
      href: buildAffiliateUrl(estateBase, {
        campaign: "estate_planning_wills",
        cityName,
        stateName,
        placement,
        offerId: "estate_planning",
      }),
    },
  ];

  return (
    <aside
      id="financial-lead-cta"
      className="mt-8 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-cream px-4 py-5 sm:px-6 sm:py-6"
      aria-labelledby="financial-lead-cta-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Family finance next steps
      </p>
      <h3
        id="financial-lead-cta-heading"
        className="font-serif mt-1.5 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
      >
        Protect income, save for college, and put paperwork in place
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        After seeing where {cityName} dollars go, these trusted planning tools
        help cover the gaps expense tables do not show.
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {offers.map((offer) => (
          <article
            key={offer.id}
            className="flex flex-col rounded-xl border border-stone-200/70 bg-white/95 p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
              {offer.eyebrow}
            </p>
            <h4 className="font-serif mt-1.5 text-base font-semibold text-stone-900">
              {offer.title}
            </h4>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-600">
              {offer.body}
            </p>
            <a
              href={offer.href}
              target="_blank"
              rel="noopener sponsored"
              data-offer={offer.id}
              data-placement={placement}
              data-city={cityName}
              onClick={() =>
                trackFinancialLeadClick({
                  offerId: offer.id,
                  cityName,
                  stateName,
                  placement,
                  href: offer.href,
                })
              }
              className="mt-4 inline-flex items-center justify-center rounded-full bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              {offer.cta}
            </a>
          </article>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-stone-500">
        Some links are partner offers. We may earn a commission at no extra cost
        to you. Always compare coverage and fees independently.
      </p>
    </aside>
  );
}
