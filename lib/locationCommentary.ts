import type { CareStageKey, LocationBaseline } from "@/types/parenting";
import {
  LOCATION_BASELINES,
  sumCostBreakdown,
  sumStageMonthly,
} from "@/lib/mockData";
import { getStateSubsidyProfile } from "@/lib/stateSubsidies";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedPct(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "roughly in line with";
  if (rounded > 0) return `${rounded}% above`;
  return `${Math.abs(rounded)}% below`;
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length] as T;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return h;
}

export type NationalCostBenchmarks = {
  infantChildcare: number;
  toddlerChildcare: number;
  schoolAgeChildcare: number;
  infantStageMonthly: number;
  annualTotal: number;
  housingPremiumMonthly: number;
  foodPerChild: number;
  employerFamilyPremium: number;
};

/** National means across curated LOCATION_BASELINES (planning sample). */
export function getNationalCostBenchmarks(): NationalCostBenchmarks {
  const cities = Object.values(LOCATION_BASELINES);
  const n = Math.max(1, cities.length);
  const avg = (fn: (b: LocationBaseline) => number) =>
    Math.round(cities.reduce((s, b) => s + fn(b), 0) / n);

  return {
    infantChildcare: avg((b) => b.stageMonthly.infant.childcare),
    toddlerChildcare: avg((b) => b.stageMonthly.toddler.childcare),
    schoolAgeChildcare: avg((b) => b.stageMonthly.schoolAge.childcare),
    infantStageMonthly: avg((b) => sumStageMonthly(b.stageMonthly.infant)),
    annualTotal: avg((b) => sumCostBreakdown(b.annualCosts)),
    housingPremiumMonthly: avg((b) => b.housing.familyPremiumMonthly),
    foodPerChild: avg((b) => b.foodAndSupplies.foodPerChild),
    employerFamilyPremium: avg(
      (b) => b.healthcare.employerFamilyPremiumMonthly,
    ),
  };
}

export type LocationCostMetrics = {
  cityName: string;
  stateName: string;
  stateCode: string;
  childcareVsNationalPct: number;
  infantCareVsNationalPct: number;
  toddlerCareVsNationalPct: number;
  annualVsNationalPct: number;
  housingVsNationalPct: number;
  foodVsNationalPct: number;
  healthcareIndex: number;
  healthcareVsNationalPct: number;
  /** Estimated local median income vs national (from subsidy profile). */
  medianIncomeIndex: number;
  /** Childcare burden relative to local income index. */
  careToIncomePressure: number;
  infantMonthly: number;
  toddlerMonthly: number;
  schoolAgeMonthly: number;
  annualTotal: number;
  infantChildcare: number;
  toddlerChildcare: number;
  schoolAgeChildcare: number;
  housingPremiumMonthly: number;
  national: NationalCostBenchmarks;
};

