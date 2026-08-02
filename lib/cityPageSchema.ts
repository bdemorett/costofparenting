import type { LocationBaseline } from "@/types/parenting";
import { sumCostBreakdown, sumStageMonthly } from "@/lib/mockData";
import { getStateName } from "@/lib/stateHub";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface CityPageSchemaInput {
  baseline: LocationBaseline;
  cityLabel: string;
  stateSlug: string;
  citySlug: string;
  siteUrl: string;
}

function cityShortName(cityLabel: string): string {
  return cityLabel.split(",")[0]?.trim() || cityLabel;
}

function cityPageUrl(input: CityPageSchemaInput): string {
  const { siteUrl, stateSlug, citySlug } = input;
  return `${siteUrl}/cost-of-parenting/${stateSlug}/${citySlug}`;
}

function stateDisplayName(stateSlug: string, baseline: LocationBaseline): string {
  return (
    getStateName(stateSlug) ||
    baseline.state ||
    baseline.stateCode ||
    stateSlug.toUpperCase()
  );
}

/**
 * BreadcrumbList: Home → State → City.
 */
export function buildCityBreadcrumbList(input: CityPageSchemaInput) {
  const { baseline, cityLabel, stateSlug, siteUrl } = input;
  const pageUrl = cityPageUrl(input);
  const stateLabel = stateDisplayName(stateSlug, baseline);
  const cityName = cityShortName(cityLabel);

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: stateLabel,
        item: `${siteUrl}/${stateSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityName,
        item: pageUrl,
      },
    ],
  };
}

/**
 * FAQPage with dynamic Q&A pairs derived from the city baseline.
 */
export function buildCityFaqPage(input: CityPageSchemaInput) {
  const { baseline, cityLabel } = input;
  const pageUrl = cityPageUrl(input);
  const cityName = cityShortName(cityLabel);
  const place = cityLabel;

  const infant = sumStageMonthly(baseline.stageMonthly.infant);
  const toddler = sumStageMonthly(baseline.stageMonthly.toddler);
  const schoolAge = sumStageMonthly(baseline.stageMonthly.schoolAge);
  const annualTotal = sumCostBreakdown(baseline.annualCosts);
  const avgMonthlyChildcare = Math.round(
    (baseline.stageMonthly.infant.childcare +
      baseline.stageMonthly.toddler.childcare +
      baseline.stageMonthly.schoolAge.childcare) /
      3,
  );
  const housingJump = baseline.housing.familyPremiumMonthly;

  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: `How much does it cost to raise a child in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Our school-age planning baseline for ${place} totals about ${formatUsd(annualTotal)} per year across housing, food, childcare, healthcare, clothing, education, transportation, and miscellaneous costs. Infant stage costs average about ${formatUsd(infant)} per month; figures are illustrative baselines updated ${baseline.updatedAt}.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the average monthly childcare cost in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Average monthly childcare across infant, toddler, and school-age stages in ${place} is about ${formatUsd(avgMonthlyChildcare)}. Infant care alone is about ${formatUsd(baseline.stageMonthly.infant.childcare)}/mo, toddler about ${formatUsd(baseline.stageMonthly.toddler.childcare)}/mo, and school-age about ${formatUsd(baseline.stageMonthly.schoolAge.childcare)}/mo.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the housing cost jump for a family in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Typical 1–2 bedroom housing runs about ${formatUsd(baseline.housing.avgRent1to2Bed)}/mo versus ${formatUsd(baseline.housing.avgFamilyHome3Plus)}/mo for a 3+ bedroom family home (${baseline.housing.tenure}). That is roughly a ${formatUsd(housingJump)} monthly family housing premium in ${place}.`,
        },
      },
      {
        "@type": "Question",
        name: `How do toddler and school-age costs compare in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Toddler (2–4) monthly stage costs in ${place} average about ${formatUsd(toddler)}, while school-age (5+) averages about ${formatUsd(schoolAge)}. Childcare usually falls after kindergarten, while food and activities rise.`,
        },
      },
    ],
  };
}

/**
 * Dataset schema with measured local child-rearing cost metrics.
 */
export function buildCityDataset(input: CityPageSchemaInput) {
  const { baseline, cityLabel, siteUrl } = input;
  const pageUrl = cityPageUrl(input);
  const cityName = cityShortName(cityLabel);
  const annualTotal = sumCostBreakdown(baseline.annualCosts);
  const infantMonthly = sumStageMonthly(baseline.stageMonthly.infant);
  const toddlerMonthly = sumStageMonthly(baseline.stageMonthly.toddler);
  const schoolAgeMonthly = sumStageMonthly(baseline.stageMonthly.schoolAge);

  return {
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: `Cost of Parenting baseline — ${cityLabel}`,
    description: `Stage-based monthly childcare, housing differential, food, and healthcare cost estimates for raising children in ${cityLabel} (2026 planning dollars).`,
    url: pageUrl,
    creator: {
      "@type": "Organization",
      name: "Cost of Parenting",
      url: siteUrl,
    },
    temporalCoverage: baseline.updatedAt,
    spatialCoverage: {
      "@type": "Place",
      name: cityLabel,
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressRegion: baseline.stateCode || baseline.state,
        addressCountry: "US",
      },
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Annual school-age child-rearing baseline",
        value: annualTotal,
        unitText: "USD per year",
      },
      {
        "@type": "PropertyValue",
        name: "Infant monthly parenting costs (0–2)",
        value: infantMonthly,
        unitText: "USD per month",
      },
      {
        "@type": "PropertyValue",
        name: "Toddler monthly parenting costs (2–4)",
        value: toddlerMonthly,
        unitText: "USD per month",
      },
      {
        "@type": "PropertyValue",
        name: "School-age monthly parenting costs (5+)",
        value: schoolAgeMonthly,
        unitText: "USD per month",
      },
      {
        "@type": "PropertyValue",
        name: "Infant center childcare",
        value: baseline.stageMonthly.infant.childcare,
        unitText: "USD per month",
      },
      {
        "@type": "PropertyValue",
        name: "Family housing premium (1–2 bed → 3+)",
        value: baseline.housing.familyPremiumMonthly,
        unitText: "USD per month",
      },
      {
        "@type": "PropertyValue",
        name: "Annual housing share",
        value: baseline.annualCosts.housing,
        unitText: "USD per year",
      },
      {
        "@type": "PropertyValue",
        name: "Annual childcare share",
        value: baseline.annualCosts.childcare,
        unitText: "USD per year",
      },
      {
        "@type": "PropertyValue",
        name: "Annual healthcare share",
        value: baseline.annualCosts.healthcare,
        unitText: "USD per year",
      },
      {
        "@type": "PropertyValue",
        name: "Annual food share",
        value: baseline.annualCosts.food,
        unitText: "USD per year",
      },
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/html",
      contentUrl: pageUrl,
    },
    isAccessibleForFree: true,
    license: `${siteUrl}/terms-of-service`,
  };
}

/**
 * Article schema for the city cost guide (E-E-A-T / rich-result friendly).
 */
export function buildCityArticle(input: CityPageSchemaInput) {
  const { baseline, cityLabel, stateSlug, siteUrl } = input;
  const pageUrl = cityPageUrl(input);
  const cityName = cityShortName(cityLabel);
  const stateLabel = stateDisplayName(stateSlug, baseline);
  const place = `${cityName}, ${stateLabel}`;
  const annualTotal = sumCostBreakdown(baseline.annualCosts);
  const infantCare = baseline.stageMonthly.infant.childcare;

  return {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: `Cost of Raising a Child in ${place} (2026 Data)`,
    name: `Cost of Raising a Child in ${place} (2026 Data)`,
    description: `2026 childcare, housing, food, and healthcare baselines for raising a child in ${place}. School-age annual estimate about ${formatUsd(annualTotal)}; infant center care near ${formatUsd(infantCare)}/mo.`,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    dateModified: baseline.updatedAt,
    datePublished: baseline.updatedAt,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: "Cost of Parenting",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Cost of Parenting",
      url: siteUrl,
    },
    about: {
      "@type": "Place",
      name: cityLabel,
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressRegion: baseline.stateCode || baseline.state,
        addressCountry: "US",
      },
    },
    mentions: [
      {
        "@type": "Thing",
        name: "Childcare costs",
      },
      {
        "@type": "Thing",
        name: "Cost of raising a child",
      },
    ],
  };
}

/**
 * Full JSON-LD document for city cost guides.
 */
export function buildCityPageJsonLd(input: CityPageSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildCityArticle(input),
      buildCityDataset(input),
      buildCityFaqPage(input),
      buildCityBreadcrumbList(input),
    ],
  };
}

/** Absolute SEO title for city guides (bypasses layout title template). */
export function buildCitySeoTitle(place: string): string {
  return `Cost of Raising a Child in ${place} (2026 Data) | Cost of Parenting`;
}

/** Unique meta description with live baseline metrics. */
export function buildCitySeoDescription(
  place: string,
  baseline: LocationBaseline,
): string {
  const annualTotal = sumCostBreakdown(baseline.annualCosts);
  const infantCare = baseline.stageMonthly.infant.childcare;
  const housingJump = baseline.housing.familyPremiumMonthly;
  return `2026 cost of raising a child in ${place}: about ${formatUsd(annualTotal)}/yr school-age baseline, infant daycare near ${formatUsd(infantCare)}/mo, and a ${formatUsd(housingJump)}/mo family housing premium. Childcare, housing, food & healthcare breakdown.`;
}
