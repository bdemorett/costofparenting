"use client";

import { useMemo, useState } from "react";
import BudgetExportModal from "@/components/calculator/BudgetExportModal";
import {
  BABY_CARE_OPTIONS,
  DEFAULT_ONE_TIME_COSTS,
  baselineToCityOption,
  calculateBabyAffordability,
  getCareTypeLabel,
  type BabyCareType,
  type BabyCityOption,
} from "@/lib/babyAffordability";
import { LOCATION_BASELINES } from "@/lib/mockData";
import type { LeadCaptureBudgetSummary } from "@/types/leadCapture";

const STEPS = [
  { id: 1, label: "Location & income" },
  { id: 2, label: "Leave & care" },
  { id: 3, label: "Setup costs" },
  { id: 4, label: "Results" },
] as const;

const CITY_OPTIONS: BabyCityOption[] = Object.values(LOCATION_BASELINES)
  .map(baselineToCityOption)
  .sort((a, b) => a.label.localeCompare(b.label));

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function scoreTone(score: number): string {
  if (score >= 75) return "bg-teal-700 text-white";
  if (score >= 55) return "bg-teal-100 text-teal-900";
  if (score >= 35) return "bg-amber-100 text-amber-950";
  return "bg-rose-100 text-rose-950";
}

/**
 * Multi-step “Can we afford a baby?” readiness wizard.
 */
