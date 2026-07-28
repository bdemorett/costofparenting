import sitemapCitiesCatalog from "@/app/data/sitemap-cities.json";
import { parseCitySlug } from "@/app/data/sitemapCities";
import {
  LOCATION_BASELINES,
  sumCostBreakdown,
} from "@/lib/mockData";
import type { LocationBaseline } from "@/types/parenting";

/** Top-level App Router segments that must never resolve as state hubs. */
export const RESERVED_STATE_SEGMENTS = new Set([
  "about",
  "api",
  "cities",
  "compare",
  "contact",
  "cost-of-parenting",
  "manifest",
  "methodology",
  "move-to",
  "pricing",
  "privacy-policy",
  "sign-in",
  "sign-up",
  "sitemap-index.xml",
  "terms-of-service",
  "tools",
]);

const STATE_NAMES: Record<string, string> = {
  al: "Alabama",
  ak: "Alaska",
  az: "Arizona",
  ar: "Arkansas",
  ca: "California",
  co: "Colorado",
  ct: "Connecticut",
  de: "Delaware",
  dc: "District of Columbia",
  fl: "Florida",
  ga: "Georgia",
  hi: "Hawaii",
  id: "Idaho",
  il: "Illinois",
  in: "Indiana",
  ia: "Iowa",
  ks: "Kansas",
  ky: "Kentucky",
  la: "Louisiana",
  me: "Maine",
  md: "Maryland",
  ma: "Massachusetts",
  mi: "Michigan",
  mn: "Minnesota",
  ms: "Mississippi",
  mo: "Missouri",
  mt: "Montana",
  ne: "Nebraska",
  nv: "Nevada",
  nh: "New Hampshire",
  nj: "New Jersey",
  nm: "New Mexico",
  ny: "New York",
  nc: "North Carolina",
  nd: "North Dakota",
  oh: "Ohio",
  ok: "Oklahoma",
  or: "Oregon",
  pa: "Pennsylvania",
  ri: "Rhode Island",
  sc: "South Carolina",
  sd: "South Dakota",
  tn: "Tennessee",
  tx: "Texas",
  ut: "Utah",
  vt: "Vermont",
  va: "Virginia",
  wa: "Washington",
  wv: "West Virginia",
  wi: "Wisconsin",
  wy: "Wyoming",
};

/** Brief state-specific planning notes for hub pages. */
const STATE_INSIGHTS: Record<string, string> = {
  tx: "Texas has no state personal income tax, which can leave more take-home pay for childcare and housing — but property taxes and metro daycare rates in Austin, Dallas, and Houston still drive large family budgets. Public Pre-K and local workforce-board subsidies vary by county.",
  ca: "California pairs high coastal housing with among the nation’s steepest center-based infant care rates. State dependent exemptions and CalWORKs childcare subsidies help some households, while Proposition-funded K–12 spending keeps public school options relatively strong versus private tuition pressure.",
  ny: "New York’s dependent exemptions and Empire State child tax credit can offset part of NYC-area costs, but market-rate infant care and rent premiums dominate. Outside the city, upstate districts often show lower housing differentials with still-elevated after-school spend.",
  fl: "Florida has no state income tax and a large private childcare market in Miami, Orlando, and Tampa. School-readiness subsidies and Voluntary Pre-K help early years, while hurricane insurance and condo/HOA fees quietly inflate the housing share for many families.",
  wa: "Washington has no state wage income tax, but Seattle-area housing and scarce infant slots push monthly totals well above national averages. State Working Connections Child Care subsidies and strong public school funding partially cushion school-age years.",
  il: "Illinois offers a state EITC and dependent exemptions that matter for middle-income Chicago families, yet Cook County childcare and housing still lead Midwest costs. Downstate metros often trade lower rent for thinner center-based infant supply.",
  co: "Colorado’s Child Care Assistance Program and expanding universal preschool ease toddler years, while Denver–Boulder housing premiums remain the main budget shock. Outdoor-activity and transport costs also run above the Mountain West average.",
  ma: "Massachusetts combines high public school funding with expensive Greater Boston childcare. Dependent exemptions help on the margin; the larger lever is whether families secure contracted slots versus market-rate centers.",
  ga: "Georgia’s quality-rated childcare and lottery-funded Pre-K reduce preschool pressure in Atlanta and beyond, but rapid metro growth keeps housing and after-care elevated. State dependent exemptions are modest relative to private infant care.",
  az: "Arizona’s low state income tax and expanding ESA/public school options change the education tradeoff, while Phoenix and Tucson childcare markets remain capacity-constrained for infants. Heat-driven utilities add a seasonal household uplift.",
};

export type StateCityEntry = {
  citySlug: string;
  stateSlug: string;
  compoundSlug: string;
  cityName: string;
  href: string;
  /** Annual child-rearing total when a curated baseline exists. */
  annualTotal: number | null;
  /** Approximate total monthly expense (annual / 12) when known. */
  monthlyTotal: number | null;
  /** Average monthly childcare across infant/toddler/school-age stages. */
  childcareMonthly: number | null;
  hasBaseline: boolean;
};

export type StateHubData = {
  stateSlug: string;
  stateName: string;
  stateCode: string;
  cities: StateCityEntry[];
  rankedCities: StateCityEntry[];
  mostExpensive: StateCityEntry[];
  mostAffordable: StateCityEntry[];
  avgChildcareMonthly: number | null;
  avgAnnualExpense: number | null;
  nationalAvgAnnual: number;
  costVsNationalPct: number | null;
  insight: string;
};

