import type {
  AgeBand,
  CareStageKey,
  LocationBaseline,
  StageMonthlyBreakdown,
} from "@/types/parenting";
import { sumStageMonthly } from "@/lib/mockData";

const PRIVATE_CHILDCARE_MULTIPLIER = 1.65;

export type ConsoleAgeCounts = Record<AgeBand, number>;

export type EstimateCategoryKey =
  | "childcare"
  | "food"
  | "supplies"
  | "healthcare"
  | "housing"
  | "other";

export interface LiveEstimateBreakdown {
  childcare: number;
  food: number;
  supplies: number;
  healthcare: number;
  housing: number;
  other: number;
}

export interface LiveConsoleEstimate {
  monthly: LiveEstimateBreakdown;
  monthlyTotal: number;
  annualTotal: number;
  childCount: number;
}

function bandToStage(band: AgeBand): CareStageKey {
  if (band === "infant") return "infant";
  if (band === "toddler") return "toddler";
  return "schoolAge";
}

function scaleStage(
  stage: StageMonthlyBreakdown,
  childcareType: "public" | "private",
): StageMonthlyBreakdown {
  if (childcareType !== "private") return stage;
  return {
    ...stage,
    childcare: Math.round(stage.childcare * PRIVATE_CHILDCARE_MULTIPLIER),
  };
}

/**
 * Instant client-side household estimate from deep city baselines.
 * Free, synchronous — no API round-trip.
 */
export function estimateHouseholdCosts(
  baseline: LocationBaseline,
  ageCounts: ConsoleAgeCounts,
  childcareType: "public" | "private",
): LiveConsoleEstimate {
  const monthly: LiveEstimateBreakdown = {
    childcare: 0,
    food: 0,
    supplies: 0,
    healthcare: 0,
    housing: 0,
    other: 0,
  };

  let childCount = 0;
  const bands: AgeBand[] = ["infant", "toddler", "elementary", "teen"];

  for (const band of bands) {
    const count = ageCounts[band] ?? 0;
    if (count <= 0) continue;
    childCount += count;
    const stage = scaleStage(
      baseline.stageMonthly[bandToStage(band)],
      childcareType,
    );
    monthly.childcare += stage.childcare * count;
    monthly.food += stage.food * count;
    monthly.supplies += stage.supplies * count;
    monthly.healthcare += stage.healthcare * count;
    monthly.other += stage.other * count;
  }

  if (childCount > 0) {
    monthly.housing = baseline.housing.familyPremiumMonthly;
    monthly.healthcare +=
      baseline.healthcare.outOfPocketPerChildMonthly * childCount * 0.25;
  }

  const monthlyTotal = Object.values(monthly).reduce((a, b) => a + b, 0);

  return {
    monthly,
    monthlyTotal: Math.round(monthlyTotal),
    annualTotal: Math.round(monthlyTotal * 12),
    childCount,
  };
}

/** Rule-of-thumb life insurance need from annual parenting burn rate. */
export function estimateLifeInsuranceNeed(annualParentingCost: number): number {
  // 10× annual child-related costs, floored for readability
  return Math.max(100_000, Math.round((annualParentingCost * 10) / 10_000) * 10_000);
}

/**
 * Rough 529 monthly savings to hit a metro-scaled college goal over remaining years.
 */
export function estimate529MonthlySavings(input: {
  childCount: number;
  yearsToCollege?: number;
  targetPerChild?: number;
}): { targetTotal: number; monthlySavings: number; years: number } {
  const years = input.yearsToCollege ?? 15;
  const targetPerChild = input.targetPerChild ?? 120_000;
  const kids = Math.max(1, input.childCount);
  const targetTotal = targetPerChild * kids;
  const months = Math.max(1, years * 12);
  return {
    targetTotal,
    monthlySavings: Math.round(targetTotal / months),
    years,
  };
}

export function stageTotalForBand(
  baseline: LocationBaseline,
  band: AgeBand,
  childcareType: "public" | "private",
): number {
  return sumStageMonthly(
    scaleStage(baseline.stageMonthly[bandToStage(band)], childcareType),
  );
}
