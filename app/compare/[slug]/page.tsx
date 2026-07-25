import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  buildCompareSlug,
  getCompareMetrics,
  listCompareStaticParams,
  parseCompareSlug,
  percentDifference,
  resolveCompareCity,
  type CompareCityRef,
  type CompareMetrics,
} from "@/lib/compareCities";
import { normalizeSiteUrl } from "@/app/utils/siteUrl";

export const revalidate = 604800;

type PageParams = Promise<{ slug: string }>;

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Dynamic comparison route: `/compare/[city1]-vs-[city2]`
 * Implemented as `/compare/[slug]` where slug = `{city1}-vs-{city2}`
 * (Next.js cannot bind two params inside one hyphenated folder segment.)
 *
 * Example: /compare/austin-tx-vs-dallas-tx
 */
export async function generateStaticParams() {
  return listCompareStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) {
    return { title: "City cost comparison" };
  }

  const left = resolveCompareCity(parsed.city1);
  const right = resolveCompareCity(parsed.city2);
  if (!left || !right) {
    return { title: "City cost comparison" };
  }

  const city1Name = left.displayCity;
  const city2Name = right.displayCity;
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const path = `/compare/${buildCompareSlug(left.slug, right.slug)}`;
  const title = `${city1Name} vs ${city2Name} Cost of Raising a Child Comparison (2026)`;
  const description = `Side-by-side comparison of housing, childcare, healthcare, food, and education costs for raising a child in ${city1Name} versus ${city2Name}.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteUrl}${path}`,
    },
  };
}