export default function BabyAffordabilityWizard() {
  const [step, setStep] = useState(1);
  const [locationId, setLocationId] = useState(CITY_OPTIONS[0]?.locationId ?? "austin");
  const [annualGrossIncome, setAnnualGrossIncome] = useState(120000);
  const [monthlySavings, setMonthlySavings] = useState(800);
  const [paidLeaveWeeks, setPaidLeaveWeeks] = useState(8);
  const [careType, setCareType] = useState<BabyCareType>("center");
  const [nurseryGear, setNurseryGear] = useState<number>(
    DEFAULT_ONE_TIME_COSTS.nurseryGear,
  );
  const [stroller, setStroller] = useState<number>(DEFAULT_ONE_TIME_COSTS.stroller);
  const [medicalOopMax, setMedicalOopMax] = useState<number>(
    DEFAULT_ONE_TIME_COSTS.medicalOopMax,
  );
  const [initialSupplies, setInitialSupplies] = useState<number>(
    DEFAULT_ONE_TIME_COSTS.initialSupplies,
  );
  const [exportOpen, setExportOpen] = useState(false);

  const baseline = LOCATION_BASELINES[locationId] ?? LOCATION_BASELINES.austin;
  const city = baselineToCityOption(baseline);

  const result = useMemo(
    () =>
      calculateBabyAffordability({
        baseline,
        annualGrossIncome,
        monthlySavings,
        paidLeaveWeeks,
        careType,
        nurseryGear,
        stroller,
        medicalOopMax,
        initialSupplies,
      }),
    [
      baseline,
      annualGrossIncome,
      monthlySavings,
      paidLeaveWeeks,
      careType,
      nurseryGear,
      stroller,
      medicalOopMax,
      initialSupplies,
    ],
  );

  const exportScenario: LeadCaptureBudgetSummary = useMemo(() => {
    const cityPath = `/cost-of-parenting/${city.stateSlug}/${city.locationId}`;
    return {
      cityName: city.cityName,
      stateName: city.stateName,
      stateSlug: city.stateSlug,
      citySlug: city.locationId,
      cityPath,
      childCount: 1,
      ageCategory: "infant",
      ageCategoryLabel: "Infant (Year 1)",
      careType,
      careTypeLabel: getCareTypeLabel(careType),
      monthlyTotal: Math.round(result.year1RecurringTotal / 12),
      annualTotal: result.year1TotalBabyCost,
      monthlyBreakdown: { ...result.monthlyBreakdown },
      tool: "can-we-afford-a-baby",
      preparednessScore: result.preparednessScore,
      preparednessLabel: result.preparednessLabel,
      year1Surplus: result.year1Surplus,
      year1OneTimeTotal: result.year1OneTimeTotal,
      year1RecurringTotal: result.year1RecurringTotal,
      wizardInputs: {
        annualGrossIncome,
        monthlySavings,
        paidLeaveWeeks,
        nurseryGear,
        stroller,
        medicalOopMax,
        initialSupplies,
      },
    };
  }, [
    annualGrossIncome,
    careType,
    city,
    initialSupplies,
    medicalOopMax,
    monthlySavings,
    nurseryGear,
    paidLeaveWeeks,
    result,
    stroller,
  ]);

  const maxBar = Math.max(
    result.year1RecurringTotal,
    result.year1OneTimeTotal,
    1,
  );

  function canContinue(): boolean {
    if (step === 1) {
      return annualGrossIncome > 0 && Boolean(locationId);
    }
    if (step === 2) {
      return paidLeaveWeeks >= 0 && paidLeaveWeeks <= 52;
    }
    return true;
  }

  return (
    <section
      className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-8"
      aria-labelledby="baby-wizard-heading"
    >
      <header className="border-b border-stone-200/60 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
          Interactive tool
        </p>
        <h2
          id="baby-wizard-heading"
          className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
        >
          Year 1 readiness wizard
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Walk through income, leave, care plans, and setup costs — then see your
          financial preparedness score for {city.label}.
        </p>
      </header>

      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Wizard steps">
        {STEPS.map((s) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  if (s.id < step || (s.id === step + 1 && canContinue())) {
                    setStep(s.id);
                  } else if (s.id <= step) {
                    setStep(s.id);
                  }
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  active
                    ? "bg-teal-700 text-white"
                    : done
                      ? "border border-teal-200 bg-teal-50 text-teal-900"
                      : "border border-stone-200 bg-cream text-stone-500"
                }`}
              >
                <span className="mr-1.5 opacity-70">{s.id}.</span>
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                City / state
              </span>
              <select
                className="mt-2 w-full rounded-xl border border-stone-200 bg-cream px-3 py-3 text-sm text-stone-800 outline-none focus:border-teal-600"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                {CITY_OPTIONS.map((opt) => (
                  <option key={opt.locationId} value={opt.locationId}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Combined annual gross salary
              </span>
              <input
                type="number"
                min={0}
                step={1000}
                value={annualGrossIncome}
                onChange={(e) => setAnnualGrossIncome(Number(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-stone-200 bg-cream px-3 py-3 text-sm text-stone-800 outline-none focus:border-teal-600"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Current monthly savings
              </span>
              <input
                type="number"
                min={0}
                step={50}
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-stone-200 bg-cream px-3 py-3 text-sm text-stone-800 outline-none focus:border-teal-600"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <label className="block max-w-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Paid parental leave (weeks)
              </span>
              <input
                type="number"
                min={0}
                max={52}
                step={1}
                value={paidLeaveWeeks}
                onChange={(e) =>
                  setPaidLeaveWeeks(
                    Math.min(52, Math.max(0, Number(e.target.value) || 0)),
                  )
                }
                className="mt-2 w-full rounded-xl border border-stone-200 bg-cream px-3 py-3 text-sm text-stone-800 outline-none focus:border-teal-600"
              />
              <span className="mt-1.5 block text-xs text-stone-500">
                Unpaid weeks are modeled as a partial household income loss.
              </span>
            </label>
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Intended childcare type
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {BABY_CARE_OPTIONS.map((option) => {
                  const active = careType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCareType(option.value)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        active
                          ? "border-teal-700 bg-teal-50 text-teal-950"
                          : "border-stone-200 bg-cream text-stone-700 hover:border-teal-700/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <p className="sm:col-span-2 text-sm text-stone-600">
              Pre-filled with 2026 national averages — adjust for your shopping
              list and insurance plan.
            </p>
            <MoneyField
              label="Nursery gear"
              value={nurseryGear}
              onChange={setNurseryGear}
            />
            <MoneyField label="Stroller" value={stroller} onChange={setStroller} />
            <MoneyField
              label="Medical out-of-pocket maximum"
              value={medicalOopMax}
              onChange={setMedicalOopMax}
            />
            <MoneyField
              label="Initial supplies"
              value={initialSupplies}
              onChange={setInitialSupplies}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
                  Financial preparedness score
                </p>
                <p className="font-serif mt-2 text-2xl font-semibold text-stone-900">
                  {result.preparednessLabel}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                  {result.recommendation}
                </p>
              </div>
              <div
                className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full ${scoreTone(result.preparednessScore)}`}
                aria-label={`Score ${result.preparednessScore} out of 100`}
              >
                <span className="font-serif text-3xl font-semibold leading-none">
                  {result.preparednessScore}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  / 100
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Year 1 surplus / deficit"
                value={formatUsd(result.year1Surplus)}
                hint={
                  result.year1Surplus >= 0
                    ? "Capacity exceeds projected baby costs"
                    : "Shortfall vs savings + income buffer"
                }
              />
              <StatCard
                label="Est. net monthly income"
                value={formatUsd(result.netMonthlyIncome)}
                hint="After illustrative tax withholding"
              />
              <StatCard
                label="Monthly costs after leave"
                value={formatUsd(result.monthlyRecurringAfterLeave)}
                hint={`Includes ${formatUsd(result.monthlyChildcare)} childcare`}
              />
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Year 1 expense breakdown
              </h3>
              <div className="mt-4 space-y-4">
                <BarRow
                  label="Recurring monthly expenses (annualized)"
                  amount={result.year1RecurringTotal}
                  widthPct={(result.year1RecurringTotal / maxBar) * 100}
                />
                <BarRow
                  label="One-time upfront costs"
                  amount={result.year1OneTimeTotal}
                  widthPct={(result.year1OneTimeTotal / maxBar) * 100}
                />
              </div>
              <dl className="mt-5 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
                <div className="flex justify-between gap-3 border-b border-stone-100 py-2">
                  <dt>During leave (living only)</dt>
                  <dd className="font-medium text-stone-800">
                    {formatUsd(result.monthlyRecurringDuringLeave)}/mo
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-stone-100 py-2">
                  <dt>After leave (living + care)</dt>
                  <dd className="font-medium text-stone-800">
                    {formatUsd(result.monthlyRecurringAfterLeave)}/mo
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-stone-100 py-2">
                  <dt>Year 1 capacity</dt>
                  <dd className="font-medium text-stone-800">
                    {formatUsd(result.year1Capacity)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-stone-100 py-2">
                  <dt>Total Year 1 baby cost</dt>
                  <dd className="font-medium text-stone-800">
                    {formatUsd(result.year1TotalBabyCost)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-4 sm:px-5">
              <p className="text-sm font-medium text-stone-800">
                Save this plan for {city.label}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Email a full budget PDF with your inputs, score, and Year 1
                breakdown.
              </p>
              <button
                type="button"
                onClick={() => setExportOpen(true)}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800"
              >
                Save My Results / Email Full Budget PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40 hover:border-teal-700/40"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            disabled={!canContinue()}
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 hover:border-teal-700/40"
          >
            Start over
          </button>
        )}
      </div>

      <BudgetExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        scenario={exportScenario}
      />
    </section>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <input
        type="number"
        min={0}
        step={50}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-2 w-full rounded-xl border border-stone-200 bg-cream px-3 py-3 text-sm text-stone-800 outline-none focus:border-teal-600"
      />
    </label>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/60 bg-cream-muted/50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="font-serif mt-1.5 text-xl font-semibold text-stone-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}

function BarRow({
  label,
  amount,
  widthPct,
}: {
  label: string;
  amount: number;
  widthPct: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="font-serif text-lg font-semibold text-stone-900">
          {formatUsd(amount)}
        </p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-800 to-teal-500"
          style={{ width: `${Math.max(widthPct, amount > 0 ? 4 : 0)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(widthPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}
