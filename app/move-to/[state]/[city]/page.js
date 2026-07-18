import Link from "next/link";
import { getNeighborhoodData } from "../../../utils/api";
import AuthNav from "../../../components/AuthNav";
import MoveToDashboard from "../../../components/MoveToDashboard";
import PremiumHeaderCta from "../../../components/PremiumHeaderCta";

/** Public report pages stay on the edge cache for 7 days — no request-time auth. */
export const revalidate = 604800;
export const dynamicParams = true;

function deslugifyCity(segment) {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeState(segment) {
  const cleaned = decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.toUpperCase();
}

function formatSeoPlace(city, state, report = null) {
  const resolvedCity = report?.city || city;
  const resolvedState = report?.state || (state !== "US" ? state : "");
  if (resolvedState) return `${resolvedCity}, ${resolvedState}`;
  return resolvedCity;
}

export async function generateMetadata({ params }) {
  const { state, city } = await params;
  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);

  const report = await getNeighborhoodData(`${cleanCity}, ${cleanState}`);
  const place = formatSeoPlace(cleanCity, cleanState, report);

  return {
    title: `Before You Move To ${place} | Read Safety & School Ratings`,
    description: `Get verified neighborhood intelligence for ${place}. View comprehensive safety indices, real-world school data, and environmental insights before moving.`,
    alternates: {
      canonical: `/move-to/${state}/${city}`,
    },
    openGraph: {
      title: `Before You Move To ${place} | Read Safety & School Ratings`,
      description: `Get verified neighborhood intelligence for ${place}. View comprehensive safety indices, real-world school data, and environmental insights before moving.`,
      type: "website",
      url: `/move-to/${state}/${city}`,
    },
  };
}

export default async function MoveToPage({ params }) {
  const { state, city } = await params;
  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);
  // Shared with generateMetadata via React cache() + unstable_cache in api.js.
  const report = await getNeighborhoodData(`${cleanCity}, ${cleanState}`);

  const {
    location,
    city: reportCity,
    source,
    safety,
    schools,
    schoolsList,
    noise,
    premium,
  } = report;

  const displayCity =
    reportCity && !/^\d+$/.test(reportCity) ? reportCity : cleanCity;

  const routeKey = `${cleanCity}-${cleanState}`;

  const hasCardData = Boolean(
    safety && schools && schoolsList && noise && premium
  );

  const elementarySchool = schoolsList?.elementary;
  const middleSchool = schoolsList?.middle;
  const highSchool = schoolsList?.high;

  const schoolStats =
    elementarySchool && middleSchool && highSchool
      ? [
          {
            label: "Elementary",
            value: `${elementarySchool.score}/10 — ${elementarySchool.name}`,
          },
          {
            label: "Middle school",
            value: `${middleSchool.score}/10 — ${middleSchool.name}`,
          },
          {
            label: "High school",
            value: `${highSchool.score}/10 — ${highSchool.name}`,
          },
          schools.stats.find((stat) => stat.label === "Student-teacher ratio"),
        ].filter(Boolean)
      : (schools?.stats ?? []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" key={routeKey}>
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
              BY
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              Before You Move There
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <AuthNav variant="dark" />
            <PremiumHeaderCta variant="dark" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" key={routeKey}>
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 transition hover:text-emerald-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            New search
          </Link>

          {source === "verified" && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-emerald-200">
                  Verified US Location Data
                </p>
                <p className="mt-1 text-sm text-emerald-200/80">
                  We confirmed &ldquo;{location}&rdquo; via US geocoding. Safety, Schools, and
                  Noise scores are uniquely generated for this exact location.
                </p>
              </div>
            </div>
          )}

          {source === "estimated" && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  Location estimate active
                </p>
                <p className="mt-1 text-sm text-amber-200/80">
                  We couldn&apos;t verify &ldquo;{location}&rdquo; with geocoding, but generated
                  stable scores from your search. Try a zip code or &ldquo;City, ST&rdquo; format.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
                  {source === "verified"
                    ? "Verified Neighborhood Report"
                    : "Neighborhood Intelligence Report"}
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {location}
                </h1>
                <p className="mt-3 max-w-xl text-slate-300">
                  {source === "verified"
                    ? "Location verified via US geocoding. Safety, Schools, and Noise scores are deterministically modeled for this exact place."
                    : source === "estimated"
                      ? "Scores generated from your search text. For best results, try a 5-digit zip or city with state abbreviation."
                      : "Neighborhood intelligence preview for your search."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">Report status</p>
                  <p className="text-sm font-semibold text-white">
                    {source === "verified"
                      ? "US location · verified"
                      : source === "estimated"
                        ? "Estimated · stable scores"
                        : "Preview · sample data"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <MoveToDashboard
            location={location}
            displayCity={displayCity}
            stateSlug={state}
            citySlug={city}
            safety={safety}
            schools={schools}
            schoolsList={schoolsList}
            noise={noise}
            premium={premium}
            hasCardData={hasCardData}
            schoolStats={schoolStats}
          />
        </div>
      </main>
    </div>
  );
}
