import type { LocationBaseline } from "@/types/parenting";
import { sumStageMonthly } from "@/lib/mockData";

/** Effective take-home share of gross household income (illustrative). */
export const NET_INCOME_RATIO = 0.72;

/** National-average Year 1 gear defaults (2026 USD). */
export const DEFAULT_ONE_TIME_COSTS = {
  nurseryGear: 1800,
  stroller: 450,
  medicalOopMax: 3200,
  initialSupplies: 650,
} as const;

export type BabyCareType =
  | "center"
  | "nanny"
  | "family"
  | "stayAtHome";

export const BABY_CARE_OPTIONS: {
  value: BabyCareType;
  label: string;
  /** Multiplier on local infant center-care rate. */
  childcareMultiplier: number;
}[] = [
  {
    value: "center",
    label: "Center-Based Daycare",
    childcareMultiplier: 1,
  },
  {
    value: "nanny",
    label: "In-Home Nanny",
    childcareMultiplier: 2.1,
  },
  {
    value: "family",
    label: "Family Care",
    childcareMultiplier: 0.4,
  },
  {
    value: "stayAtHome",
    label: "Stay-at-Home Parent",
    childcareMultiplier: 0,
  },
];

export type BabyAffordabilityInput = {
  baseline: LocationBaseline;
  annualGrossIncome: number;
  monthlySavings: number;
  paidLeaveWeeks: number;
  careType: BabyCareType;
  nurseryGear: number;
  stroller: number;
  medicalOopMax: number;
  initialSupplies: number;
};