function titleCaseCity(citySlug: string): string {
  return citySlug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function avgChildcareMonthly(baseline: LocationBaseline): number {
  const { infant, toddler, schoolAge } = baseline.stageMonthly;
  return Math.round(
    (infant.childcare + toddler.childcare + schoolAge.childcare) / 3,
  );
}

function findBaseline(
  citySlug: string,
  stateSlug: string,
): LocationBaseline | null {
  const direct = LOCATION_BASELINES[citySlug];
  if (direct && direct.stateCode.toLowerCase() === stateSlug) {
    return direct;
  }

  return (
    Object.values(LOCATION_BASELINES).find(
      (b) =>
        b.stateCode.toLowerCase() === stateSlug &&
        (b.locationId === citySlug ||
          b.displayName.toLowerCase().startsWith(citySlug.replace(/-/g, " "))),
    ) ?? null
  );
}

export function normalizeStateSlug(segment: string): string {
  return decodeURIComponent(segment || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function getStateName(stateSlug: string): string | null {
  const slug = normalizeStateSlug(stateSlug);
  return STATE_NAMES[slug] ?? null;
}

export function isReservedStateSegment(segment: string): boolean {
  return RESERVED_STATE_SEGMENTS.has(normalizeStateSlug(segment));
}

/** Unique state codes present in the sitemap city catalog. */
export function listSitemapStateSlugs(): string[] {
  const states = new Set<string>();
  for (const entry of sitemapCitiesCatalog.cities) {
    const parsed = parseCitySlug(entry.slug);
    if (parsed?.state) states.add(parsed.state);
  }
  return [...states].sort();
}

export function getNationalAverageAnnual(): number {
  const totals = Object.values(LOCATION_BASELINES).map((b) =>
    sumCostBreakdown(b.annualCosts),
  );
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}

/**
 * Aggregates sitemap cities for a state and enriches with curated baselines.
 */
export function getStateHubData(stateParam: string): StateHubData | null {
  const stateSlug = normalizeStateSlug(stateParam);
  if (!stateSlug || isReservedStateSegment(stateSlug)) return null;

  const stateName = getStateName(stateSlug);
  if (!stateName) return null;

  const cities: StateCityEntry[] = [];

  for (const entry of sitemapCitiesCatalog.cities) {
    const parsed = parseCitySlug(entry.slug);
    if (!parsed || parsed.state !== stateSlug) continue;

    const baseline = findBaseline(parsed.city, stateSlug);
    const annualTotal = baseline
      ? sumCostBreakdown(baseline.annualCosts)
      : null;
    const cityName = baseline
      ? baseline.displayName.split(",")[0]?.trim() || titleCaseCity(parsed.city)
      : titleCaseCity(parsed.city);

    cities.push({
      citySlug: parsed.city,
      stateSlug,
      compoundSlug: entry.slug,
      cityName,
      href: `/${stateSlug}/${parsed.city}`,
      annualTotal,
      monthlyTotal:
        annualTotal != null ? Math.round(annualTotal / 12) : null,
      childcareMonthly: baseline ? avgChildcareMonthly(baseline) : null,
      hasBaseline: Boolean(baseline),
    });
  }

  if (cities.length === 0) return null;

  cities.sort((a, b) => a.cityName.localeCompare(b.cityName));

  const rankedCities = cities
    .filter((c) => c.monthlyTotal != null)
    .sort((a, b) => (b.monthlyTotal ?? 0) - (a.monthlyTotal ?? 0));

  const mostExpensive = rankedCities.slice(0, 5);
  const mostAffordable = [...rankedCities]
    .sort((a, b) => (a.monthlyTotal ?? 0) - (b.monthlyTotal ?? 0))
    .slice(0, 5);

  const withAnnual = rankedCities.filter((c) => c.annualTotal != null);
  const withCare = rankedCities.filter((c) => c.childcareMonthly != null);

  const avgAnnualExpense =
    withAnnual.length > 0
      ? Math.round(
          withAnnual.reduce((s, c) => s + (c.annualTotal as number), 0) /
            withAnnual.length,
        )
      : null;

  const avgChildcareMonthlyValue =
    withCare.length > 0
      ? Math.round(
          withCare.reduce((s, c) => s + (c.childcareMonthly as number), 0) /
            withCare.length,
        )
      : null;

  const nationalAvgAnnual = getNationalAverageAnnual();
  const costVsNationalPct =
    avgAnnualExpense != null && nationalAvgAnnual > 0
      ? Math.round(
          ((avgAnnualExpense - nationalAvgAnnual) / nationalAvgAnnual) * 100,
        )
      : null;

  const insight =
    STATE_INSIGHTS[stateSlug] ??
    `${stateName} family budgets are shaped by local childcare capacity, housing premiums when moving into family-sized homes, and public school funding that can reduce (or shift) private education spend. Use the city guides below for metro-level stacks indexed to 2026 dollars.`;

  return {
    stateSlug,
    stateName,
    stateCode: stateSlug.toUpperCase(),
    cities,
    rankedCities,
    mostExpensive,
    mostAffordable,
    avgChildcareMonthly: avgChildcareMonthlyValue,
    avgAnnualExpense,
    nationalAvgAnnual,
    costVsNationalPct,
    insight,
  };
}
