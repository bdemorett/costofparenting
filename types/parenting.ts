/**
 * Programmatic data structures for cost-of-parenting estimates.
 *
 * Conventions:
 * - `CostBreakdown` / forecast totals → annual USD
 * - Stage care, housing quotes, healthcare premiums, food/supplies → monthly USD
 *   unless a field name says otherwise
 */

/** Life-stage bands used by the forecast engine and age multipliers. */
export type AgeBand = "infant" | "toddler" | "elementary" | "teen";

/**
 * Care stages for deep monthly city baselines.
 * - infant: 0–2 yrs
 * - toddler: 2–4 yrs
 * - schoolAge: 5+ yrs
 */
export type CareStageKey = "infant" | "toddler" | "schoolAge";

/** Expense categories that make up a location's annual parenting baseline. */
export type CostCategoryKey =
  | "housing"
  | "food"
  | "childcare"
  | "healthcare"
  | "clothing"
  | "education"
  | "transportation"
  | "miscellaneous";

/** Annual USD spend broken down by category (school-age / elementary reference). */
export interface CostBreakdown {
  housing: number;
  food: number;
  childcare: number;
  healthcare: number;
  clothing: number;
  education: number;
  transportation: number;
  miscellaneous: number;
}

/**
 * Global scalars applied to a location baseline by age band.
 * Elementary is the reference (typically `1`).
 */
export type AgeMultipliers = Record<AgeBand, number>;

/**
 * Monthly cost stack for one child in a care stage.
 * Amounts are USD / month.
 */
export interface StageMonthlyBreakdown {
  /** Daycare, preschool, or after-school care. */
  childcare: number;
  /** Food attributable to the child. */
  food: number;
  /** Diapers, wipes, formula/baby food, toiletries, etc. */
  supplies: number;
  /** Child's share of premiums + routine care (monthlyized). */
  healthcare: number;
  /** Activities, clothing buffer, misc. for this stage. */
  other: number;
}

/** Infant (0–2), toddler (2–4), and school-age (5+) monthly stacks. */
export type StageMonthlyCosts = Record<CareStageKey, StageMonthlyBreakdown>;

/**
 * Housing differential: couple/studio footprint vs family-sized home.
 * Amounts are USD / month.
 */
export interface HousingDifferential {
  /** Typical 1–2 bedroom rent for the metro. */
  avgRent1to2Bed: number;
  /**
   * Typical 3+ bedroom family housing cost
   * (rent or mortgage payment — see `tenure`).
   */
  avgFamilyHome3Plus: number;
  /** Family premium = family home − 1–2 bed (can be derived). */
  familyPremiumMonthly: number;
  tenure: "rent" | "mortgage" | "mixed";
}

/**
 * Health insurance & family healthcare cost factors.
 * Premiums are USD / month unless noted.
 */
export interface HealthcareCostFactors {
  /** Typical employer-sponsored family plan employee contribution. */
  employerFamilyPremiumMonthly: number;
  /** Typical ACA marketplace family plan premium (unsubsidized estimate). */
  marketplaceFamilyPremiumMonthly: number;
  /** Routine + acute out-of-pocket per child (monthlyized). */
  outOfPocketPerChildMonthly: number;
  /** Dental + vision family add-on. */
  dentalVisionMonthly: number;
  /** Regional cost index vs national average (`1` = national). */
  regionalIndex: number;
}

/**
 * Food & diaper/supplies monthly estimates (USD / month).
 * Stage-specific food/supplies also live on `StageMonthlyBreakdown`;
 * these fields are metro-level planning anchors.
 */
export interface FoodAndSuppliesMonthly {
  /** Typical grocery spend attributable to one school-age child. */
  foodPerChild: number;
  /** Diapers + wipes for an infant month. */
  diapersAndWipes: number;
  /** Formula and/or baby food monthly. */
  formulaOrBabyFood: number;
  /** Shared household paper/cleaning goods uplift for a family. */
  householdSupplies: number;
}

/** Fully populated cost baseline for a single metro / city. */
export interface LocationBaseline {
  locationId: string;
  displayName: string;
  state: string;
  /** USPS-style state code when available (e.g. `TX`). */
  stateCode: string;
  currency: "USD";
  /** Data vintage (ISO date). */
  updatedAt: string;
  /**
   * Annual costs for the school-age / elementary reference band.
   * Derived from stage + housing + healthcare for engine compatibility.
   */
  annualCosts: CostBreakdown;
  /** Deep monthly stacks by care stage. */
  stageMonthly: StageMonthlyCosts;
  /** 1–2 bed vs 3+ family housing differential. */
  housing: HousingDifferential;
  /** Insurance premiums and healthcare factors. */
  healthcare: HealthcareCostFactors;
  /** Food & supplies planning anchors. */
  foodAndSupplies: FoodAndSuppliesMonthly;
}

/** Result of applying an age multiplier to a location baseline. */
export interface ScaledParentingCosts {
  locationId: string;
  ageBand: AgeBand;
  multiplier: number;
  annualCosts: CostBreakdown;
  totalAnnual: number;
  totalMonthly: number;
}

/** One year in a child's multi-year cost outlook. */
export interface ForecastYear {
  yearIndex: number;
  calendarYear: number;
  age: number;
  ageBand: AgeBand;
  multiplier: number;
  annualCosts: CostBreakdown;
  totalAnnual: number;
}

/** Per-child N-year outlook. */
export interface ChildForecast {
  childIndex: number;
  startingAge: number;
  yearly: ForecastYear[];
  tenYearTotal: number;
  categoryTotals: CostBreakdown;
}

/** Finalized calculate API response asset. */
export interface ParentingCostForecast {
  locationId: string;
  displayName: string;
  state: string;
  currency: "USD";
  horizonYears: number;
  baselineUpdatedAt: string;
  multipliers: AgeMultipliers;
  baselineAnnualCosts: CostBreakdown;
  children: ChildForecast[];
  householdTenYearTotal: number;
  householdCategoryTotals: CostBreakdown;
}

/** Maps chronological age → care stage used by `stageMonthly`. */
export function ageToCareStage(age: number): CareStageKey {
  if (age < 2) return "infant";
  if (age < 5) return "toddler";
  return "schoolAge";
}