export type BabyAffordabilityResult = {
  netMonthlyIncome: number;
  netAnnualIncome: number;
  /** Income after modeling unpaid weeks at 0% pay for one earner share. */
  year1NetIncome: number;
  monthlyLivingBaby: number;
  monthlyChildcare: number;
  monthlyRecurringAfterLeave: number;
  monthlyRecurringDuringLeave: number;
  year1RecurringTotal: number;
  year1OneTimeTotal: number;
  year1TotalBabyCost: number;
  /** Capacity allocated to Year 1 baby costs (savings + income slice). */
  year1Capacity: number;
  year1Surplus: number;
  preparednessScore: number;
  preparednessLabel: string;
  recommendation: string;
  monthlyBreakdown: {
    housing: number;
    food: number;
    healthcare: number;
    childcare: number;
    clothing: number;
    education: number;
  };
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function roundMoney(n: number): number {
  return Math.round(n);
}

export function getCareTypeLabel(careType: BabyCareType): string {
  return (
    BABY_CARE_OPTIONS.find((o) => o.value === careType)?.label ?? careType
  );
}

/**
 * Year 1 baby affordability model: leave-aware childcare, living stack,
 * one-time setup, and a 1–100 preparedness score.
 */
export function calculateBabyAffordability(
  input: BabyAffordabilityInput,
): BabyAffordabilityResult {
  const {
    baseline,
    annualGrossIncome,
    monthlySavings,
    paidLeaveWeeks,
    careType,
    nurseryGear,
    stroller,
    medicalOopMax,
    initialSupplies,
  } = input;

  const infant = baseline.stageMonthly.infant;
  const careMeta =
    BABY_CARE_OPTIONS.find((o) => o.value === careType) ?? BABY_CARE_OPTIONS[0];

  const gross = Math.max(0, annualGrossIncome);
  const netAnnualIncome = roundMoney(gross * NET_INCOME_RATIO);
  const netMonthlyIncome = roundMoney(netAnnualIncome / 12);

  const leaveWeeks = clamp(Math.round(paidLeaveWeeks), 0, 52);
  const unpaidWeeks = 52 - leaveWeeks;

  // Assume leave is taken by ~45% of household earnings; unpaid weeks lose that share.
  const leaveEarnerShare = 0.45;
  const unpaidIncomeLoss = roundMoney(
    (netAnnualIncome / 52) * unpaidWeeks * leaveEarnerShare,
  );
  const year1NetIncome = roundMoney(netAnnualIncome - unpaidIncomeLoss);

  const monthlyChildcare = roundMoney(
    infant.childcare * careMeta.childcareMultiplier,
  );
  const monthlyHousing = roundMoney(baseline.housing.familyPremiumMonthly * 0.55);
  const monthlyFood = roundMoney(
    infant.food + baseline.foodAndSupplies.formulaOrBabyFood * 0.5,
  );
  const monthlyHealthcare = roundMoney(
    infant.healthcare + baseline.healthcare.outOfPocketPerChildMonthly * 0.5,
  );
  const monthlyClothing = roundMoney(infant.other * 0.35 + infant.supplies * 0.25);
  const monthlyEducation = 0;

  const monthlyLivingBaby = roundMoney(
    monthlyHousing +
      monthlyFood +
      monthlyHealthcare +
      monthlyClothing +
      infant.supplies * 0.35,
  );

  const monthlyRecurringDuringLeave = monthlyLivingBaby;
  const monthlyRecurringAfterLeave = roundMoney(
    monthlyLivingBaby + monthlyChildcare,
  );

  const leaveMonths = leaveWeeks / (52 / 12);
  const postLeaveMonths = 12 - leaveMonths;

  const year1RecurringTotal = roundMoney(
    leaveMonths * monthlyRecurringDuringLeave +
      postLeaveMonths * monthlyRecurringAfterLeave,
  );

  const year1OneTimeTotal = roundMoney(
    Math.max(0, nurseryGear) +
      Math.max(0, stroller) +
      Math.max(0, medicalOopMax) +
      Math.max(0, initialSupplies),
  );

  const year1TotalBabyCost = year1RecurringTotal + year1OneTimeTotal;

  // Capacity: full annual savings rate + ~22% of Year 1 net income for new baby costs.
  const year1Capacity = roundMoney(
    Math.max(0, monthlySavings) * 12 + year1NetIncome * 0.22,
  );

  const year1Surplus = roundMoney(year1Capacity - year1TotalBabyCost);

  const coverage =
    year1TotalBabyCost > 0 ? year1Capacity / year1TotalBabyCost : 1.5;
  const savingsMonths =
    year1TotalBabyCost > 0
      ? (Math.max(0, monthlySavings) * 12) / (year1TotalBabyCost / 12)
      : 12;

  let preparednessScore = Math.round(
    clamp(coverage * 55 + clamp(savingsMonths, 0, 12) * 3.5, 1, 100),
  );

  if (year1Surplus < 0) {
    preparednessScore = Math.min(
      preparednessScore,
      clamp(40 + year1Surplus / 800, 1, 45),
    );
  }

  preparednessScore = clamp(Math.round(preparednessScore), 1, 100);

  let preparednessLabel: string;
  let recommendation: string;

  if (preparednessScore >= 75) {
    preparednessLabel = "On Track";
    recommendation =
      "Your Year 1 capacity covers projected baby costs with a healthy cushion. Keep automatic savings on and revisit childcare quotes 3–6 months before return-to-work.";
  } else if (preparednessScore >= 55) {
    preparednessLabel = "Manageable — Build Buffer";
    recommendation =
      "You can likely fund Year 1, but the margin is modest. Aim for 3+ months of baby expenses in cash before the due date.";
  } else if (preparednessScore >= 35) {
    preparednessLabel = "Tight Margin — Consider Increasing Emergency Savings";
    recommendation =
      "Projected costs press against available income and savings. Raise monthly savings, shop care options, or extend paid leave before locking major gear purchases.";
  } else {
    preparednessLabel = "High Strain — Revisit Timing or Costs";
    recommendation =
      "Year 1 baby costs exceed a sustainable share of household capacity. Prioritize an emergency fund, family-care alternatives, and a clearer leave plan before relying on credit.";
  }

  return {
    netMonthlyIncome,
    netAnnualIncome,
    year1NetIncome,
    monthlyLivingBaby,
    monthlyChildcare,
    monthlyRecurringAfterLeave,
    monthlyRecurringDuringLeave,
    year1RecurringTotal,
    year1OneTimeTotal,
    year1TotalBabyCost,
    year1Capacity,
    year1Surplus,
    preparednessScore,
    preparednessLabel,
    recommendation,
    monthlyBreakdown: {
      housing: monthlyHousing,
      food: monthlyFood,
      healthcare: monthlyHealthcare,
      childcare: monthlyChildcare,
      clothing: monthlyClothing,
      education: monthlyEducation,
    },
  };
}

/** Lightweight city option for the wizard location select. */
export type BabyCityOption = {
  locationId: string;
  cityName: string;
  stateName: string;
  stateSlug: string;
  label: string;
};

export function baselineToCityOption(
  baseline: LocationBaseline,
): BabyCityOption {
  const cityName =
    baseline.displayName.split(",")[0]?.trim() || baseline.displayName;
  const stateSlug = baseline.stateCode.toLowerCase();
  return {
    locationId: baseline.locationId,
    cityName,
    stateName: baseline.stateCode,
    stateSlug,
    label: `${cityName}, ${baseline.stateCode}`,
  };
}

/** Infant stage total — useful for UI hints. */
export function infantMonthlyHint(baseline: LocationBaseline): number {
  return sumStageMonthly(baseline.stageMonthly.infant);
}
