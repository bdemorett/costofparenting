import type { StateHubData } from "@/lib/stateHub";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildStateSeoTitle(stateName: string): string {
  return `Cost of Raising a Child in ${stateName} (2026 Data) | Cost of Parenting`;
}

export function buildStateSeoDescription(hub: StateHubData): string {
  const avgAnnual =
    hub.avgAnnualExpense != null ? formatUsd(hub.avgAnnualExpense) : null;
  const avgCare =
    hub.avgChildcareMonthly != null
      ? formatUsd(hub.avgChildcareMonthly)
      : null;
  const vs =
    hub.costVsNationalPct == null
      ? "compared with national curated baselines"
      : hub.costVsNationalPct === 0
        ? "in line with the national average"
        : `${hub.costVsNationalPct > 0 ? "+" : ""}${hub.costVsNationalPct}% vs the national average`;

  const parts = [
    `2026 guide to raising a child in ${hub.stateName}`,
    avgAnnual ? `state average about ${avgAnnual}/yr` : null,
    avgCare ? `avg monthly childcare ${avgCare}` : null,
    vs,
    `${hub.cities.length} city cost pages with rankings and a full directory`,
  ].filter(Boolean);

  return `${parts.join(" — ")}.`;
}

/**
 * JSON-LD for state hub pages: WebPage, Dataset, BreadcrumbList.
 */
export function buildStateHubJsonLd(hub: StateHubData, siteUrl: string) {
  const canonicalUrl = `${siteUrl}/${hub.stateSlug}`;
  const title = `Cost of Raising a Child in ${hub.stateName} (2026 Guide)`;

  const variableMeasured = [
    hub.avgAnnualExpense != null
      ? {
          "@type": "PropertyValue" as const,
          name: "State average annual child-rearing expense",
          value: hub.avgAnnualExpense,
          unitText: "USD per year",
        }
      : null,
    hub.avgChildcareMonthly != null
      ? {
          "@type": "PropertyValue" as const,
          name: "State average monthly childcare",
          value: hub.avgChildcareMonthly,
          unitText: "USD per month",
        }
      : null,
    hub.costVsNationalPct != null
      ? {
          "@type": "PropertyValue" as const,
          name: "Cost vs national average",
          value: hub.costVsNationalPct,
          unitText: "percent",
        }
      : null,
    {
      "@type": "PropertyValue" as const,
      name: "Tracked cities in state",
      value: hub.cities.length,
      unitText: "cities",
    },
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description: buildStateSeoDescription(hub),
        isPartOf: {
          "@type": "WebSite",
          name: "Cost of Parenting",
          url: siteUrl,
        },
        about: {
          "@type": "Place",
          name: hub.stateName,
          address: {
            "@type": "PostalAddress",
            addressRegion: hub.stateCode,
            addressCountry: "US",
          },
        },
      },
      {
        "@type": "Dataset",
        "@id": `${canonicalUrl}#dataset`,
        name: `Cost of Parenting — ${hub.stateName} city rankings`,
        description: `Aggregated 2026 childcare and child-rearing cost metrics across ${hub.cities.length} tracked metros in ${hub.stateName}.`,
        url: canonicalUrl,
        creator: {
          "@type": "Organization",
          name: "Cost of Parenting",
          url: siteUrl,
        },
        spatialCoverage: {
          "@type": "AdministrativeArea",
          name: hub.stateName,
          address: {
            "@type": "PostalAddress",
            addressRegion: hub.stateCode,
            addressCountry: "US",
          },
        },
        variableMeasured,
        isAccessibleForFree: true,
        license: `${siteUrl}/terms-of-service`,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
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
            name: hub.stateName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}
