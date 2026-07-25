import type { Metadata } from "next";
import ClsSafeAdSlot from "@/components/ads/ClsSafeAdSlot";
import { CostExperienceProvider } from "@/components/calculator/CostExperienceContext";
import CostDataFeed from "@/components/calculator/CostDataFeed";
import FamilyCostConsole from "@/components/calculator/FamilyCostConsole";
import AgeStageBreakdown from "@/components/content/AgeStageBreakdown";
import AuthorityArticle from "@/components/content/AuthorityArticle";
import CalculatorCtaCard from "@/components/content/CalculatorCtaCard";
import CityGuideIntro from "@/components/content/CityGuideIntro";
import NearbyCities from "@/components/content/NearbyCities";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import JsonLd from "@/components/seo/JsonLd";
import { buildCityPageJsonLd } from "@/lib/cityPageSchema";
import {
  getNearbyCities,
  getSafeLocationBaseline,
  LOCATION_BASELINES,
} from "@/lib/mockData";
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
  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);
  const locationId = resolveLocationId(city);
  const baseline = getSafeLocationBaseline(locationId);
  const place = `${cleanCity}, ${cleanState}`;

  return {
    title: `Cost of Parenting in ${place} — Childcare, Housing & Healthcare Guide`,
    description: `Stage-based costs for raising kids in ${place}: infant, toddler, and school-age childcare, housing jump, food, and healthcare. Free baselines plus Premium 18-year forecasts.`,
    alternates: {
      canonical: `/cost-of-parenting/${state}/${city}`,
    },
    openGraph: {
      title: `Cost of Parenting in ${place}`,
      description: `Infant-to-school-age costs, housing differential, and healthcare factors for ${baseline.displayName}.`,
      type: "article",
      url: `/cost-of-parenting/${state}/${city}`,
    },
  };
}

export default async function CostOfParentingCityPage({
  params,
}: {
  params: PageParams;
}) {
  const { state, city } = await params;
  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);
  const locationId = resolveLocationId(city);
  const baseline = getSafeLocationBaseline(locationId);
  const cityLabel = baseline.displayName || `${cleanCity}, ${cleanState}`;
  const knownCities = Object.keys(LOCATION_BASELINES);
  const isCurated = knownCities.includes(baseline.locationId);
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
          <CalculatorCtaCard cityLabel={cityLabel} />
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
