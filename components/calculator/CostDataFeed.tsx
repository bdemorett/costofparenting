"use client";

import type { ReactNode } from "react";
import PremiumCheckoutButton from "@/app/components/PremiumCheckoutButton";
import type { CostBreakdown } from "@/types/parenting";
import {
  PAYWALL_FEATURES,
  buildHouseholdYearlyTotals,
  formatUsd,
  useCostExperience,
} from "./CostExperienceContext";

const TEASER_METRICS: {
  key: keyof Pick<
    CostBreakdown,
    "childcare" | "food" | "healthcare" | "housing"
  >;
  label: string;
  blurb: string;
}[] = [
  {
    key: "childcare",
    label: "Childcare",
    blurb: "Annual daycare / early care baseline",
  },
  {
    key: "food",
    label: "Food",
    blurb: "Household food attributable to one child",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    blurb: "Insurance share + routine care",
  },
  {
    key: "housing",
    label: "Housing premium",
    blurb: "Extra space cost for raising a child",
  },
];

export interface CostDataFeedProps {
  editorial?: ReactNode;
}

/**
 * Scrollable right-column feed: public metrics, progress bars, forecast chart,
 * and optional authority editorial.
 */
export default function CostDataFeed({ editorial }: CostDataFeedProps) {
  const {
    baseline,
    cityLabel,
    isCurated,
    showPaywall,
    chartRevealed,
    forecast,
    fetchError,
    isPending,
    subscribed,
    cityContext,
    baselineTeaserTotal,
    revealForecastChart,
    setShowPaywall,
  } = useCostExperience();

  const yearlyTotals = forecast ? buildHouseholdYearlyTotals(forecast) : [];
  const maxYearly = Math.max(...yearlyTotals, 1);
  const maxCategory = Math.max(
    ...TEASER_METRICS.map((m) => baseline.annualCosts[m.key]),
    1,
  );

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-stone-200/60 pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
            Dashboard feed
          </p>
          <h2 className="font-serif mt-2 text-[1.75rem] font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Local baselines & Premium forecast
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Annual school-age snapshot for {cityLabel} — plus a Premium 18-year
            outlook when you&apos;re ready.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Core annual total
          </p>
          <p className="font-serif mt-0.5 text-2xl font-semibold text-stone-900">
            {formatUsd(baselineTeaserTotal)}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            Updated {baseline.updatedAt}
          </p>
        </div>
      </header>

      {isCurated ? (
        <div className="rounded-xl border border-teal-200/70 bg-teal-50/70 px-4 py-3.5">
          <p className="text-sm font-semibold text-teal-900">
            Curated {cityLabel} baseline
          </p>
          <p className="mt-0.5 text-sm text-teal-800/90">
            Free annual cost snapshot. Interactive forecasts unlock with
            Premium.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <p className="text-sm font-semibold text-amber-900">
            Using nearest curated baseline
          </p>
          <p className="mt-0.5 text-sm text-amber-800/80">
            Showing {baseline.displayName} while we expand city coverage.
          </p>
        </div>
      )}

      <section className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Where the money goes
          </h2>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Share of core total
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {TEASER_METRICS.map((metric) => {
            const value = baseline.annualCosts[metric.key];
            const share = Math.round((value / maxCategory) * 100);
            const ofTotal = Math.round((value / baselineTeaserTotal) * 100);

            return (
              <div key={metric.key}>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {metric.label}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {metric.blurb}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl font-semibold text-stone-900">
                      {formatUsd(value)}
                    </p>
                    <p className="text-[11px] font-medium text-teal-800">
                      {ofTotal}% of core / yr
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-800 to-teal-500 transition-all duration-500"
                    style={{ width: `${share}%` }}
                    role="progressbar"
                    aria-valuenow={share}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${metric.label} relative scale`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-stone-900">
              18-year premium forecast
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Inflation-aware household outlook — year by year as kids age.
            </p>
          </div>
          {!chartRevealed && (
            <button
              type="button"
              onClick={revealForecastChart}
              className="shrink-0 rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
            >
              View premium chart
            </button>
          )}
        </div>

        {fetchError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {fetchError}
          </div>
        )}

        {isPending && (
          <div className="mt-6 flex items-center gap-3 text-sm text-teal-800">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
            Calculating your localized 18-year outlook…
          </div>
        )}

        {subscribed && chartRevealed && forecast ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill
                label="Horizon total"
                value={formatUsd(forecast.householdTenYearTotal, true)}
              />
              <StatPill
                label="Children modeled"
                value={String(forecast.children.length)}
              />
              <StatPill
                label="Avg / year"
                value={formatUsd(
                  forecast.householdTenYearTotal /
                    Math.max(forecast.horizonYears, 1),
                  true,
                )}
              />
            </div>

            <div className="h-56 sm:h-64">
              <div className="flex h-full items-end gap-1 sm:gap-1.5">
                {yearlyTotals.map((total, index) => {
                  const height = `${Math.max(8, (total / maxYearly) * 100)}%`;
                  return (
                    <div
                      key={
                        forecast.children[0]?.yearly[index]?.calendarYear ??
                        index
                      }
                      className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-teal-800 to-teal-500 transition group-hover:from-teal-700 group-hover:to-teal-400"
                        style={{ height }}
                        title={formatUsd(total)}
                      />
                      <span className="mt-2 hidden text-[9px] text-stone-500 sm:block">
                        {String(
                          forecast.children[0]?.yearly[index]?.calendarYear ??
                            "",
                        ).slice(2)}
                      </span>
                      <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg bg-stone-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block">
                        {formatUsd(total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Childcare", forecast.householdCategoryTotals.childcare],
                  ["Housing", forecast.householdCategoryTotals.housing],
                  ["Food", forecast.householdCategoryTotals.food],
                  ["Healthcare", forecast.householdCategoryTotals.healthcare],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3"
                >
                  <span className="text-sm text-stone-600">
                    {label} (18-yr)
                  </span>
                  <span className="text-sm font-semibold text-stone-900">
                    {formatUsd(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : showPaywall ? (
          <div className="relative mt-6">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 select-none opacity-30 blur-md"
              aria-hidden
            >
              <div className="flex h-40 items-end gap-1.5 sm:h-52">
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-teal-600/70"
                    style={{ height: `${30 + ((i * 17) % 55)}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="relative z-10 flex justify-center py-1">
              <PaywallCard
                cityLabel={cityLabel}
                cityContext={cityContext}
                onDismiss={() => setShowPaywall(false)}
              />
            </div>
          </div>
        ) : (
          <div className="relative mt-6 min-h-[280px] overflow-hidden rounded-xl">
            <div
              className="pointer-events-none select-none opacity-40 blur-md"
              aria-hidden
            >
              <div className="flex h-52 items-end gap-1.5">
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-teal-600/70"
                    style={{ height: `${30 + ((i * 17) % 55)}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="max-w-md rounded-2xl border border-stone-200 bg-white/95 px-6 py-5 text-center shadow-xl backdrop-blur">
                <p className="text-sm font-semibold text-stone-900">
                  Premium forecast locked
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Adjust family inputs in the console or tap &ldquo;View
                  premium chart&rdquo; to unlock your hyper-localized 18-year
                  outlook.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {editorial}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="font-serif mt-1 text-xl font-semibold text-stone-900">
        {value}
      </p>
    </div>
  );
}

function PaywallCard({
  cityLabel,
  cityContext,
  onDismiss,
}: {
  cityLabel: string;
  cityContext: string;
  onDismiss: () => void;
}) {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-teal-200 bg-white shadow-2xl shadow-teal-900/10">
      <div className="border-b border-teal-100 bg-teal-50 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-800">
          Lifetime Premium Pass
        </p>
        <h3 className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900">
          Unlock {cityLabel}&apos;s full parenting cost engine
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          One payment. Lifetime access. See exactly what raising kids costs
          here — year by year.
        </p>
      </div>

      <div className="px-6 py-5 pb-6">
        <ul className="space-y-3">
          {PAYWALL_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-stone-700"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-serif text-4xl font-semibold text-stone-900">
            $29
          </span>
          <span className="text-sm text-stone-500">one-time · lifetime</span>
        </div>

        <div className="mt-5 space-y-3">
          <PremiumCheckoutButton
            cityContext={cityContext}
            variant="lightPrimary"
          >
            Unlock Premium Forecast
          </PremiumCheckoutButton>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-full border border-stone-200 px-6 py-3 text-sm font-medium text-stone-500 transition-all hover:border-stone-300 hover:text-stone-700"
          >
            Keep browsing free teaser
          </button>
        </div>
      </div>
    </div>
  );
}
