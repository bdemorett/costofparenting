import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

const CANONICAL_URL = "https://costofparenting.com/methodology";

export const metadata = {
  title: "Our Data Methodology & Calculation Models",
  description:
    "How costofparenting.com estimates local childcare, housing, and child-rearing expenses across U.S. cities.",
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: "Our Data Methodology & Calculation Models",
    description:
      "How costofparenting.com estimates local childcare, housing, and child-rearing expenses across U.S. cities.",
    url: CANONICAL_URL,
    type: "website",
  },
};

const STATE_HUBS = [
  {
    state: "Texas",
    href: "/tx",
    label: "Texas hub — city rankings & averages",
  },
  {
    state: "California",
    href: "/ca",
    label: "California hub — city rankings & averages",
  },
  {
    state: "New York",
    href: "/ny",
    label: "New York hub — city rankings & averages",
  },
  {
    state: "Illinois",
    href: "/il",
    label: "Illinois hub — city rankings & averages",
  },
  {
    state: "Washington",
    href: "/wa",
    label: "Washington hub — city rankings & averages",
  },
  {
    state: "Florida",
    href: "/fl",
    label: "Florida hub — city rankings & averages",
  },
];

const COMPARE_TOOLS = [
  {
    href: "/compare/austin-tx-vs-dallas-tx",
    label: "Austin vs Dallas",
  },
  {
    href: "/compare/los-angeles-ca-vs-san-francisco-ca",
    label: "Los Angeles vs San Francisco",
  },
  {
    href: "/compare/new-york-ny-vs-boston-ma",
    label: "New York vs Boston",
  },
  {
    href: "/compare/seattle-wa-vs-denver-co",
    label: "Seattle vs Denver",
  },
];

const methodologySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_URL}#webpage`,
      url: CANONICAL_URL,
      name: "Our Data Methodology & Calculation Models",
      description:
        "How costofparenting.com estimates local childcare, housing, and child-rearing expenses across U.S. cities.",
      isPartOf: {
        "@type": "WebSite",
        name: "Cost of Parenting",
        url: "https://costofparenting.com",
      },
      about: {
        "@type": "Thing",
        name: "Cost of raising children methodology",
      },
    },
    {
      "@type": "BreadcrumbList",
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
          name: "Methodology",
          item: CANONICAL_URL,
        },
      ],
    },
  ],
};

