import type { LocationBaseline } from "@/types/parenting";
import { sumCostBreakdown, sumStageMonthly } from "@/lib/mockData";

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

/**
 * BreadcrumbList: Home → State → City.
 */
export function buildCityBreadcrumbList(input: CityPageSchemaInput) {
  const { baseline, cityLabel, stateSlug, citySlug, siteUrl } = input;
  const pageUrl = `${siteUrl}/cost-of-parenting/${stateSlug}/${citySlug}`;
  const stateLabel = baseline.stateCode || baseline.state;
  const cityName = cityShortName(cityLabel);

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
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
  const { baseline, cityLabel, stateSlug, citySlug, siteUrl } = input;
  const pageUrl = `${siteUrl}/cost-of-parenting/${stateSlug}/${citySlug}`;
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
 * Dataset schema describing the city cost baseline (optional companion graph node).
 */
export function buildCityDataset(input: CityPageSchemaInput) {
  const { baseline, cityLabel, stateSlug, citySlug, siteUrl } = input;
  const pageUrl = `${siteUrl}/cost-of-parenting/${stateSlug}/${citySlug}`;

  return {
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: `Cost of Parenting baseline — ${cityLabel}`,
    description: `Stage-based monthly childcare, housing differential, food, and healthcare cost estimates for raising children in ${cityLabel}.`,
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
        addressLocality: cityShortName(cityLabel),
        addressRegion: baseline.stateCode || baseline.state,
        addressCountry: "US",
      },
    },
    variableMeasured: [
      "Infant monthly parenting costs (0–2)",
      "Toddler monthly parenting costs (2–4)",
      "School-age monthly parenting costs (5+)",
      "1–2 bedroom vs 3+ bedroom housing differential",
      "Family healthcare premium factors",
      "Food and supplies monthly estimates",
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
 * Full JSON-LD document for city cost guides: Dataset + FAQPage + BreadcrumbList.
 */
export function buildCityPageJsonLd(input: CityPageSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildCityDataset(input),
      buildCityFaqPage(input),
      buildCityBreadcrumbList(input),
    ],
  };
}
