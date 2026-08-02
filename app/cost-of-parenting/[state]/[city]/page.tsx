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
import LocalSubsidies from "@/components/content/LocalSubsidies";
import LocationDeepGuide from "@/components/content/LocationDeepGuide";
import CostCalculator from "@/components/calculator/CostCalculator";
import RevenueEngine from "@/app/components/RevenueEngine";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { buildCityPageJsonLd, buildCitySeoDescription, buildCitySeoTitle } from "@/lib/cityPageSchema";
import { synthesizeLocationContent } from "@/lib/locationCommentary";
import { getNearbyCities, LOCATION_BASELINES, sumCostBreakdown } from "@/lib/mockData";
import type { LocationBaseline } from "@/types/parenting";
import { normalizeSiteUrl } from "@/app/utils/siteUrl";
import { getStateName } from "@/lib/stateHub";

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

  if (city in LOCATION_BASELINES) return city;

  const aliases: Record<string, string> = {
    austin: "austin",
    "new-york": "new-york",
    nyc: "new-york",
    "los-angeles": "los-angeles",
    la: "los-angeles",
    "san-francisco": "san-francisco",
    sf: "san-francisco",
    dc: "washington",
    "washington-dc": "washington",
  };

  if (aliases[city]) return aliases[city];
  if (city.includes("york") && !city.includes("jersey")) return "new-york";
  if (city.includes("francisco")) return "san-francisco";
  if (city.includes("angeles")) return "los-angeles";
  if (city.includes("austin")) return "austin";

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
  return Object.values(LOCATION_BASELINES).map((baseline) => ({
    state: baseline.stateCode.toLowerCase(),
    city: baseline.locationId,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { state, city } = await params;
  const baseline = lookupCuratedCity(state, city);
  if (!baseline) {
    notFound();
  }

  const cleanCity =
    baseline.displayName.split(",")[0]?.trim() || deslugifyCity(city);
  const stateName =
    getStateName(state) || baseline.state || normalizeState(state);
  const place = `${cleanCity}, ${stateName}`;
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const canonicalPath = `/cost-of-parenting/${state}/${city}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const ogImageUrl = `${siteUrl}${canonicalPath}/opengraph-image`;
  const title = buildCitySeoTitle(place);
  const description = buildCitySeoDescription(place, baseline);
  const ogImages = [
    {
      url: ogImageUrl,
      width: 1200,
      height: 630,
      alt: `Cost of raising a child in ${place}`,
    },
  ];

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      siteName: "Cost of Parenting",
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
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "costofparenting:annual_baseline": String(
        Math.round(sumCostBreakdown(baseline.annualCosts)),
      ),
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
  const stateDisplay =
    getStateName(state) || baseline.state || cleanState;
  const locationContent = synthesizeLocationContent(
    baseline,
    cityName,
    stateDisplay,
  );
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
          introParagraphs={locationContent.introParagraphs}
        />

        <div className="mt-8">
          <AgeStageBreakdown
            baseline={baseline}
            cityLabel={cityLabel}
            stageCommentary={locationContent.stageCommentary}
          />
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
            synthesizedWhys={locationContent.expenseWhys}
            takeawayOverride={locationContent.introParagraphs[0]}
          />
        </div>

        <div className="mt-8">
          <LocationDeepGuide content={locationContent} />
        </div>

        <div className="mt-8">
          <LocalSubsidies
            cityName={cityName}
            stateName={stateDisplay}
            stateCode={baseline.stateCode}
            framing={locationContent.subsidyFraming}
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
                    state={stateDisplay}
                    baseline={baseline}
                    content={locationContent}
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
