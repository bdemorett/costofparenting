import type {
  AgeBand,
  AgeMultipliers,
  CareStageKey,
  CostBreakdown,
  HealthcareCostFactors,
  HousingDifferential,
  LocationBaseline,
  StageMonthlyBreakdown,
  StageMonthlyCosts,
} from "@/types/parenting";
import { ageToCareStage } from "@/types/parenting";
import {
  expandMetroFromPeer,
  METRO_EXPANSIONS,
  type ScalableCitySeed,
} from "@/lib/metroCatalog";

/**
 * Global age multipliers relative to the elementary / school-age reference (1.0).
 * Infant/toddler costs skew higher (childcare, supplies); teen costs rise
 * again for food, clothing, and activities.
 */
export const globalAgeMatrix = {
  infant: 1.4,
  toddler: 1.25,
  elementary: 1.0,
  teen: 1.15,
} as const satisfies AgeMultipliers;

/** @deprecated Prefer `globalAgeMatrix`. */
export const GLOBAL_AGE_MULTIPLIERS = globalAgeMatrix;

/** Maps a chronological age to the life-stage band used by `globalAgeMatrix`. */
export function ageToBand(age: number): AgeBand {
  if (age < 2) return "infant";
  if (age < 5) return "toddler";
  if (age < 13) return "elementary";
  return "teen";
}

export { ageToCareStage };

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function monthlyToAnnual(monthly: number): number {
  return roundMoney(monthly * 12);
}

/** Scales every category in a cost breakdown by a uniform multiplier. */
export function scaleCostBreakdown(
  costs: CostBreakdown,
  multiplier: number,
): CostBreakdown {
  return {
    housing: roundMoney(costs.housing * multiplier),
    food: roundMoney(costs.food * multiplier),
    childcare: roundMoney(costs.childcare * multiplier),
    healthcare: roundMoney(costs.healthcare * multiplier),
    clothing: roundMoney(costs.clothing * multiplier),
    education: roundMoney(costs.education * multiplier),
    transportation: roundMoney(costs.transportation * multiplier),
    miscellaneous: roundMoney(costs.miscellaneous * multiplier),
  };
}

/** Sums all categories in a cost breakdown. */
export function sumCostBreakdown(costs: CostBreakdown): number {
  return roundMoney(
    costs.housing +
      costs.food +
      costs.childcare +
      costs.healthcare +
      costs.clothing +
      costs.education +
      costs.transportation +
      costs.miscellaneous,
  );
}

/** Adds two cost breakdowns category-wise. */
export function addCostBreakdowns(
  a: CostBreakdown,
  b: CostBreakdown,
): CostBreakdown {
  return {
    housing: roundMoney(a.housing + b.housing),
    food: roundMoney(a.food + b.food),
    childcare: roundMoney(a.childcare + b.childcare),
    healthcare: roundMoney(a.healthcare + b.healthcare),
    clothing: roundMoney(a.clothing + b.clothing),
    education: roundMoney(a.education + b.education),
    transportation: roundMoney(a.transportation + b.transportation),
    miscellaneous: roundMoney(a.miscellaneous + b.miscellaneous),
  };
}

export function emptyCostBreakdown(): CostBreakdown {
  return {
    housing: 0,
    food: 0,
    childcare: 0,
    healthcare: 0,
    clothing: 0,
    education: 0,
    transportation: 0,
    miscellaneous: 0,
  };
}

export function sumStageMonthly(stageCosts: StageMonthlyBreakdown): number {
  return roundMoney(
    stageCosts.childcare +
      stageCosts.food +
      stageCosts.supplies +
      stageCosts.healthcare +
      stageCosts.other,
  );
}

/**
 * Builds the elementary/school-age annual `CostBreakdown` used by the
 * forecast engine from deep monthly city fields.
 */
