import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClsSafeAdSlot from "@/components/ads/ClsSafeAdSlot";
import { CostExperienceProvider } from "@/components/calculator/CostExperienceContext";
import CostDataFeed from "@/components/calculator/CostDataFeed";
import FamilyCostConsole from "@/components/calculator/FamilyCostConsole";
import AgeStageBreakdown from "@/components/content/AgeStageBreakdown";
import AuthorityArticle from "@/components/content/AuthorityArticle";
import CalculatorCtaCard from "@/components/content/CalculatorCtaCard";
import CityGuideIntro from "@/components/content/CityGuideIntro";
import ExpenseBreakdown from "@/components/content/ExpenseBreakdown";
import NearbyCities from "@/components/content/NearbyCities";
import CostCalculator from "@/components/calculator/CostCalculator";
import RevenueEngine from "@/app/components/RevenueEngine";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { buildCityPageJsonLd } from "@/lib/cityPageSchema";
import { getNearbyCities, LOCATION_BASELINES } from "@/lib/mockData";
import type { LocationBaseline } from "@/types/parenting";
import { normalizeSiteUrl } from "@/app/utils/siteUrl";

/** Public cost pages stay on the edge cache for 7 days — auth stays client-side. */
export const revalidate = 604800;
export const dynamicParams = true;

type PageParams = Promise<{ state: string; city: string }>;

