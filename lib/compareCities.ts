import { parseCitySlug } from "@/app/data/sitemapCities";
import {
  LOCATION_BASELINES,
  sumCostBreakdown,
} from "@/lib/mockData";
import type { LocationBaseline } from "@/types/parenting";

export type CompareCityRef = {
  /** Compound slug e.g. `austin-tx`. */
  slug: string;
  citySlug: string;
  stateSlug: string;
  locationId: string;
  baseline: LocationBaseline;
  displayCity: string;
  displayState: string;
  href: string;
};

export type CompareMetrics = {
  housingMonthly: number;
  childcareMonthly: number;
  healthcareMonthly: number;
  foodMonthly: number;
  educationMonthly: number;
  annualTotal: number;
  costOfLivingIndex: number;
};

/**
 * Parses `/compare/{city1}-vs-{city2}` slug into compound city slugs.
 * Example: `austin-tx-vs-dallas-tx` → `{ city1: "austin-tx", city2: "dallas-tx" }`
 */
export function parseCompareSlug(
  slug: string,
): { city1: string; city2: string } | null {
  const normalized = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
  if (!normalized.includes("-vs-")) return null;

  const [city1, city2] = normalized.split("-vs-");
  if (!city1?.trim() || !city2?.trim()) return null;
  return { city1: city1.trim(), city2: city2.trim() };
}

export function buildCompareSlug(city1: string, city2: string): string {
  return `${String(city1).toLowerCase()}-vs-${String(city2).toLowerCase()}`;
}

/**
 * Resolves a compound city slug (`austin-tx`) to curated baseline + route href.
 */
export function resolveCompareCity(compoundSlug: string): CompareCityRef | null {
  const normalized = String(compoundSlug || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
  if (!normalized) return null;

  const parsed = parseCitySlug(normalized);
  if (!parsed) return null;

  const locationId =
    LOCATION_BASELINES[parsed.city]?.locationId ??
    Object.values(LOCATION_BASELINES).find(
      (b) =>
        b.locationId === parsed.city ||
        b.displayName.toLowerCase().includes(parsed.city.replace(/-/g, " ")),
    )?.locationId;

  const baseline =
    (locationId && LOCATION_BASELINES[locationId]) ||
    LOCATION_BASELINES[parsed.city];

  if (!baseline) return null;

  const displayCity =
    baseline.displayName.split(",")[0]?.trim() ||
    parsed.city
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    slug: normalized,
    citySlug: parsed.city,
    stateSlug: parsed.state,
    locationId: baseline.locationId,
    baseline,
    displayCity,
    displayState: (baseline.stateCode || parsed.state).toUpperCase(),
    href: `/cost-of-parenting/${parsed.state}/${parsed.city}`,
  };
}

export function getCompareMetrics(baseline: LocationBaseline): CompareMetrics {
  const childcareMonthly = Math.round(
    (baseline.stageMonthly.infant.childcare +
      baseline.stageMonthly.toddler.childcare +
      baseline.stageMonthly.schoolAge.childcare) /
      3,
  );

  const healthcareMonthly = Math.round(
    baseline.healthcare.employerFamilyPremiumMonthly +
      baseline.healthcare.outOfPocketPerChildMonthly,
  );

  return {
    housingMonthly: baseline.housing.familyPremiumMonthly,
    childcareMonthly,
    healthcareMonthly,
    foodMonthly: baseline.foodAndSupplies.foodPerChild,
    educationMonthly: Math.round(baseline.annualCosts.education / 12),
    annualTotal: sumCostBreakdown(baseline.annualCosts),
    costOfLivingIndex: baseline.healthcare.regionalIndex,
  };
}

/** Percent difference of `value` vs `baseline` (positive = value is higher). */
export function percentDifference(value: number, baseline: number): number {
  if (!baseline) return 0;
  return Math.round(((value - baseline) / baseline) * 100);
}

/**
 * Builds static compare pairs as single-segment slugs: `city1-vs-city2`.
 */
export function listCompareStaticParams(): Array<{ slug: string }> {
  const cities = Object.values(LOCATION_BASELINES).map((b) => ({
    slug: `${b.locationId}-${b.stateCode.toLowerCase()}`,
    state: b.stateCode.toUpperCase(),
  }));

  const pairs: Array<{ slug: string }> = [];
  const seen = new Set<string>();

  function push(a: string, b: string) {
    if (a === b) return;
    const key = [a, b].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ slug: buildCompareSlug(a, b) });
  }

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      if (cities[i].state === cities[j].state) {
        push(cities[i].slug, cities[j].slug);
      }
    }
  }

  const featured = [
    "austin-tx",
    "dallas-tx",
    "new-york-ny",
    "los-angeles-ca",
    "san-francisco-ca",
    "chicago-il",
    "denver-co",
    "seattle-wa",
    "miami-fl",
    "boston-ma",
  ];
  for (let i = 0; i < featured.length; i++) {
    for (let j = i + 1; j < Math.min(featured.length, i + 4); j++) {
      push(featured[i], featured[j]);
    }
  }

  return pairs;
}