export function deriveAnnualCostsFromDeepBaseline(input: {
  stageMonthly: StageMonthlyCosts;
  housing: HousingDifferential;
  healthcare: HealthcareCostFactors;
}): CostBreakdown {
  const school = input.stageMonthly.schoolAge;
  const housingAnnual = monthlyToAnnual(input.housing.familyPremiumMonthly);
  const healthcareAnnual = monthlyToAnnual(
    school.healthcare +
      input.healthcare.outOfPocketPerChildMonthly * 0.35 +
      input.healthcare.dentalVisionMonthly * 0.25,
  );

  return {
    housing: housingAnnual,
    food: monthlyToAnnual(school.food),
    childcare: monthlyToAnnual(school.childcare),
    healthcare: healthcareAnnual,
    clothing: monthlyToAnnual(school.other * 0.35),
    education: monthlyToAnnual(school.other * 0.4),
    transportation: monthlyToAnnual(school.other * 0.15 + 80),
    miscellaneous: monthlyToAnnual(school.supplies + school.other * 0.1),
  };
}

type CitySeed = ScalableCitySeed;

function buildHousing(housing: CitySeed["housing"]): HousingDifferential {
  const familyPremiumMonthly =
    housing.familyPremiumMonthly ??
    roundMoney(housing.avgFamilyHome3Plus - housing.avgRent1to2Bed);

  return {
    avgRent1to2Bed: housing.avgRent1to2Bed,
    avgFamilyHome3Plus: housing.avgFamilyHome3Plus,
    familyPremiumMonthly: Math.max(0, familyPremiumMonthly),
    tenure: housing.tenure,
  };
}

function buildBaseline(seed: CitySeed): LocationBaseline {
  const housing = buildHousing(seed.housing);
  const stageMonthly = seed.stageMonthly;
  const healthcare = seed.healthcare;
  const annualCosts = deriveAnnualCostsFromDeepBaseline({
    stageMonthly,
    housing,
    healthcare,
  });

  return {
    locationId: seed.locationId,
    displayName: seed.displayName,
    state: seed.state,
    stateCode: seed.stateCode,
    currency: "USD",
    updatedAt: seed.updatedAt ?? "2026-01-15",
    annualCosts,
    stageMonthly,
    housing,
    healthcare,
    foodAndSupplies: seed.foodAndSupplies,
  };
}

function stage(
  childcare: number,
  food: number,
  supplies: number,
  healthcare: number,
  other: number,
): StageMonthlyBreakdown {
  return { childcare, food, supplies, healthcare, other };
}

/**
 * Hyper-realistic illustrative monthly baselines for major US metros.
 * Figures are planning samples for development / offline fallback — not quotes.
 * Additional metros in `METRO_EXPANSIONS` are peer-scaled from these seeds.
 */
