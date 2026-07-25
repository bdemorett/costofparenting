"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useMemo, useState } from "react";
import BudgetExportModal from "@/components/calculator/BudgetExportModal";
import type { LeadCaptureBudgetSummary } from "@/types/leadCapture";

export type CostCalculatorDataset = {
  housing: number;
  food: number;
  healthcare: number;
  childcare: number;
  clothing: number;
  education: number;
};

export type ChildCountOption = 1 | 2 | 3 | 4;
export type AgeCategory = "infant" | "toddler" | "schoolAge" | "teenager";
export type CareType = "inHome" | "center" | "publicSchool";

export interface CostCalculatorProps {
  cityName: string;
  stateName: string;
  stateSlug: string;
  citySlug: string;
  /** Annual USD category baselines for the city (school-age reference). */
  dataset: CostCalculatorDataset;
  /** Optional deep-link for city comparison (defaults to nearby section). */
  compareHref?: string;
}

const CHILD_OPTIONS: { value: ChildCountOption; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

const AGE_OPTIONS: { value: AgeCategory; label: string; hint: string }[] = [
  { value: "infant", label: "Infant", hint: "0–2" },
  { value: "toddler", label: "Toddler", hint: "2–4" },
  { value: "schoolAge", label: "School-Age", hint: "5–12" },
  { value: "teenager", label: "Teenager", hint: "13–17" },
];

const CARE_OPTIONS: { value: CareType; label: string }[] = [
  { value: "inHome", label: "In-Home" },
  { value: "center", label: "Center-Based Daycare" },
  { value: "publicSchool", label: "Public School" },
];

const AGE_CATEGORY_MULTIPLIERS: Record<
  AgeCategory,
  Record<keyof CostCalculatorDataset, number>
> = {
  infant: {
    housing: 1,
    food: 0.85,
    healthcare: 1.15,
    childcare: 1.45,
    clothing: 0.9,
    education: 0.35,
  },
  toddler: {
    housing: 1,
    food: 0.95,
    healthcare: 1.05,
    childcare: 1.25,
    clothing: 0.95,
    education: 0.55,
  },
  schoolAge: {
    housing: 1,
    food: 1,
    healthcare: 1,
    childcare: 1,
    clothing: 1,
    education: 1,
  },
  teenager: {
    housing: 1,
    food: 1.2,
    healthcare: 1.05,
    childcare: 0.55,
    clothing: 1.2,
    education: 1.35,
  },
};

/** Care-type scalar applied to the childcare line only. */
const CARE_CHILDCARE_MULTIPLIERS: Record<CareType, number> = {
  inHome: 1.35,
  center: 1,
  publicSchool: 0.28,
};

const BREAKDOWN_META: {
  key: keyof CostCalculatorDataset;
  label: string;
  bar: string;
}[] = [
  { key: "childcare", label: "Childcare", bar: "bg-teal-700" },
  { key: "housing", label: "Housing", bar: "bg-teal-500" },
  { key: "food", label: "Food", bar: "bg-teal-400" },
  { key: "healthcare", label: "Healthcare", bar: "bg-stone-500" },
  { key: "education", label: "Education", bar: "bg-stone-400" },
  { key: "clothing", label: "Clothing", bar: "bg-stone-300" },
];

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function annualToMonthly(annual: number): number {
  return annual / 12;
}

/**
 * Scales city annual baselines by household size, age band, and care type.
 */
export function recalculateCosts(
  dataset: CostCalculatorDataset,
  childCount: ChildCountOption,
  ageCategory: AgeCategory,
  careType: CareType,
): {
  monthly: CostCalculatorDataset;
  annual: CostCalculatorDataset;
  monthlyTotal: number;
  annualTotal: number;
} {
  const ageMult = AGE_CATEGORY_MULTIPLIERS[ageCategory];
  const careMult = CARE_CHILDCARE_MULTIPLIERS[careType];
  /** Housing grows slower than headcount (shared roof). */
  const housingScale = 1 + Math.max(0, childCount - 1) * 0.18;
  const perChildScale = childCount;

  const annual: CostCalculatorDataset = {
    housing: Math.round(dataset.housing * ageMult.housing * housingScale),
    food: Math.round(dataset.food * ageMult.food * perChildScale),
    healthcare: Math.round(
      dataset.healthcare * ageMult.healthcare * perChildScale,
    ),
    childcare: Math.round(
      dataset.childcare * ageMult.childcare * careMult * perChildScale,
    ),
    clothing: Math.round(dataset.clothing * ageMult.clothing * perChildScale),
    education: Math.round(
      dataset.education * ageMult.education * perChildScale,
    ),
  };

  const monthly: CostCalculatorDataset = {
    housing: Math.round(annualToMonthly(annual.housing)),
    food: Math.round(annualToMonthly(annual.food)),
    healthcare: Math.round(annualToMonthly(annual.healthcare)),
    childcare: Math.round(annualToMonthly(annual.childcare)),
    clothing: Math.round(annualToMonthly(annual.clothing)),
    education: Math.round(annualToMonthly(annual.education)),
  };

  const monthlyTotal = Object.values(monthly).reduce((sum, n) => sum + n, 0);
  const annualTotal = Object.values(annual).reduce((sum, n) => sum + n, 0);

  return { monthly, annual, monthlyTotal, annualTotal };
}

/**
 * Interactive household cost calculator for programmatic city pages.
 */
export default function CostCalculator({
  cityName,
  stateName,
  stateSlug,
  citySlug,
  dataset,
  compareHref = "#nearby-cities-heading",
}: CostCalculatorProps) {
  const { isSignedIn } = useAuth();
  const [childCount, setChildCount] = useState<ChildCountOption>(1);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("schoolAge");
  const [careType, setCareType] = useState<CareType>("center");
  const [savedFlash, setSavedFlash] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const estimate = useMemo(
    () => recalculateCosts(dataset, childCount, ageCategory, careType),
    [ageCategory, careType, childCount, dataset],
  );

  const maxMonthly = Math.max(...Object.values(estimate.monthly), 1);
  const place = `${cityName}, ${stateName}`;
  const cityPath = `/cost-of-parenting/${stateSlug}/${citySlug}`;

  const ageCategoryLabel =
    AGE_OPTIONS.find((o) => o.value === ageCategory)?.label ?? ageCategory;
  const careTypeLabel =
    CARE_OPTIONS.find((o) => o.value === careType)?.label ?? careType;

  const exportScenario: LeadCaptureBudgetSummary = useMemo(
    () => ({
      cityName,
      stateName,
      stateSlug,
      citySlug,
      cityPath,
      childCount,
      ageCategory,
      ageCategoryLabel,
      careType,
      careTypeLabel,
      monthlyTotal: estimate.monthlyTotal,
      annualTotal: estimate.annualTotal,
      monthlyBreakdown: { ...estimate.monthly },
    }),
    [
      ageCategory,
      ageCategoryLabel,
      careType,
      careTypeLabel,
      childCount,
      cityName,
      cityPath,
      citySlug,
      estimate.annualTotal,
      estimate.monthly,
      estimate.monthlyTotal,
      stateName,
      stateSlug,
    ],
  );

  function handleSaveEstimate() {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2400);
  }

  return (
    <section
      id="cost-calculator"
      className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-7"
      aria-labelledby="cost-calculator-heading"
    >
      <header className="border-b border-stone-200/60 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
          Interactive estimate
        </p>
        <h2
          id="cost-calculator-heading"
          className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
        >
          Cost calculator for {place}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Adjust household size, age stage, and care type — totals update
          instantly from this city&apos;s baseline.
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Number of children
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {CHILD_OPTIONS.map((option) => {
                const active = childCount === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setChildCount(option.value)}
                    className={`min-w-[3rem] rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-teal-700 text-white"
                        : "border border-stone-200 bg-stone-50 text-stone-700 hover:border-teal-700/40 hover:text-teal-900"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Age category
            </legend>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {AGE_OPTIONS.map((option) => {
                const active = ageCategory === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setAgeCategory(option.value)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                      active
                        ? "border-teal-500 bg-teal-50 text-teal-900"
                        : "border-stone-200 bg-white text-stone-700 hover:border-teal-700/35"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-stone-500">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Care type
            </legend>
            <div className="mt-2.5 flex flex-col gap-2">
              {CARE_OPTIONS.map((option) => {
                const active = careType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCareType(option.value)}
                    className={`rounded-full border px-4 py-2.5 text-left text-sm font-medium transition-all ${
                      active
                        ? "border-teal-500 bg-teal-50 text-stone-900"
                        : "border-stone-200 bg-white text-stone-700 hover:border-teal-700/35"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="lg:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200/70 bg-cream-muted/50 px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Monthly total
              </p>
              <p className="font-serif mt-1 text-3xl font-semibold text-stone-900">
                {formatUsd(estimate.monthlyTotal)}
              </p>
            </div>
            <div className="rounded-xl border border-teal-200/70 bg-teal-50/80 px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                Annual total
              </p>
              <p className="font-serif mt-1 text-3xl font-semibold text-stone-900">
                {formatUsd(estimate.annualTotal)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="mt-4 w-full rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-800"
          >
            Get Personalized Family Budget Breakdown (PDF/Email)
          </button>

          <div className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Monthly expense breakdown
            </p>
            {BREAKDOWN_META.map((item) => {
              const value = estimate.monthly[item.key];
              const width = Math.max(4, Math.round((value / maxMonthly) * 100));
              return (
                <div key={item.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-stone-800">
                      {item.label}
                    </span>
                    <span className="font-serif text-base font-semibold text-stone-900">
                      {formatUsd(value)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${item.bar} transition-all duration-300`}
                      style={{ width: `${width}%` }}
                      role="progressbar"
                      aria-valuenow={value}
                      aria-valuemin={0}
                      aria-valuemax={maxMonthly}
                      aria-label={`${item.label} monthly share`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isSignedIn ? (
              <button
                type="button"
                onClick={handleSaveEstimate}
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
              >
                {savedFlash ? "Estimate saved" : "Save Estimate"}
              </button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
                  >
                    Save Estimate
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
                  >
                    Create account to save
                  </button>
                </SignUpButton>
              </>
            )}
            <Link
              href={compareHref}
              className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
            >
              Compare with another city
            </Link>
          </div>

          <p className="mt-3 text-xs text-stone-500">
            Planning baseline for{" "}
            <Link
              href={cityPath}
              className="font-medium text-teal-800 underline-offset-2 hover:underline"
            >
              {place}
            </Link>
            . Illustrative — verify local rates before major decisions.
          </p>
        </div>
      </div>

      <BudgetExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        scenario={exportScenario}
      />
    </section>
  );
}