export function computeLocationCostMetrics(
  baseline: LocationBaseline,
  cityName: string,
  stateName: string,
): LocationCostMetrics {
  const national = getNationalCostBenchmarks();
  const stateCode = baseline.stateCode.toUpperCase();
  const subsidies = getStateSubsidyProfile(stateCode);

  const infantChildcare = baseline.stageMonthly.infant.childcare;
  const toddlerChildcare = baseline.stageMonthly.toddler.childcare;
  const schoolAgeChildcare = baseline.stageMonthly.schoolAge.childcare;
  const infantMonthly = sumStageMonthly(baseline.stageMonthly.infant);
  const toddlerMonthly = sumStageMonthly(baseline.stageMonthly.toddler);
  const schoolAgeMonthly = sumStageMonthly(baseline.stageMonthly.schoolAge);
  const annualTotal = sumCostBreakdown(baseline.annualCosts);

  const pct = (local: number, nat: number) =>
    nat > 0 ? ((local - nat) / nat) * 100 : 0;

  const childcareAvgLocal =
    (infantChildcare + toddlerChildcare + schoolAgeChildcare) / 3;
  const childcareAvgNat =
    (national.infantChildcare +
      national.toddlerChildcare +
      national.schoolAgeChildcare) /
    3;

  const childcareVsNationalPct = pct(childcareAvgLocal, childcareAvgNat);
  const medianIncomeIndex = subsidies.medianIncomeIndex;
  const careToIncomePressure =
    medianIncomeIndex > 0
      ? (1 + childcareVsNationalPct / 100) / medianIncomeIndex
      : 1;

  return {
    cityName,
    stateName,
    stateCode,
    childcareVsNationalPct,
    infantCareVsNationalPct: pct(infantChildcare, national.infantChildcare),
    toddlerCareVsNationalPct: pct(toddlerChildcare, national.toddlerChildcare),
    annualVsNationalPct: pct(annualTotal, national.annualTotal),
    housingVsNationalPct: pct(
      baseline.housing.familyPremiumMonthly,
      national.housingPremiumMonthly,
    ),
    foodVsNationalPct: pct(
      baseline.foodAndSupplies.foodPerChild,
      national.foodPerChild,
    ),
    healthcareIndex: baseline.healthcare.regionalIndex,
    healthcareVsNationalPct: pct(baseline.healthcare.regionalIndex, 1),
    medianIncomeIndex,
    careToIncomePressure,
    infantMonthly,
    toddlerMonthly,
    schoolAgeMonthly,
    annualTotal,
    infantChildcare,
    toddlerChildcare,
    schoolAgeChildcare,
    housingPremiumMonthly: baseline.housing.familyPremiumMonthly,
    national,
  };
}

export type StageCommentary = {
  key: CareStageKey;
  label: string;
  ages: string;
  blurb: string;
  lead: string;
  bullets: string[];
};

export type ExpenseWhyKey =
  | "housing"
  | "childcare"
  | "food"
  | "transportation"
  | "healthcare"
  | "clothing"
  | "misc";

export type SynthesizedLocationContent = {
  metrics: LocationCostMetrics;
  introParagraphs: string[];
  stageCommentary: Record<CareStageKey, StageCommentary>;
  expenseWhys: Record<ExpenseWhyKey, string>;
  infantSection: { title: string; paragraphs: string[]; bullets: string[] };
  preschoolSection: { title: string; paragraphs: string[]; bullets: string[] };
  healthcareSection: { title: string; paragraphs: string[]; bullets: string[] };
  educationSection: { title: string; paragraphs: string[]; bullets: string[] };
  closingParagraphs: string[];
  subsidyFraming: string;
  estimatedWordCount: number;
};