const PRIMARY_CITY_SEEDS: CitySeed[] = [
  {
    locationId: "austin",
    displayName: "Austin, TX",
    state: "TX",
    stateCode: "TX",
    stageMonthly: {
      infant: stage(1650, 290, 310, 195, 140),
      toddler: stage(1420, 310, 120, 175, 160),
      schoolAge: stage(780, 340, 45, 155, 210),
    },
    housing: {
      avgRent1to2Bed: 1650,
      avgFamilyHome3Plus: 2450,
      tenure: "mixed",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 520,
      marketplaceFamilyPremiumMonthly: 1180,
      outOfPocketPerChildMonthly: 95,
      dentalVisionMonthly: 78,
      regionalIndex: 0.94,
    },
    foodAndSupplies: {
      foodPerChild: 340,
      diapersAndWipes: 85,
      formulaOrBabyFood: 180,
      householdSupplies: 55,
    },
  },
  {
    locationId: "new-york",
    displayName: "New York City, NY",
    state: "NY",
    stateCode: "NY",
    stageMonthly: {
      infant: stage(2850, 420, 340, 260, 190),
      toddler: stage(2450, 450, 140, 240, 220),
      schoolAge: stage(1350, 480, 60, 210, 280),
    },
    housing: {
      avgRent1to2Bed: 3400,
      avgFamilyHome3Plus: 5200,
      tenure: "rent",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 710,
      marketplaceFamilyPremiumMonthly: 1620,
      outOfPocketPerChildMonthly: 130,
      dentalVisionMonthly: 95,
      regionalIndex: 1.28,
    },
    foodAndSupplies: {
      foodPerChild: 480,
      diapersAndWipes: 95,
      formulaOrBabyFood: 210,
      householdSupplies: 75,
    },
  },
  {
    locationId: "los-angeles",
    displayName: "Los Angeles, CA",
    state: "CA",
    stateCode: "CA",
    stageMonthly: {
      infant: stage(2150, 380, 330, 230, 175),
      toddler: stage(1880, 400, 130, 210, 195),
      schoolAge: stage(980, 420, 55, 185, 250),
    },
    housing: {
      avgRent1to2Bed: 2450,
      avgFamilyHome3Plus: 3850,
      tenure: "rent",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 640,
      marketplaceFamilyPremiumMonthly: 1420,
      outOfPocketPerChildMonthly: 115,
      dentalVisionMonthly: 88,
      regionalIndex: 1.18,
    },
    foodAndSupplies: {
      foodPerChild: 420,
      diapersAndWipes: 90,
      formulaOrBabyFood: 195,
      householdSupplies: 68,
    },
  },
  {
    locationId: "chicago",
    displayName: "Chicago, IL",
    state: "IL",
    stateCode: "IL",
    stageMonthly: {
      infant: stage(1780, 320, 300, 205, 150),
      toddler: stage(1520, 340, 115, 185, 170),
      schoolAge: stage(820, 360, 48, 165, 220),
    },
    housing: {
      avgRent1to2Bed: 1850,
      avgFamilyHome3Plus: 2750,
      tenure: "mixed",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 560,
      marketplaceFamilyPremiumMonthly: 1260,
      outOfPocketPerChildMonthly: 100,
      dentalVisionMonthly: 82,
      regionalIndex: 1.02,
    },
    foodAndSupplies: {
      foodPerChild: 360,
      diapersAndWipes: 82,
      formulaOrBabyFood: 175,
      householdSupplies: 58,
    },
  },
  {
    locationId: "denver",
    displayName: "Denver, CO",
    state: "CO",
    stateCode: "CO",
    stageMonthly: {
      infant: stage(1720, 310, 305, 200, 145),
      toddler: stage(1480, 330, 118, 180, 165),
      schoolAge: stage(760, 350, 46, 160, 215),
    },
    housing: {
      avgRent1to2Bed: 1780,
      avgFamilyHome3Plus: 2680,
      tenure: "mortgage",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 545,
      marketplaceFamilyPremiumMonthly: 1220,
      outOfPocketPerChildMonthly: 98,
      dentalVisionMonthly: 80,
      regionalIndex: 0.99,
    },
    foodAndSupplies: {
      foodPerChild: 350,
      diapersAndWipes: 84,
      formulaOrBabyFood: 178,
      householdSupplies: 56,
    },
  },
  {
    locationId: "seattle",
    displayName: "Seattle, WA",
    state: "WA",
    stateCode: "WA",
    stageMonthly: {
      infant: stage(2280, 370, 325, 235, 170),
      toddler: stage(1980, 390, 125, 215, 190),
      schoolAge: stage(1050, 410, 52, 190, 245),
    },
    housing: {
      avgRent1to2Bed: 2200,
      avgFamilyHome3Plus: 3450,
      tenure: "mixed",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 600,
      marketplaceFamilyPremiumMonthly: 1350,
      outOfPocketPerChildMonthly: 110,
      dentalVisionMonthly: 86,
      regionalIndex: 1.12,
    },
    foodAndSupplies: {
      foodPerChild: 410,
      diapersAndWipes: 88,
      formulaOrBabyFood: 190,
      householdSupplies: 65,
    },
  },
  {
    locationId: "dallas",
    displayName: "Dallas, TX",
    state: "TX",
    stateCode: "TX",
    stageMonthly: {
      infant: stage(1480, 280, 295, 185, 130),
      toddler: stage(1280, 300, 110, 165, 150),
      schoolAge: stage(690, 320, 42, 145, 195),
    },
    housing: {
      avgRent1to2Bed: 1450,
      avgFamilyHome3Plus: 2150,
      tenure: "mortgage",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 495,
      marketplaceFamilyPremiumMonthly: 1100,
      outOfPocketPerChildMonthly: 88,
      dentalVisionMonthly: 72,
      regionalIndex: 0.9,
    },
    foodAndSupplies: {
      foodPerChild: 320,
      diapersAndWipes: 80,
      formulaOrBabyFood: 168,
      householdSupplies: 50,
    },
  },
  {
    locationId: "miami",
    displayName: "Miami, FL",
    state: "FL",
    stateCode: "FL",
    stageMonthly: {
      infant: stage(1620, 330, 315, 210, 155),
      toddler: stage(1400, 350, 122, 190, 175),
      schoolAge: stage(740, 370, 50, 170, 230),
    },
    housing: {
      avgRent1to2Bed: 2050,
      avgFamilyHome3Plus: 3100,
      tenure: "rent",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 580,
      marketplaceFamilyPremiumMonthly: 1380,
      outOfPocketPerChildMonthly: 105,
      dentalVisionMonthly: 84,
      regionalIndex: 1.08,
    },
    foodAndSupplies: {
      foodPerChild: 370,
      diapersAndWipes: 86,
      formulaOrBabyFood: 185,
      householdSupplies: 60,
    },
  },
  {
    locationId: "boston",
    displayName: "Boston, MA",
    state: "MA",
    stateCode: "MA",
    stageMonthly: {
      infant: stage(2620, 400, 335, 250, 185),
      toddler: stage(2280, 425, 135, 230, 210),
      schoolAge: stage(1220, 450, 58, 200, 270),
    },
    housing: {
      avgRent1to2Bed: 2750,
      avgFamilyHome3Plus: 4100,
      tenure: "rent",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 680,
      marketplaceFamilyPremiumMonthly: 1520,
      outOfPocketPerChildMonthly: 125,
      dentalVisionMonthly: 92,
      regionalIndex: 1.22,
    },
    foodAndSupplies: {
      foodPerChild: 450,
      diapersAndWipes: 92,
      formulaOrBabyFood: 205,
      householdSupplies: 72,
    },
  },
  {
    locationId: "atlanta",
    displayName: "Atlanta, GA",
    state: "GA",
    stateCode: "GA",
    stageMonthly: {
      infant: stage(1520, 295, 298, 190, 138),
      toddler: stage(1320, 315, 112, 170, 158),
      schoolAge: stage(710, 335, 44, 150, 205),
    },
    housing: {
      avgRent1to2Bed: 1580,
      avgFamilyHome3Plus: 2350,
      tenure: "mixed",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 510,
      marketplaceFamilyPremiumMonthly: 1150,
      outOfPocketPerChildMonthly: 92,
      dentalVisionMonthly: 75,
      regionalIndex: 0.93,
    },
    foodAndSupplies: {
      foodPerChild: 335,
      diapersAndWipes: 81,
      formulaOrBabyFood: 172,
      householdSupplies: 52,
    },
  },
  {
    locationId: "phoenix",
    displayName: "Phoenix, AZ",
    state: "AZ",
    stateCode: "AZ",
    stageMonthly: {
      infant: stage(1380, 275, 290, 180, 125),
      toddler: stage(1200, 295, 108, 160, 145),
      schoolAge: stage(650, 315, 40, 140, 190),
    },
    housing: {
      avgRent1to2Bed: 1420,
      avgFamilyHome3Plus: 2050,
      tenure: "mortgage",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 480,
      marketplaceFamilyPremiumMonthly: 1080,
      outOfPocketPerChildMonthly: 85,
      dentalVisionMonthly: 70,
      regionalIndex: 0.88,
    },
    foodAndSupplies: {
      foodPerChild: 315,
      diapersAndWipes: 78,
      formulaOrBabyFood: 165,
      householdSupplies: 48,
    },
  },
  {
    locationId: "san-francisco",
    displayName: "San Francisco, CA",
    state: "CA",
    stateCode: "CA",
    stageMonthly: {
      infant: stage(3150, 450, 355, 280, 210),
      toddler: stage(2750, 480, 145, 255, 240),
      schoolAge: stage(1480, 510, 65, 225, 310),
    },
    housing: {
      avgRent1to2Bed: 3600,
      avgFamilyHome3Plus: 5800,
      tenure: "rent",
    },
    healthcare: {
      employerFamilyPremiumMonthly: 740,
      marketplaceFamilyPremiumMonthly: 1720,
      outOfPocketPerChildMonthly: 140,
      dentalVisionMonthly: 98,
      regionalIndex: 1.35,
    },
    foodAndSupplies: {
      foodPerChild: 510,
      diapersAndWipes: 98,
      formulaOrBabyFood: 220,
      householdSupplies: 80,
    },
  },
];

