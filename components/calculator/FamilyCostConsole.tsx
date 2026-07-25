"use client";

import Link from "next/link";
import { useMemo } from "react";
import PremiumCheckoutButton from "@/app/components/PremiumCheckoutButton";
import type { AgeBand } from "@/types/parenting";
import {
  estimate529MonthlySavings,
  estimateHouseholdCosts,
  estimateLifeInsuranceNeed,
  type EstimateCategoryKey,
} from "@/lib/consoleEstimate";
import {
  CURATED_LOCATIONS,
  formatUsd,
  useCostExperience,
  type ChildcareType,
} from "./CostExperienceContext";

/** Console-facing age brackets (maps to forecast AgeBands). */
const CARE_BRACKETS: {
  key: AgeBand | "schoolAge";
  label: string;
  hint: string;
  bands: AgeBand[];
}[] = [
  { key: "infant", label: "Infant", hint: "0–2 yrs", bands: ["infant"] },
  { key: "toddler", label: "Toddler", hint: "2–4 yrs", bands: ["toddler"] },
  {
    key: "schoolAge",
    label: "School-age",
    hint: "5+ yrs",
    bands: ["elementary", "teen"],
  },
];

const BREAKDOWN_META: {
  key: EstimateCategoryKey;
  label: string;
  bar: string;
}[] = [
  { key: "childcare", label: "Childcare", bar: "bg-teal-700" },
  { key: "housing", label: "Housing jump", bar: "bg-teal-500" },
  { key: "food", label: "Food", bar: "bg-teal-400" },
  { key: "healthcare", label: "Healthcare", bar: "bg-stone-500" },
  { key: "supplies", label: "Supplies", bar: "bg-stone-400" },
  { key: "other", label: "Other", bar: "bg-stone-300" },
];

/**
 * Sticky engagement console: live estimates, age/care inputs, lead triggers.
 */