function countWords(parts: string[]): number {
  return parts
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Dynamic sentence synthesizer — builds location-unique commentary from
 * national deviations, income indices, and state subsidy framing.
 */
export function synthesizeLocationContent(
  baseline: LocationBaseline,
  cityName: string,
  stateName: string,
): SynthesizedLocationContent {
  const metrics = computeLocationCostMetrics(baseline, cityName, stateName);
  const subsidies = getStateSubsidyProfile(metrics.stateCode);
  const seed = hashSeed(baseline.locationId + metrics.stateCode);
  const careBand =
    metrics.childcareVsNationalPct > 12
      ? "high"
      : metrics.childcareVsNationalPct < -8
        ? "low"
        : "mid";
  const housingBand =
    metrics.housingVsNationalPct > 12
      ? "high"
      : metrics.housingVsNationalPct < -8
        ? "low"
        : "mid";

  const introOpeners = {
    high: [
      `In ${cityName}, early-care prices sit ${formatSignedPct(metrics.childcareVsNationalPct)} the curated national metro average — so Year 1 budgets hinge on infant slots and leave length more than on grocery math.`,
      `${cityName} parents face childcare rates ${formatSignedPct(metrics.childcareVsNationalPct)} national peer metros, which means a dual-income return-to-work plan can be the difference between surplus and strain.`,
    ],
    mid: [
      `${cityName} tracks closer to national childcare norms (${formatSignedPct(metrics.childcareVsNationalPct)} the curated average), so housing premiums and healthcare contributions often decide whether the school-age year feels manageable.`,
      `Raising a child in ${cityName} looks near the middle of U.S. metros on care (${formatSignedPct(metrics.childcareVsNationalPct)} national), which puts more weight on the family housing jump and local tax offsets.`,
    ],
    low: [
      `${cityName} childcare runs ${formatSignedPct(metrics.childcareVsNationalPct)} the national curated average, giving families more room — but local median incomes (${Math.round(metrics.medianIncomeIndex * 100)}% of national) still determine true affordability.`,
      `On paper, ${cityName} infant and toddler care is ${formatSignedPct(metrics.childcareVsNationalPct)} national peers; the practical constraint is whether wages and subsidies keep pace with housing.`,
    ],
  };

  const incomeSentences = [
    `Our planning model treats local median household income at about ${Math.round(metrics.medianIncomeIndex * 100)}% of the national index, so a care-to-income pressure score of ${metrics.careToIncomePressure.toFixed(2)} signals how hard center-based care presses against typical earnings.`,
    `With local median income modeled near ${Math.round(metrics.medianIncomeIndex * 100)}% of national, childcare that is ${formatSignedPct(metrics.childcareVsNationalPct)} peer metros produces a care-to-income pressure of ${metrics.careToIncomePressure.toFixed(2)} — useful when comparing ${cityName} to other ${stateName} hubs.`,
  ];

  const annualSentences = [
    `The school-age annual baseline for one child lands near ${formatUsd(metrics.annualTotal)} (${formatSignedPct(metrics.annualVsNationalPct)} the national curated mean of ${formatUsd(metrics.national.annualTotal)}), before personalized Premium forecasts.`,
    `Across housing, food, childcare, healthcare, clothing, education, transport, and misc, ${cityName}’s school-age year totals about ${formatUsd(metrics.annualTotal)} — ${formatSignedPct(metrics.annualVsNationalPct)} the ${formatUsd(metrics.national.annualTotal)} national sample average.`,
  ];

  const introParagraphs = [
    pick(introOpeners[careBand], seed),
    pick(incomeSentences, seed + 1),
    pick(annualSentences, seed + 2),
    `${subsidies.dependentTaxFraming}`,
  ];

  const infantBlurb = pick(
    [
      `Full-day care near ${formatUsd(metrics.infantChildcare)}/mo plus diapers and formula push infant totals to about ${formatUsd(metrics.infantMonthly)}/mo in ${cityName}.`,
      `Infant months average ${formatUsd(metrics.infantMonthly)} — driven by center care at ${formatUsd(metrics.infantChildcare)}/mo (${formatSignedPct(metrics.infantCareVsNationalPct)} national).`,
    ],
    seed + 3,
  );

  const toddlerBlurb = pick(
    [
      `Preschool-era months stay elevated at about ${formatUsd(metrics.toddlerMonthly)}, with toddler care near ${formatUsd(metrics.toddlerChildcare)}/mo (${formatSignedPct(metrics.toddlerCareVsNationalPct)} national).`,
      `Toddler costs in ${cityName} average ${formatUsd(metrics.toddlerMonthly)}/mo as supplies ease but tuition remains the headline.`,
    ],
    seed + 4,
  );

  const schoolBlurb = pick(
    [
      `School-age months settle near ${formatUsd(metrics.schoolAgeMonthly)} as after-care (${formatUsd(metrics.schoolAgeChildcare)}/mo) replaces daycare and activities rise.`,
      `By age 5+, ${cityName} stage totals average ${formatUsd(metrics.schoolAgeMonthly)}/mo — still material, but usually below the infant peak.`,
    ],
    seed + 5,
  );

  const stageCommentary: Record<CareStageKey, StageCommentary> = {
    infant: {
      key: "infant",
      label: "Infant",
      ages: "0–2 yrs",
      blurb: infantBlurb,
      lead: `Infant care is the cash-flow peak in ${cityName}: center rates of ${formatUsd(metrics.infantChildcare)}/mo sit ${formatSignedPct(metrics.infantCareVsNationalPct)} the national curated average of ${formatUsd(metrics.national.infantChildcare)}.`,
      bullets: [
        `Stage total ≈ ${formatUsd(metrics.infantMonthly)}/mo including food, supplies, healthcare share, and other.`,
        `Diapers and wipes alone run about ${formatUsd(baseline.foodAndSupplies.diapersAndWipes)}/mo; formula/baby food adds ~${formatUsd(baseline.foodAndSupplies.formulaOrBabyFood)}.`,
        `Paid leave length matters: every unpaid week multiplies pressure when infant care is ${formatSignedPct(metrics.infantCareVsNationalPct)} national.`,
        `Compare family-care or nanny options against the ${formatUsd(metrics.infantChildcare)} center baseline before locking a contract.`,
      ],
    },
    toddler: {
      key: "toddler",
      label: "Toddler",
      ages: "2–4 yrs",
      blurb: toddlerBlurb,
      lead: `Toddler / preschool years in ${cityName} average ${formatUsd(metrics.toddlerMonthly)}/mo, with care at ${formatUsd(metrics.toddlerChildcare)} (${formatSignedPct(metrics.toddlerCareVsNationalPct)} national).`,
      bullets: [
        `Supply spend eases versus infancy, but tuition often stays sticky until public Pre-K seats open.`,
        `State Pre-K and subsidy programs in ${stateName} can replace a private preschool year — see local subsidies below.`,
        `Food rises toward ${formatUsd(baseline.foodAndSupplies.foodPerChild)}/mo as diets expand.`,
        `Model wraparound care if public Pre-K hours do not cover full-time work schedules.`,
      ],
    },
    schoolAge: {
      key: "schoolAge",
      label: "School age",
      ages: "5+ yrs",
      blurb: schoolBlurb,
      lead: `School-age costs in ${cityName} average ${formatUsd(metrics.schoolAgeMonthly)}/mo, with after-school care near ${formatUsd(metrics.schoolAgeChildcare)}.`,
      bullets: [
        `Annual school-age baseline ≈ ${formatUsd(metrics.annualTotal)} across major categories.`,
        `Education and activities grow inside clothing/education/misc shares even as full-day daycare ends.`,
        `Public school quality and after-care availability in ${stateName} change whether private tuition re-enters the budget.`,
        `Healthcare OOP and dental/vision still add about ${formatUsd(baseline.healthcare.outOfPocketPerChildMonthly + baseline.healthcare.dentalVisionMonthly * 0.25)}/mo in planning terms.`,
      ],
    },
  };

  const expenseWhys: Record<ExpenseWhyKey, string> = {
    housing: pick(
      [
        `Family housing in ${cityName} carries a ${formatUsd(metrics.housingPremiumMonthly)}/mo premium from 1–2 bed to 3+ (${baseline.housing.tenure}) — ${formatSignedPct(metrics.housingVsNationalPct)} the national curated housing jump. That differential, not just sticker rent, drives the annual housing share.`,
        `${cityName}’s housing band is ${housingBand}: the family premium of ${formatUsd(metrics.housingPremiumMonthly)}/mo is ${formatSignedPct(metrics.housingVsNationalPct)} peer metros, so long-run budgets feel the bedroom upgrade even when childcare later falls.`,
      ],
      seed + 6,
    ),
    childcare: pick(
      [
        `Childcare in ${cityName} averages ${formatSignedPct(metrics.childcareVsNationalPct)} national peers. Infant centers near ${formatUsd(metrics.infantChildcare)}/mo set the Year 1 ceiling; school-age after-care near ${formatUsd(metrics.schoolAgeChildcare)}/mo keeps a durable floor.`,
        `With care-to-income pressure at ${metrics.careToIncomePressure.toFixed(2)}, ${cityName} families should treat daycare invoices as a wage-relative cost — especially when local incomes sit at ${Math.round(metrics.medianIncomeIndex * 100)}% of national.`,
      ],
      seed + 7,
    ),
    food: pick(
      [
        `Child food in ${cityName} runs about ${formatUsd(baseline.foodAndSupplies.foodPerChild)}/mo (${formatSignedPct(metrics.foodVsNationalPct)} national). Infant formula adds another ${formatUsd(baseline.foodAndSupplies.formulaOrBabyFood)} early on before grocery patterns normalize.`,
        `Grocery share for one school-age child is near ${formatUsd(baseline.foodAndSupplies.foodPerChild)} in ${cityName}. Regional food prices and dining-out norms explain why this line sits ${formatSignedPct(metrics.foodVsNationalPct)} the curated national mean.`,
      ],
      seed + 8,
    ),
    transportation: pick(
      [
        `Car seats, larger vehicles, and activity miles add a child-driven transport tax in ${cityName}. In ${stateName}, commute patterns and weak transit for family errands keep this line from shrinking even after daycare drop-offs end.`,
        `${cityName} transportation costs reflect school runs and extracurricular travel more than infant gear alone — a recurring share that compounds across the school-age years in ${stateName}.`,
      ],
      seed + 9,
    ),
    healthcare: pick(
      [
        `${cityName} healthcare sits at a regional index of ${metrics.healthcareIndex.toFixed(2)} (${formatSignedPct(metrics.healthcareVsNationalPct)} national). Employer family contributions near ${formatUsd(baseline.healthcare.employerFamilyPremiumMonthly)}/mo plus child OOP of ${formatUsd(baseline.healthcare.outOfPocketPerChildMonthly)} form the annual healthcare share.`,
        `Marketplace family premiums near ${formatUsd(baseline.healthcare.marketplaceFamilyPremiumMonthly)}/mo highlight why dual-coverage choices matter in ${cityName} when the regional index is ${metrics.healthcareIndex.toFixed(2)}.`,
      ],
      seed + 10,
    ),
    clothing: pick(
      [
        `Kids outgrow sizes quickly in ${cityName}. Seasonal gear and school clothes keep clothing as a smaller but recurring slice — especially where winters or sports culture raise replacement frequency in ${stateName}.`,
        `Clothing stays modest versus care and housing in ${cityName}, but activity kits and rapid size changes still show up every school year.`,
      ],
      seed + 11,
    ),
    misc: pick(
      [
        `Diapers early, then activities, gifts, and household uplift land in misc for ${cityName}. Education-adjacent fees often hide here when districts charge for after-care add-ons or supplies.`,
        `Miscellaneous costs in ${cityName} absorb the soft expenses that do not fit housing or childcare — and they scale with the number of activities families stack onto the school-age years.`,
      ],
      seed + 12,
    ),
  };

  const infantSection = {
    title: `Infant care (0–2) in ${cityName}`,
    paragraphs: [
      stageCommentary.infant.lead,
      `Compared with the national curated infant stage total of ${formatUsd(metrics.national.infantStageMonthly)}/mo, ${cityName}’s ${formatUsd(metrics.infantMonthly)} stack is ${formatSignedPct(metrics.infantCareVsNationalPct)} on the care line alone — and that gap widens when formula and diapers are included.`,
      pick(
        [
          `Families relying on center-based care should stress-test unpaid leave weeks: each month without wages while paying ${formatUsd(metrics.infantChildcare)} for a slot can erase months of prior savings.`,
          `If one parent plans to stay home, cash childcare falls — but the opportunity cost of wages in a metro where care is ${formatSignedPct(metrics.childcareVsNationalPct)} national still belongs in the decision.`,
        ],
        seed + 13,
      ),
    ],
    bullets: stageCommentary.infant.bullets,
  };

  const preschoolSection = {
    title: `Preschool & toddler years in ${cityName}`,
    paragraphs: [
      stageCommentary.toddler.lead,
      `Public Pre-K and subsidy programs in ${stateName} are the main structural break in this curve. Where seats exist, families can swap a ${formatUsd(metrics.toddlerChildcare)}/mo private tuition line for wraparound-only costs.`,
      `Until then, toddler months remain closer to infant economics than to school-age ones — especially when care sits ${formatSignedPct(metrics.toddlerCareVsNationalPct)} national.`,
    ],
    bullets: stageCommentary.toddler.bullets,
  };

  const healthcareSection = {
    title: `Healthcare & family premiums in ${cityName}`,
    paragraphs: [
      `Healthcare planning in ${cityName} starts from a regional index of ${metrics.healthcareIndex.toFixed(2)}. Employer family contributions average about ${formatUsd(baseline.healthcare.employerFamilyPremiumMonthly)}/mo versus marketplace estimates near ${formatUsd(baseline.healthcare.marketplaceFamilyPremiumMonthly)}.`,
      `Out-of-pocket care per child near ${formatUsd(baseline.healthcare.outOfPocketPerChildMonthly)}/mo and dental/vision near ${formatUsd(baseline.healthcare.dentalVisionMonthly)} should be reserved even when premiums look stable.`,
      `Because local incomes are modeled at ${Math.round(metrics.medianIncomeIndex * 100)}% of national, high-deductible plans can interact badly with infant specialist visits — keep an emergency buffer sized to your plan’s OOP maximum.`,
    ],
    bullets: [
      `Regional healthcare index: ${metrics.healthcareIndex.toFixed(2)} (${formatSignedPct(metrics.healthcareVsNationalPct)} national).`,
      `Employer family premium contrib. ≈ ${formatUsd(baseline.healthcare.employerFamilyPremiumMonthly)}/mo.`,
      `Child OOP planning ≈ ${formatUsd(baseline.healthcare.outOfPocketPerChildMonthly)}/mo.`,
      `Dental + vision family add-on ≈ ${formatUsd(baseline.healthcare.dentalVisionMonthly)}/mo.`,
    ],
  };

  const educationSection = {
    title: `Education, activities & long-run schooling in ${cityName}`,
    paragraphs: [
      `Once full-day daycare ends, ${cityName} budgets shift toward after-school care (${formatUsd(metrics.schoolAgeChildcare)}/mo), activities, and optional private school — not a single “education” invoice.`,
      `Annual education-adjacent shares in the school-age baseline (education + misc clothing/activity bleed) still matter: the published annual total of ${formatUsd(metrics.annualTotal)} already embeds those soft costs.`,
      `State public-school funding and Pre-K policy in ${stateName} change whether families reintroduce private tuition. Pair this page with the subsidies section to see which local programs can shrink the private-preschool window.`,
    ],
    bullets: [
      `School-age after-care baseline ≈ ${formatUsd(metrics.schoolAgeChildcare)}/mo.`,
      `Annual education category ≈ ${formatUsd(baseline.annualCosts.education)}.`,
      `Annual miscellaneous (activities/supplies bleed) ≈ ${formatUsd(baseline.annualCosts.miscellaneous)}.`,
      `Compare public vs private paths before assuming K–12 costs match coastal peer metros.`,
    ],
  };

  const closingParagraphs = [
    `Taken together, ${cityName}’s profile — childcare ${formatSignedPct(metrics.childcareVsNationalPct)} national, housing premium ${formatSignedPct(metrics.housingVsNationalPct)} national, healthcare index ${metrics.healthcareIndex.toFixed(2)}, and income index ${Math.round(metrics.medianIncomeIndex * 100)}% — explains why two families with the same gross salary can feel wildly different levels of strain.`,
    `Use the stage tabs and expense breakdown for transparent local numbers, then layer ${stateName} credits and assistance programs before you treat any single monthly figure as destiny. Data vintage ${baseline.updatedAt}; figures are illustrative planning baselines, not provider quotes.`,
  ];

  const allText = [
    ...introParagraphs,
    ...Object.values(stageCommentary).flatMap((s) => [
      s.blurb,
      s.lead,
      ...s.bullets,
    ]),
    ...Object.values(expenseWhys),
    ...infantSection.paragraphs,
    ...infantSection.bullets,
    ...preschoolSection.paragraphs,
    ...preschoolSection.bullets,
    ...healthcareSection.paragraphs,
    ...healthcareSection.bullets,
    ...educationSection.paragraphs,
    ...educationSection.bullets,
    ...closingParagraphs,
    subsidies.dependentTaxFraming,
    ...subsidies.programs.flatMap((p) => [p.summary, p.planningNote]),
  ];

  return {
    metrics,
    introParagraphs,
    stageCommentary,
    expenseWhys,
    infantSection,
    preschoolSection,
    healthcareSection,
    educationSection,
    closingParagraphs,
    subsidyFraming: subsidies.dependentTaxFraming,
    estimatedWordCount: countWords(allText),
  };
}