const primaryById = Object.fromEntries(
  PRIMARY_CITY_SEEDS.map((seed) => [seed.locationId, seed]),
) as Record<string, CitySeed>;

const EXPANDED_CITY_SEEDS: CitySeed[] = METRO_EXPANSIONS.map((expansion) => {
  const peer = primaryById[expansion.peerId];
  if (!peer) {
    throw new Error(
      `metroCatalog: missing peer seed "${expansion.peerId}" for ${expansion.locationId}`,
    );
  }
  return expandMetroFromPeer(peer, expansion);
});

const CITY_SEEDS: CitySeed[] = [...PRIMARY_CITY_SEEDS, ...EXPANDED_CITY_SEEDS];

function seedRecord(): Record<string, LocationBaseline> {
  const record: Record<string, LocationBaseline> = {};
  for (const citySeed of CITY_SEEDS) {
    record[citySeed.locationId] = buildBaseline(citySeed);
  }
  return record;
}

const MANUAL_LOCATION_ALIASES: Record<string, string> = {
  austin: "austin",
  "austin-tx": "austin",
  atx: "austin",
  "78704": "austin",
  "new-york": "new-york",
  "new-york-city": "new-york",
  "new-york-ny": "new-york",
  nyc: "new-york",
  manhattan: "new-york",
  "10001": "new-york",
  "los-angeles": "los-angeles",
  la: "los-angeles",
  "los-angeles-ca": "los-angeles",
  chicago: "chicago",
  "chicago-il": "chicago",
  denver: "denver",
  "denver-co": "denver",
  seattle: "seattle",
  "seattle-wa": "seattle",
  dallas: "dallas",
  "dallas-tx": "dallas",
  miami: "miami",
  "miami-fl": "miami",
  boston: "boston",
  "boston-ma": "boston",
  atlanta: "atlanta",
  "atlanta-ga": "atlanta",
  phoenix: "phoenix",
  "phoenix-az": "phoenix",
  "san-francisco": "san-francisco",
  sf: "san-francisco",
  "san-francisco-ca": "san-francisco",
  dc: "washington",
  "washington-dc": "washington",
  "washington-d-c": "washington",
};