export default function FamilyCostConsole() {
  const {
    baseline,
    ageCounts,
    familySize,
    childcareType,
    cityContext,
    cityLabel,
    updateAgeCount,
    updateFamilySize,
    updateChildcareType,
    setSchoolAgeCount,
    revealForecastChart,
  } = useCostExperience();

  const estimate = useMemo(
    () => estimateHouseholdCosts(baseline, ageCounts, childcareType),
    [ageCounts, baseline, childcareType],
  );

  const checkoutScenario = useMemo(
    () => ({
      intent: "pdf_report",
      cityContext,
      cityLabel,
      stateCode: baseline.stateCode || baseline.state,
      childCount: estimate.childCount,
      infantCount: ageCounts.infant,
      toddlerCount: ageCounts.toddler,
      schoolAgeCount: ageCounts.elementary + ageCounts.teen,
      familySize,
      childcareType,
      monthlyTotal: estimate.monthlyTotal,
      annualTotal: estimate.annualTotal,
    }),
    [
      ageCounts.elementary,
      ageCounts.infant,
      ageCounts.teen,
      ageCounts.toddler,
      baseline.state,
      baseline.stateCode,
      childcareType,
      cityContext,
      cityLabel,
      estimate.annualTotal,
      estimate.childCount,
      estimate.monthlyTotal,
      familySize,
    ],
  );

  const lifeCover = useMemo(
    () => estimateLifeInsuranceNeed(estimate.annualTotal),
    [estimate.annualTotal],
  );

  const collegePlan = useMemo(
    () =>
      estimate529MonthlySavings({
        childCount: Math.max(1, estimate.childCount),
        targetPerChild: Math.round(
          100_000 * baseline.healthcare.regionalIndex,
        ),
      }),
    [baseline.healthcare.regionalIndex, estimate.childCount],
  );

  const maxCategory = Math.max(
    ...BREAKDOWN_META.map((item) => estimate.monthly[item.key]),
    1,
  );

  function bracketCount(bands: AgeBand[]): number {
    return bands.reduce((sum, band) => sum + ageCounts[band], 0);
  }

  function setBracketCount(bands: AgeBand[], next: number) {
    const clamped = Math.max(0, Math.min(6, next));
    if (bands.length === 1) {
      updateAgeCount(bands[0], clamped);
      return;
    }
    setSchoolAgeCount(clamped);
  }

  return (
    <div id="family-cost-console" className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
            Live scenario
          </p>
          <h2 className="font-serif mt-1 text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
            Family cost console
          </h2>
        </div>
        <div className="shrink-0 rounded-xl border border-teal-100 bg-teal-50/80 px-2.5 py-1.5 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-teal-700">
            / month
          </p>
          <p className="font-serif text-base font-semibold text-stone-900 sm:text-lg">
            {formatUsd(estimate.monthlyTotal, true)}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        Adjust kids, ages, and care type — totals update instantly for{" "}
        {baseline.displayName}.
      </p>

      {/* Live totals + bar chart */}
      <div className="mt-4 rounded-xl border border-stone-200/70 bg-stone-50/80 p-3.5 sm:p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Monthly
            </p>
            <p className="font-serif text-2xl font-semibold text-stone-900">
              {formatUsd(estimate.monthlyTotal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Annual
            </p>
            <p className="font-serif text-2xl font-semibold text-stone-900">
              {formatUsd(estimate.annualTotal)}
            </p>
          </div>
        </div>

        <div
          className="mt-4 flex h-3 overflow-hidden rounded-full bg-stone-200/80"
          role="img"
          aria-label="Cost category breakdown"
        >
          {BREAKDOWN_META.map((item) => {
            const value = estimate.monthly[item.key];
            if (value <= 0) return null;
            const width = (value / estimate.monthlyTotal) * 100;
            return (
              <div
                key={item.key}
                className={`${item.bar} h-full transition-all duration-300`}
                style={{ width: `${Math.max(width, 1.5)}%` }}
                title={`${item.label}: ${formatUsd(value)}`}
              />
            );
          })}
        </div>

        <ul className="mt-3 space-y-2">
          {BREAKDOWN_META.map((item) => {
            const value = estimate.monthly[item.key];
            if (value <= 0) return null;
            const width = Math.round((value / maxCategory) * 100);
            return (
              <li key={item.key}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <span
                      className={`h-2 w-2 rounded-full ${item.bar}`}
                      aria-hidden
                    />
                    {item.label}
                  </span>
                  <span className="font-medium text-stone-900">
                    {formatUsd(value)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${item.bar} transition-all duration-300`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 space-y-5">
        {/* Location */}
        <div>
          <p className="text-sm font-medium text-stone-800">City / state</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
            {CURATED_LOCATIONS.map((loc) => {
              const active = baseline.locationId === loc.id;
              const shortLabels: Record<string, string> = {
                "new-york": "NYC",
                "los-angeles": "LA",
              };
              const shortLabel =
                shortLabels[loc.id] ?? loc.label.split(",")[0] ?? loc.label;
              return (
                <Link
                  key={loc.id}
                  href={loc.href}
                  prefetch
                  className={`rounded-xl border px-2 py-2 text-center text-[11px] transition sm:text-xs ${
                    active
                      ? "border-teal-500 bg-teal-50 font-semibold text-teal-900"
                      : "border-stone-200 bg-white text-stone-700 hover:border-teal-300 hover:text-teal-800"
                  }`}
                >
                  {shortLabel}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Family size */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="family-size"
              className="text-sm font-medium text-stone-800"
            >
              Household size
            </label>
            <span className="font-serif text-sm font-semibold text-teal-800">
              {familySize}
            </span>
          </div>
          <input
            id="family-size"
            type="range"
            min={1}
            max={12}
            value={familySize}
            onChange={(e) => updateFamilySize(Number(e.target.value))}
            className="mt-3 w-full accent-teal-700"
          />
          <p className="mt-1 text-xs text-stone-500">
            {estimate.childCount} child
            {estimate.childCount === 1 ? "" : "ren"} in scenario
          </p>
        </div>

        {/* Age brackets */}
        <div>
          <p className="text-sm font-medium text-stone-800">
            Kids by age bracket
          </p>
          <div className="mt-2.5 space-y-2">
            {CARE_BRACKETS.map((bracket) => {
              const count = bracketCount(bracket.bands);
              return (
                <div
                  key={bracket.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {bracket.label}
                    </p>
                    <p className="text-xs text-stone-500">{bracket.hint}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${bracket.label}`}
                      onClick={() => setBracketCount(bracket.bands, count - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-lg text-stone-700 transition active:scale-95 hover:border-teal-500 hover:text-teal-800"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-stone-900">
                      {count}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${bracket.label}`}
                      onClick={() => setBracketCount(bracket.bands, count + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-lg text-stone-700 transition active:scale-95 hover:border-teal-500 hover:text-teal-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Care preference */}
        <div>
          <p className="text-sm font-medium text-stone-800">
            Care preference
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {(
              [
                {
                  id: "public" as ChildcareType,
                  label: "Public",
                  hint: "Baseline rates",
                },
                {
                  id: "private" as ChildcareType,
                  label: "Private",
                  hint: "+65% care",
                },
              ] as const
            ).map((option) => {
              const active = childcareType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateChildcareType(option.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${
                    active
                      ? "border-teal-500 bg-teal-50 text-stone-900"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{option.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={revealForecastChart}
          className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800 active:scale-[0.99]"
        >
          Run 18-year Premium forecast
        </button>
      </div>

      {/* High-intent lead triggers */}
      <div className="mt-5 space-y-3 border-t border-stone-200/70 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Planning helpers
        </p>

        <div className="rounded-xl border border-stone-200/80 bg-white p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Life insurance needs
          </p>
          <p className="font-serif mt-1 text-xl font-semibold text-stone-900">
            {formatUsd(lifeCover, true)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            Rule-of-thumb coverage ≈ 10× your estimated annual parenting spend (
            {formatUsd(estimate.annualTotal)}). Not advice — compare quotes with
            a licensed agent.
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-white p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            529 college savings goal
          </p>
          <p className="font-serif mt-1 text-xl font-semibold text-stone-900">
            {formatUsd(collegePlan.monthlySavings)}
            <span className="ml-1 font-sans text-xs font-medium text-stone-500">
              / mo
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            To reach ~{formatUsd(collegePlan.targetTotal, true)} over{" "}
            {collegePlan.years} years for {Math.max(1, estimate.childCount)}{" "}
            child{estimate.childCount === 1 ? "" : "ren"} (metro-scaled target).
            Actual returns vary.
          </p>
        </div>

        <PremiumCheckoutButton
          cityContext={cityContext}
          scenario={checkoutScenario}
          variant="lightOutline"
          className="border-teal-700/30 bg-teal-50 text-teal-900 hover:border-teal-700 hover:bg-teal-100"
        >
          Download detailed PDF budget report
        </PremiumCheckoutButton>
        <p className="text-center text-[11px] text-stone-500">
          Checkout via Stripe · Lifetime Premium + report access ·{" "}
          {formatUsd(estimate.monthlyTotal)}/mo scenario
        </p>
      </div>
    </div>
  );
}
