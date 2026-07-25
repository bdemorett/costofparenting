"use client";

import { useState } from "react";
import type {
  CareStageKey,
  LocationBaseline,
  StageMonthlyBreakdown,
} from "@/types/parenting";
import { sumStageMonthly } from "@/lib/mockData";

const STAGES: {
  key: CareStageKey;
  label: string;
  ages: string;
  blurb: string;
}[] = [
  {
    key: "infant",
    label: "Infant",
    ages: "0–2 yrs",
    blurb: "Full-day care, diapers, and formula dominate this stage.",
  },
  {
    key: "toddler",
    label: "Toddler",
    ages: "2–4 yrs",
    blurb: "Preschool tuition stays high while supply spend eases.",
  },
  {
    key: "schoolAge",
    label: "School age",
    ages: "5+ yrs",
    blurb: "After-school care replaces daycare; food and activities rise.",
  },
];

const LINE_ITEMS: {
  key: keyof StageMonthlyBreakdown;
  label: string;
}[] = [
  { key: "childcare", label: "Childcare" },
  { key: "food", label: "Food" },
  { key: "supplies", label: "Diapers & supplies" },
  { key: "healthcare", label: "Healthcare share" },
  { key: "other", label: "Other" },
];

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface AgeStageBreakdownProps {
  baseline: LocationBaseline;
  cityLabel: string;
}

/**
 * Interactive Infant / Toddler / School-age monthly cost tabs for city guides.
 */
export default function AgeStageBreakdown({
  baseline,
  cityLabel,
}: AgeStageBreakdownProps) {
  const [active, setActive] = useState<CareStageKey>("infant");
  const stageMeta = STAGES.find((s) => s.key === active) ?? STAGES[0];
  const costs = baseline.stageMonthly[active];
  const monthlyTotal = sumStageMonthly(costs);
  const maxLine = Math.max(...LINE_ITEMS.map((item) => costs[item.key]), 1);

  return (
    <section
      id="cost-by-age"
      className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm sm:p-7"
      aria-labelledby="cost-by-age-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Cost by age
      </p>
      <h2
        id="cost-by-age-heading"
        className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
      >
        Monthly parenting costs in {cityLabel}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        Compare stage-based childcare, food, supplies, and healthcare — then
        model your household in the calculator console.
      </p>

      <div
        role="tablist"
        aria-label="Care stage"
        className="mt-6 flex flex-wrap gap-2"
      >
        {STAGES.map((stage) => {
          const selected = stage.key === active;
          return (
            <button
              key={stage.key}
              type="button"
              role="tab"
              id={`stage-tab-${stage.key}`}
              aria-selected={selected}
              aria-controls={`stage-panel-${stage.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(stage.key)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? "bg-teal-700 text-white"
                  : "border border-stone-200 bg-cream text-stone-700 hover:border-teal-700/40 hover:text-teal-900"
              }`}
            >
              {stage.label}
              <span className="ml-1.5 text-xs opacity-80">{stage.ages}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`stage-panel-${active}`}
        aria-labelledby={`stage-tab-${active}`}
        className="mt-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800">
              {stageMeta.label} · {stageMeta.ages}
            </p>
            <p className="mt-1 text-sm text-stone-500">{stageMeta.blurb}</p>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
              Stage total / mo
            </p>
            <p className="font-serif text-2xl font-semibold text-stone-900">
              {formatUsd(monthlyTotal)}
            </p>
            <p className="text-xs text-stone-500">
              ≈ {formatUsd(monthlyTotal * 12)} / yr
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {LINE_ITEMS.map((item) => {
            const value = costs[item.key];
            const width = Math.round((value / maxLine) * 100);
            return (
              <div key={item.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-stone-800">
                    {item.label}
                  </p>
                  <p className="font-serif text-lg font-semibold text-stone-900">
                    {formatUsd(value)}
                    <span className="ml-1 font-sans text-xs font-medium text-stone-500">
                      / mo
                    </span>
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-800 to-teal-500 transition-all duration-300"
                    style={{ width: `${width}%` }}
                    role="progressbar"
                    aria-valuenow={width}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.label} relative scale`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