function DiffBadge({
  leftValue,
  rightValue,
  leftCity,
  rightCity,
}: {
  leftValue: number;
  rightValue: number;
  leftCity: string;
  rightCity: string;
}) {
  const percent = percentDifference(leftValue, rightValue);

  if (percent === 0) {
    return (
      <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
        About the same
      </span>
    );
  }

  const abs = Math.abs(percent);
  // Positive percent → left is more expensive than right → right is cheaper
  const cheaperCity = percent > 0 ? rightCity : leftCity;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        percent > 0
          ? "bg-emerald-100 text-emerald-800"
          : "bg-rose-100 text-rose-800"
      }`}
    >
      +{abs}% cheaper in {cheaperCity}
    </span>
  );
}

function ComparisonMatrix({
  left,
  right,
  leftMetrics,
  rightMetrics,
}: {
  left: CompareCityRef;
  right: CompareCityRef;
  leftMetrics: CompareMetrics;
  rightMetrics: CompareMetrics;
}) {
  const leftPlace = `${left.displayCity}, ${left.displayState}`;
  const rightPlace = `${right.displayCity}, ${right.displayState}`;

  const rows: Array<{
    label: string;
    hint: string;
    leftValue: number;
    rightValue: number;
    format: (n: number) => string;
  }> = [
    {
      label: "Housing",
      hint: "Family housing premium / month",
      leftValue: leftMetrics.housingMonthly,
      rightValue: rightMetrics.housingMonthly,
      format: formatUsd,
    },
    {
      label: "Childcare",
      hint: "Avg monthly (infant → school-age)",
      leftValue: leftMetrics.childcareMonthly,
      rightValue: rightMetrics.childcareMonthly,
      format: formatUsd,
    },
    {
      label: "Healthcare",
      hint: "Family premium share + child OOP / month",
      leftValue: leftMetrics.healthcareMonthly,
      rightValue: rightMetrics.healthcareMonthly,
      format: formatUsd,
    },
    {
      label: "Food",
      hint: "Per child / month",
      leftValue: leftMetrics.foodMonthly,
      rightValue: rightMetrics.foodMonthly,
      format: formatUsd,
    },
    {
      label: "Education",
      hint: "Annual baseline ÷ 12",
      leftValue: leftMetrics.educationMonthly,
      rightValue: rightMetrics.educationMonthly,
      format: formatUsd,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200/60 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200/70 bg-cream-muted/60">
            <th
              scope="col"
              className="px-4 py-3.5 font-semibold text-stone-600 sm:px-6"
            >
              Metric
            </th>
            <th
              scope="col"
              className="px-4 py-3.5 font-semibold text-stone-900 sm:px-6"
            >
              <Link href={left.href} className="hover:text-teal-800">
                {leftPlace}
              </Link>
            </th>
            <th
              scope="col"
              className="px-4 py-3.5 font-semibold text-stone-900 sm:px-6"
            >
              <Link href={right.href} className="hover:text-teal-800">
                {rightPlace}
              </Link>
            </th>
            <th
              scope="col"
              className="px-4 py-3.5 font-semibold text-stone-600 sm:px-6"
            >
              Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-stone-100 last:border-b-0"
            >
              <th
                scope="row"
                className="px-4 py-4 align-top font-medium text-stone-800 sm:px-6"
              >
                {row.label}
                <span className="mt-0.5 block text-xs font-normal text-stone-500">
                  {row.hint}
                </span>
              </th>
              <td className="px-4 py-4 align-top sm:px-6">
                <span className="font-serif text-xl font-semibold text-stone-900">
                  {row.format(row.leftValue)}
                </span>
              </td>
              <td className="px-4 py-4 align-top sm:px-6">
                <span className="font-serif text-xl font-semibold text-stone-900">
                  {row.format(row.rightValue)}
                </span>
              </td>
              <td className="px-4 py-4 align-top sm:px-6">
                <DiffBadge
                  leftValue={row.leftValue}
                  rightValue={row.rightValue}
                  leftCity={left.displayCity}
                  rightCity={right.displayCity}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CompareCitiesPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) {
    notFound();
  }

  const left = resolveCompareCity(parsed.city1);
  const right = resolveCompareCity(parsed.city2);

  if (!left || !right || left.locationId === right.locationId) {
    notFound();
  }

  const leftMetrics = getCompareMetrics(left.baseline);
  const rightMetrics = getCompareMetrics(right.baseline);
  const leftPlace = `${left.displayCity}, ${left.displayState}`;
  const rightPlace = `${right.displayCity}, ${right.displayState}`;

  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <Navbar placeLabel={`${left.displayCity} vs ${right.displayCity}`} />

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-teal-800">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-stone-400">Compare</span>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-stone-700" aria-current="page">
              {left.displayCity} vs {right.displayCity}
            </li>
          </ol>
        </nav>

        <header className="mt-6 border-b border-stone-200/60 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
            City cost comparison
          </p>
          <h1 className="font-serif mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            {left.displayCity} vs {right.displayCity}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Housing, childcare, healthcare, food, and education — side by side
            for families weighing {leftPlace} against {rightPlace}.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={left.href}
              className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
            >
              Cost of raising a child in {leftPlace}
            </Link>
            <Link
              href={right.href}
              className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
            >
              Cost of raising a child in {rightPlace}
            </Link>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="compare-matrix-heading">
          <h2
            id="compare-matrix-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-stone-900"
          >
            Comparison matrix
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Emerald badges flag the cheaper city for each line item; rose marks
            when the other city wins on cost.
          </p>

          <div className="mt-6">
            <ComparisonMatrix
              left={left}
              right={right}
              leftMetrics={leftMetrics}
              rightMetrics={rightMetrics}
            />
          </div>

          <p className="mt-4 text-xs text-stone-500">
            Illustrative planning baselines (updated {left.baseline.updatedAt} /{" "}
            {right.baseline.updatedAt}). Verify local rates before major
            decisions.
          </p>
        </section>

        <section className="mt-12 border-t border-stone-200/60 pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
            Explore each city guide
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            <li>
              <Link
                href={left.href}
                className="block rounded-xl border border-stone-200/60 bg-white px-4 py-3 text-sm font-medium text-stone-900 transition-colors hover:border-teal-700/40 hover:bg-teal-50/40"
              >
                Cost of raising a child in {leftPlace}
                <span className="mt-1 block text-xs font-normal text-stone-500">
                  Est. {formatUsd(leftMetrics.annualTotal)} / year baseline
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={right.href}
                className="block rounded-xl border border-stone-200/60 bg-white px-4 py-3 text-sm font-medium text-stone-900 transition-colors hover:border-teal-700/40 hover:bg-teal-50/40"
              >
                Cost of raising a child in {rightPlace}
                <span className="mt-1 block text-xs font-normal text-stone-500">
                  Est. {formatUsd(rightMetrics.annualTotal)} / year baseline
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <aside
          className="mt-12 rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-cream px-5 py-6 sm:px-7 sm:py-7"
          aria-labelledby="relocation-cta-heading"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
            Planning a move?
          </p>
          <h2
            id="relocation-cta-heading"
            className="font-serif mt-2 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
          >
            Planning a move to {right.displayCity}? Get a custom family
            relocation checklist.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            Pair this comparison with the full {rightPlace} cost guide — then
            unlock Premium for an 18-year household forecast tailored to your
            kids&apos; ages.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={right.href}
              className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
            >
              Open {right.displayCity} cost guide
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white/80 px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
            >
              View Premium pricing
            </Link>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