export default function MethodologyPage() {
  return (
    <>
      <JsonLd data={methodologySchema} />
      <LegalPageLayout
        eyebrow="Transparency"
        title="Our Data Methodology & Calculation Models"
        description="How costofparenting.com estimates local childcare, housing, and child-rearing expenses across U.S. cities."
        updatedAt="July 2026"
      >
        <LegalSection title="Data sources">
          <p>
            City baselines on Cost of Parenting are planning models, not invoices.
            We blend national research with metro-level price signals so families
            can compare places on a consistent footing.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-stone-900">
                USDA Expenditures on Children
              </strong>{" "}
              — category shares and life-stage patterns for food, clothing,
              healthcare, childcare, and related child-rearing costs.
            </li>
            <li>
              <strong className="text-stone-900">
                BLS Consumer Price Index (CPI)
              </strong>{" "}
              — regional and category inflation updates that keep older survey
              vintages aligned with current purchasing power.
            </li>
            <li>
              <strong className="text-stone-900">
                Local childcare rate reports
              </strong>{" "}
              — state and metro daycare, preschool, and after-school price
              surveys that anchor infant-through-school-age care stacks.
            </li>
            <li>
              <strong className="text-stone-900">
                MIT Living Wage benchmarks
              </strong>{" "}
              — county-level living-wage and family-budget context used to
              cross-check housing, food, and transportation floors.
            </li>
          </ul>
          <p>
            Where a metro lacks a fresh primary survey, we interpolate from peer
            cities and national category weights, then flag figures as illustrative
            planning estimates.
          </p>
        </LegalSection>

        <LegalSection title="Formula breakdown">
          <p>
            Each city starts from a school-age / elementary{" "}
            <strong className="text-stone-900">reference baseline</strong>{" "}
            (annual USD by category). Monthly stage stacks for infant, toddler,
            and school-age care feed that baseline; forecasts then scale costs by
            child age and household size.
          </p>
          <p>
            <strong className="text-stone-900">Age tiers.</strong> Costs are
            adjusted relative to the elementary reference (1.0):
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-stone-900">Infant (0–2)</strong> — about
              1.4× the reference year (full-day care, diapers, and formula).
            </li>
            <li>
              <strong className="text-stone-900">Toddler (2–4)</strong> — about
              1.25× as preschool remains expensive while supply spend eases.
            </li>
            <li>
              <strong className="text-stone-900">Elementary (5–12)</strong> —
              reference band (1.0) used for published annual category mixes.
            </li>
            <li>
              <strong className="text-stone-900">Teen (13–17)</strong> — about
              1.15× as food, clothing, activities, and transport rise again.
            </li>
          </ul>
          <p>
            <strong className="text-stone-900">Family size modifiers.</strong>{" "}
            Household totals are not a simple per-child multiply. Shared costs
            (housing uplift, some transport and utilities) create economies of
            scale:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-stone-900">1 child</strong> — modeled at
              roughly <strong className="text-stone-900">+27%</strong> versus a
              pure per-category “average child” split, because fixed family
              premiums (especially housing) load onto a single dependent.
            </li>
            <li>
              <strong className="text-stone-900">3+ children</strong> — about{" "}
              <strong className="text-stone-900">−24% efficiency</strong> per
              additional child relative to stacking full one-child totals,
              reflecting shared rooms, bulk food, and reused gear.
            </li>
          </ul>
          <p>
            Interactive calculators apply these modifiers on top of the local
            baseline; Premium forecasts extend the same logic across an 18-year
            horizon.
          </p>
        </LegalSection>

        <LegalSection title="Inflation adjustments">
          <p>
            Historical USDA and survey vintages are not left in their original
            dollar years. We index category baselines forward using BLS CPI
            series (all-items and relevant child-cost components such as
            childcare, food at home, and medical care) to express figures in{" "}
            <strong className="text-stone-900">2026 dollars</strong>.
          </p>
          <p>
            When a metro’s local childcare or rent report is newer than the
            national survey year, we prefer the local vintage and only inflate
            residual categories. Published city pages show a data{" "}
            <em>updatedAt</em> stamp so you can see the model vintage at a glance.
          </p>
          <p>
            Inflation indexing keeps multi-city comparisons fair; it does not
            predict future price paths. Premium multi-year outlooks may apply an
            explicit forward inflation assumption on top of today’s indexed
            baseline — always labeled separately from the 2026 present-day stack.
          </p>
        </LegalSection>

        <LegalSection title="Explore city hubs &amp; comparisons">
          <p>
            See the methodology applied on live city guides, or open a side-by-side
            comparison tool:
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Top state hubs
              </p>
              <ul className="mt-2 space-y-2">
                {STATE_HUBS.map((hub) => (
                  <li key={hub.href}>
                    <Link
                      href={hub.href}
                      className="text-teal-700 underline decoration-teal-700/30 underline-offset-2 hover:decoration-teal-700"
                    >
                      {hub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Comparison tools
              </p>
              <ul className="mt-2 space-y-2">
                {COMPARE_TOOLS.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="text-teal-700 underline decoration-teal-700/30 underline-offset-2 hover:decoration-teal-700"
                    >
                      {tool.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4">
            Questions about a specific metro or data vintage?{" "}
            <Link href="/contact" className="text-teal-700 underline">
              Contact us
            </Link>{" "}
            or read more{" "}
            <Link href="/about" className="text-teal-700 underline">
              about Cost of Parenting
            </Link>
            .
          </p>
        </LegalSection>
      </LegalPageLayout>
    </>
  );
}
