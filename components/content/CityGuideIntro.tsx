import type { LocationBaseline } from "@/types/parenting";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import { monthlyToAnnual, sumStageMonthly } from "@/lib/mockData";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface CityGuideIntroProps {
  cityLabel: string;
  state: string;
  baseline: LocationBaseline;
  stateSlug: string;
  citySlug: string;
}

/**
 * Server-rendered SEO guide intro using deep city baseline fields.
 */
export default function CityGuideIntro({
  cityLabel,
  state,
  baseline,
  stateSlug,
  citySlug,
}: CityGuideIntroProps) {
  const infantMonthly = sumStageMonthly(baseline.stageMonthly.infant);
  const housingJump = baseline.housing.familyPremiumMonthly;
  const foodMonthly = baseline.foodAndSupplies.foodPerChild;
  const medicalMonthly =
    baseline.healthcare.employerFamilyPremiumMonthly +
    baseline.healthcare.outOfPocketPerChildMonthly;

  const cityName = cityLabel.split(",")[0]?.trim() || cityLabel;

  return (
    <header className="border-b border-stone-200/60 pb-8">
      <Breadcrumbs
        stateName={state}
        stateSlug={stateSlug}
        cityName={cityName}
        citySlug={citySlug}
      />

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
        Localized parenting cost guide
      </p>
      <h1 className="font-serif mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
        Cost of Parenting in {cityLabel}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600 sm:text-lg">
        A practical guide to raising kids in {cityLabel}, {state}: stage-based
        childcare (infant through school age), the housing jump from a 1–2 bed
        to a family home, food and supplies, and healthcare factors — plus a
        calculator to build your own 18-year roadmap.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GuideStat
          label="Infant care / mo"
          value={formatUsd(infantMonthly)}
          hint="0–2 yrs stage total"
        />
        <GuideStat
          label="Housing jump / mo"
          value={formatUsd(housingJump)}
          hint={`1–2 bed → 3+ (${baseline.housing.tenure})`}
        />
        <GuideStat
          label="Food / child / mo"
          value={formatUsd(foodMonthly)}
          hint="School-age grocery share"
        />
        <GuideStat
          label="Family medical / mo"
          value={formatUsd(medicalMonthly)}
          hint="Premium contrib. + child OOP"
        />
      </dl>

      <p className="mt-4 text-xs text-stone-500">
        Data vintage {baseline.updatedAt}. Infant annualized ≈{" "}
        {formatUsd(monthlyToAnnual(infantMonthly))}. Illustrative baselines —
        verify local rates before major decisions.
      </p>
    </header>
  );
}

function GuideStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/60 bg-white px-4 py-3 shadow-sm">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </dt>
      <dd className="font-serif mt-1 text-2xl font-semibold text-stone-900">
        {value}
      </dd>
      <p className="mt-0.5 text-xs text-stone-500">{hint}</p>
    </div>
  );
}
