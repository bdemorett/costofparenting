import Link from "next/link";

export interface NearbyCity {
  /** Display name, e.g. "Dallas". */
  cityName: string;
  /** URL segment for the city route. */
  citySlug: string;
  /** Estimated annual cost of raising a child (USD). */
  estimatedChildRaisingCost: number;
  /** Optional state slug when linking across states; defaults to current. */
  stateSlug?: string;
  /** Optional state label for anchor text; defaults to `currentState`. */
  stateName?: string;
}

export interface NearbyCitiesProps {
  currentCity: string;
  currentState: string;
  /** State URL segment used when a nearby city omits its own `stateSlug`. */
  stateSlug: string;
  /** Prefer 5–8 peer cities for internal cross-linking. */
  nearbyCities: NearbyCity[];
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Internal cross-link grid to peer city cost guides (Server Component).
 */
export default function NearbyCities({
  currentCity,
  currentState,
  stateSlug,
  nearbyCities,
}: NearbyCitiesProps) {
  const links = nearbyCities
    .filter(
      (city) =>
        city.citySlug &&
        city.cityName.toLowerCase() !== currentCity.toLowerCase(),
    )
    .slice(0, 8);

  if (links.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-stone-200/60 pt-10" aria-labelledby="nearby-cities-heading">
      <h2
        id="nearby-cities-heading"
        className="font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
      >
        Compare Childcare Costs in Nearby {currentState} Cities
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
        Explore how parenting baselines compare in metros near {currentCity},{" "}
        {currentState} — childcare, housing, and annual child-raising estimates.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((city) => {
          const linkStateSlug = city.stateSlug || stateSlug;
          const linkStateName = city.stateName || currentState;
          const href = `/cost-of-parenting/${linkStateSlug}/${city.citySlug}`;

          return (
            <li key={`${linkStateSlug}-${city.citySlug}`}>
              <Link
                href={href}
                className="group block rounded-xl border border-stone-200/60 bg-white px-4 py-3 shadow-sm transition-colors hover:border-teal-700/40 hover:bg-teal-50/40"
              >
                <span className="text-sm font-medium text-stone-900 group-hover:text-teal-900">
                  Cost of raising a child in {city.cityName}, {linkStateName}
                </span>
                <span className="mt-1 block text-xs text-stone-500">
                  Est. {formatUsd(city.estimatedChildRaisingCost)} / year
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