function deslugifyCity(segment: string): string {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeState(segment: string): string {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function resolveLocationId(citySlug: string): string {
  const city = citySlug.trim().toLowerCase();

  const aliases: Record<string, string> = {
    austin: "austin",
    "new-york": "new-york",
    nyc: "new-york",
    "los-angeles": "los-angeles",
    la: "los-angeles",
    chicago: "chicago",
    denver: "denver",
    seattle: "seattle",
    dallas: "dallas",
    miami: "miami",
    boston: "boston",
    atlanta: "atlanta",
    phoenix: "phoenix",
    "san-francisco": "san-francisco",
    sf: "san-francisco",
  };

  if (aliases[city]) return aliases[city];
  if (city.includes("york")) return "new-york";
  if (city.includes("austin")) return "austin";
  if (city.includes("angeles")) return "los-angeles";
  if (city.includes("francisco")) return "san-francisco";

  return city;
}

/**
 * Strict curated lookup — no silent fallback to another metro.
 * Returns null when city or state does not match local baselines.
 */
function lookupCuratedCity(
  stateSlug: string,
  citySlug: string,
): LocationBaseline | null {
  const locationId = resolveLocationId(citySlug);
  const baseline = LOCATION_BASELINES[locationId];
  if (!baseline) return null;

  const requestedState = normalizeState(stateSlug);
  if (baseline.stateCode.toUpperCase() !== requestedState) {
    return null;
  }

  return baseline;
}

export async function generateStaticParams() {
  return [
    { state: "tx", city: "austin" },
    { state: "ny", city: "new-york" },
    { state: "ca", city: "los-angeles" },
    { state: "il", city: "chicago" },
    { state: "co", city: "denver" },
    { state: "wa", city: "seattle" },
    { state: "tx", city: "dallas" },
    { state: "fl", city: "miami" },
    { state: "ma", city: "boston" },
    { state: "ga", city: "atlanta" },
    { state: "az", city: "phoenix" },
    { state: "ca", city: "san-francisco" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { state, city } = await params;
  if (!lookupCuratedCity(state, city)) {
    notFound();
  }

  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);
  const place = `${cleanCity}, ${cleanState}`;
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const canonicalPath = `/cost-of-parenting/${state}/${city}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const ogImageUrl = `${siteUrl}${canonicalPath}/opengraph-image`;
  const title = `Cost of Raising a Child in ${place} (2026 Calculator)`;
  const description = `Detailed breakdown of childcare, housing, food, and education expenses to raise a child in ${place}. Calculate your estimated family budget.`;
  const ogImages = [
    {
      url: ogImageUrl,
      width: 1200,
      height: 630,
      alt: `Cost of raising a child in ${cleanCity}, ${cleanState}`,
    },
  ];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CostOfParentingCityPage({
  params,
}: {
  params: PageParams;
}) {
  const { state, city } = await params;
  const baseline = lookupCuratedCity(state, city);
  if (!baseline) {
    notFound();
  }

  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);
  const cityLabel = baseline.displayName || `${cleanCity}, ${cleanState}`;
  const isCurated = true;
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const jsonLd = buildCityPageJsonLd({
    baseline,
    cityLabel,
    stateSlug: state,
    citySlug: city,
    siteUrl,
  });
  const cityName = cityLabel.split(",")[0]?.trim() || cleanCity;
  const nearbyCities = getNearbyCities(baseline.locationId, 6);
  const comparePeer = nearbyCities[0];
  const compareHref = comparePeer
    ? `/compare/${baseline.locationId}-${(baseline.stateCode || cleanState).toLowerCase()}-vs-${comparePeer.citySlug}-${comparePeer.stateSlug}`
    : "#nearby-cities-heading";

  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <JsonLd data={jsonLd} />

      <Navbar placeLabel={cityLabel} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {/* CLS-safe ad rail above main guide content */}
        <ClsSafeAdSlot placement="above" className="mb-6" />

        <CityGuideIntro
          cityLabel={cityLabel}
          state={cleanState}
          baseline={baseline}
          stateSlug={state}
          citySlug={city}
        />

        <div className="mt-8">
          <AgeStageBreakdown baseline={baseline} cityLabel={cityLabel} />
        </div>

        <div className="mt-8">
          <ExpenseBreakdown
            cityName={cityName}
            stateName={cleanState}
            housing={baseline.annualCosts.housing}
            childcare={baseline.annualCosts.childcare}
            food={baseline.annualCosts.food}
            transportation={baseline.annualCosts.transportation}
            healthcare={baseline.annualCosts.healthcare}
            clothing={baseline.annualCosts.clothing}
            misc={
              baseline.annualCosts.miscellaneous +
              baseline.annualCosts.education
            }
            context={{
              housingPremiumMonthly: baseline.housing.familyPremiumMonthly,
              tenure: baseline.housing.tenure,
              infantChildcareMonthly: baseline.stageMonthly.infant.childcare,
              foodPerChildMonthly: baseline.foodAndSupplies.foodPerChild,
              regionalHealthcareIndex: baseline.healthcare.regionalIndex,
            }}
          />
        </div>

        <div className="mt-8">
          <CalculatorCtaCard cityLabel={cityLabel} />
        </div>

        <div className="mt-8">
          <CostCalculator
            cityName={cityName}
            stateName={cleanState}
            stateSlug={state}
            citySlug={city}
            dataset={{
              housing: baseline.annualCosts.housing,
              food: baseline.annualCosts.food,
              healthcare: baseline.annualCosts.healthcare,
              childcare: baseline.annualCosts.childcare,
              clothing: baseline.annualCosts.clothing,
              education: baseline.annualCosts.education,
            }}
            compareHref={compareHref}
          />
        </div>

        <div className="mt-8">
          <RevenueEngine
            cityName={cityName}
            stateName={cleanState}
            calculatedMonthlyCost={Math.round(
              baseline.annualCosts.childcare / 12,
            )}
          />
        </div>

        <CostExperienceProvider
          baseline={baseline}
          cityLabel={cityLabel}
          stateSlug={state}
          citySlug={city}
          isCurated={isCurated}
        >
          <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
            <aside className="order-1 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-stone-200/40 bg-white shadow-sm">
                <FamilyCostConsole />
              </div>
            </aside>

            <div className="order-2 min-w-0 lg:col-span-8">
              <CostDataFeed
                editorial={
                  <AuthorityArticle
                    cityLabel={cityLabel}
                    state={cleanState}
                    baseline={baseline}
                  />
                }
              />
            </div>
          </div>
        </CostExperienceProvider>

        {/* CLS-safe ad rail below main content */}
        <ClsSafeAdSlot placement="below" className="mt-10" />

        <div className="mt-10">
          <NearbyCities
            currentCity={cityName}
            currentState={cleanState}
            stateSlug={state}
            nearbyCities={nearbyCities}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
