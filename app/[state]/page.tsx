import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import {
  getStateHubData,
  listSitemapStateSlugs,
  type StateCityEntry,
} from "@/lib/stateHub";

export const revalidate = 604800;
export const dynamicParams = true;

type PageParams = Promise<{ state: string }>;

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export async function generateStaticParams() {
  return listSitemapStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { state } = await params;
  const hub = getStateHubData(state);
  if (!hub) {
    return { title: "State guide not found" };
  }

  const canonicalUrl = `https://costofparenting.com/${hub.stateSlug}`;
  const title = `Cost of Raising a Child in ${hub.stateName} | City Rankings & Averages`;
  const description = `2026 averages, most expensive and most affordable cities, and a full city directory for raising a child in ${hub.stateName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

function CityRankTable({
  title,
  cities,
  emptyLabel,
}: {
  title: string;
  cities: StateCityEntry[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
        {title}
      </h2>
      {cities.length === 0 ? (
        <p className="mt-4 text-sm text-stone-600">{emptyLabel}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="pb-2 pr-3 font-semibold">Rank</th>
                <th className="pb-2 pr-3 font-semibold">City</th>
                <th className="pb-2 text-right font-semibold">Monthly total</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city, index) => (
                <tr
                  key={city.compoundSlug}
                  className="border-b border-stone-100 last:border-0"
                >
                  <td className="py-3 pr-3 text-stone-500">{index + 1}</td>
                  <td className="py-3 pr-3">
                    <Link
                      href={city.href}
                      className="font-medium text-teal-800 hover:underline"
                    >
                      {city.cityName}
                    </Link>
                  </td>
                  <td className="py-3 text-right font-serif text-base font-semibold text-stone-900">
                    {city.monthlyTotal != null
                      ? formatUsd(city.monthlyTotal)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function StateHubPage({
  params,
}: {
  params: PageParams;
}) {
  const { state } = await params;
  const hub = getStateHubData(state);
  if (!hub) {
    notFound();
  }

  const canonicalUrl = `https://costofparenting.com/${hub.stateSlug}`;
  const vsNational =
    hub.costVsNationalPct == null
      ? "Limited local sample"
      : hub.costVsNationalPct === 0
        ? "In line with national average"
        : `${formatSignedPct(hub.costVsNationalPct)} vs national average`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `Cost of Raising a Child in ${hub.stateName} (2026 Guide)`,
        description: `City rankings and averages for raising a child in ${hub.stateName}.`,
        isPartOf: {
          "@type": "WebSite",
          name: "Cost of Parenting",
          url: "https://costofparenting.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://costofparenting.com/",
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

  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <JsonLd data={jsonLd} />
      <Navbar placeLabel={hub.stateName} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-teal-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-stone-700" aria-current="page">
              {hub.stateName}
            </li>
          </ol>
        </nav>

        <header className="mt-5 border-b border-stone-200/60 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
            {hub.stateCode} state hub · 2026
          </p>
          <h1 className="font-serif mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            Cost of Raising a Child in {hub.stateName} (2026 Guide)
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Averages across {hub.cities.length} tracked{" "}
            {hub.stateName} metros, ranked city leaderboards, and links into
            each local cost guide.
          </p>
        </header>

        <section
          className="mt-8"
          aria-labelledby="state-overview-stats-heading"
        >
          <h2 id="state-overview-stats-heading" className="sr-only">
            {hub.stateName} overview stats
          </h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Avg monthly childcare
              </dt>
              <dd className="font-serif mt-2 text-2xl font-semibold text-stone-900">
                {hub.avgChildcareMonthly != null
                  ? formatUsd(hub.avgChildcareMonthly)
                  : "—"}
              </dd>
              <p className="mt-1 text-xs text-stone-500">
                Infant–school-age center care blend
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                State avg annual expense
              </dt>
              <dd className="font-serif mt-2 text-2xl font-semibold text-stone-900">
                {hub.avgAnnualExpense != null
                  ? formatUsd(hub.avgAnnualExpense)
                  : "—"}
              </dd>
              <p className="mt-1 text-xs text-stone-500">
                School-age reference year, one child
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Cost vs national average
              </dt>
              <dd className="font-serif mt-2 text-2xl font-semibold text-stone-900">
                {hub.costVsNationalPct != null
                  ? formatSignedPct(hub.costVsNationalPct)
                  : "—"}
              </dd>
              <p className="mt-1 text-xs text-stone-500">{vsNational}</p>
            </div>
          </dl>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CityRankTable
            title={`Most Expensive Cities in ${hub.stateName}`}
            cities={hub.mostExpensive}
            emptyLabel="Curated cost baselines are not yet available for rankings in this state."
          />
          <CityRankTable
            title={`Most Affordable Cities in ${hub.stateName}`}
            cities={hub.mostAffordable}
            emptyLabel="Curated cost baselines are not yet available for rankings in this state."
          />
        </div>

        <section
          className="mt-8 rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm sm:p-7"
          aria-labelledby="state-insights-heading"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
            State financial context
          </p>
          <h2
            id="state-insights-heading"
            className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900"
          >
            What shapes family costs in {hub.stateName}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-stone-600">
            {hub.insight}
          </p>
          <p className="mt-4 text-sm text-stone-500">
            National curated baseline average:{" "}
            {formatUsd(hub.nationalAvgAnnual)} / yr. See our{" "}
            <Link href="/methodology" className="text-teal-700 underline">
              methodology
            </Link>{" "}
            for sources and 2026 indexing.
          </p>
        </section>

        <section
          className="mt-8"
          aria-labelledby="city-directory-heading"
        >
          <h2
            id="city-directory-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
          >
            {hub.stateName} city directory
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            Every programmatic city guide currently tracked for {hub.stateName}.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hub.cities.map((city) => (
              <li key={city.compoundSlug}>
                <Link
                  href={city.href}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-stone-200/60 bg-white px-4 py-3 text-sm transition-colors hover:border-teal-700/40 hover:bg-teal-50/40"
                >
                  <span className="font-medium text-stone-800">
                    {city.cityName}
                  </span>
                  {city.monthlyTotal != null ? (
                    <span className="shrink-0 font-serif text-base font-semibold text-stone-900">
                      {formatUsd(city.monthlyTotal)}
                      <span className="ml-1 font-sans text-[10px] font-medium text-stone-500">
                        / mo
                      </span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-stone-400">
                      View guide
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