function buildLocationAliases(
  baselines: Record<string, LocationBaseline>,
): Record<string, string> {
  const aliases: Record<string, string> = { ...MANUAL_LOCATION_ALIASES };
  for (const baseline of Object.values(baselines)) {
    const id = baseline.locationId;
    aliases[id] = id;
    aliases[`${id}-${baseline.stateCode.toLowerCase()}`] = id;
  }
  return aliases;
}

/**
 * Fully populated local baselines for development and offline fallback.
 * Each city includes stage monthly stacks, housing differential, healthcare,
 * food/supplies, and a derived school-age `annualCosts` for the forecast engine.
 */
export const LOCATION_BASELINES: Record<string, LocationBaseline> = seedRecord();

const LOCATION_ALIASES = buildLocationAliases(LOCATION_BASELINES);

const DEFAULT_LOCATION_ID = "austin";

function normalizeLocationId(locationId: string): string {
  return locationId.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function resolveMockBaseline(locationId: string): LocationBaseline {
  const normalized = normalizeLocationId(locationId);
  const knownId =
    LOCATION_ALIASES[normalized] ??
    (normalized in LOCATION_BASELINES ? normalized : DEFAULT_LOCATION_ID);

  return LOCATION_BASELINES[knownId] as LocationBaseline;
}

/**
 * Placeholder for a future database lookup.
 * Throws when no connection string is configured so callers exercise fallback.
 */
function fetchBaselineFromDatabase(locationId: string): LocationBaseline | null {
  if (!process.env.DATABASE_URL) {
    throw new Error("Database connection unavailable: DATABASE_URL is not set");
  }

  void locationId;
  return null;
}

/**
 * Resolves a location baseline, preferring the database when available.
 * On missing connection, query failure, or empty result, falls back to mock data.
 */
export function getSafeLocationBaseline(locationId: string): LocationBaseline {
  try {
    const fromDb = fetchBaselineFromDatabase(locationId);
    if (fromDb) {
      return fromDb;
    }
  } catch {
    // Database missing or failed — continue with local mock baselines.
  }

  return resolveMockBaseline(locationId);
}

/** Stage monthly stack for a chronological age at a location. */
export function getStageMonthlyForAge(
  baseline: LocationBaseline,
  age: number,
): StageMonthlyBreakdown {
  const stageKey: CareStageKey = ageToCareStage(age);
  return baseline.stageMonthly[stageKey];
}

/** Curated location ids available in mock baselines (sorted). */
export function listCuratedLocationIds(): string[] {
  return Object.keys(LOCATION_BASELINES).sort();
}

export interface NearbyCityCandidate {
  cityName: string;
  citySlug: string;
  stateSlug: string;
  stateName: string;
  estimatedChildRaisingCost: number;
}

/**
 * Builds 5–8 peer city links for internal cross-linking.
 * Prefers same-state metros, then fills by closest annual cost.
 */
export function getNearbyCities(
  locationId: string,
  limit = 6,
): NearbyCityCandidate[] {
  const current = getSafeLocationBaseline(locationId);
  const currentTotal = sumCostBreakdown(current.annualCosts);
  const capped = Math.min(8, Math.max(5, limit));

  const peers = Object.values(LOCATION_BASELINES)
    .filter((baseline) => baseline.locationId !== current.locationId)
    .map((baseline) => {
      const estimatedChildRaisingCost = sumCostBreakdown(baseline.annualCosts);
      const cityName =
        baseline.displayName.split(",")[0]?.trim() || baseline.displayName;
      return {
        cityName,
        citySlug: baseline.locationId,
        stateSlug: baseline.stateCode.toLowerCase(),
        stateName: baseline.stateCode,
        estimatedChildRaisingCost,
        sameState:
          baseline.stateCode.toUpperCase() === current.stateCode.toUpperCase(),
        costDelta: Math.abs(estimatedChildRaisingCost - currentTotal),
      };
    })
    .sort((a, b) => {
      if (a.sameState !== b.sameState) return a.sameState ? -1 : 1;
      return a.costDelta - b.costDelta;
    })
    .slice(0, capped);

  return peers.map(
    ({ cityName, citySlug, stateSlug, stateName, estimatedChildRaisingCost }) => ({
      cityName,
      citySlug,
      stateSlug,
      stateName,
      estimatedChildRaisingCost,
    }),
  );
}
