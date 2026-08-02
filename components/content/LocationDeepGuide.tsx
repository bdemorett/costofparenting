import type { SynthesizedLocationContent } from "@/lib/locationCommentary";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedPct(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export interface LocationDeepGuideProps {
  content: SynthesizedLocationContent;
}

/**
 * Long-form unique city commentary — infant, preschool, healthcare, education —
 * sized to help each programmatic page reach ~800–1,200 words of distinct text.
 */
export default function LocationDeepGuide({ content }: LocationDeepGuideProps) {
  const { metrics } = content;

  const comparisonRows = [
    {
      label: "Infant center care / mo",
      local: metrics.infantChildcare,
      national: metrics.national.infantChildcare,
      delta: metrics.infantCareVsNationalPct,
    },
    {
      label: "Toddler care / mo",
      local: metrics.toddlerChildcare,
      national: metrics.national.toddlerChildcare,
      delta: metrics.toddlerCareVsNationalPct,
    },
    {
      label: "School-age annual total",
      local: metrics.annualTotal,
      national: metrics.national.annualTotal,
      delta: metrics.annualVsNationalPct,
    },
    {
      label: "Family housing premium / mo",
      local: metrics.housingPremiumMonthly,
      national: metrics.national.housingPremiumMonthly,
      delta: metrics.housingVsNationalPct,
    },
  ];

  return (
    <article
      id="local-cost-deep-guide"
      className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm sm:p-8"
      aria-labelledby="local-cost-deep-guide-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Localized cost narrative
      </p>
      <h2
        id="local-cost-deep-guide-heading"
        className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
      >
        How {metrics.cityName} compares on care, income, and long-run costs
      </h2>

      <div className="mt-4 space-y-3 text-base leading-relaxed text-stone-600">
        {content.introParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <caption className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
            {metrics.cityName} vs national curated baselines
          </caption>
          <thead>
            <tr className="border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              <th className="pb-2 pr-3">Metric</th>
              <th className="pb-2 pr-3 text-right">Local</th>
              <th className="pb-2 pr-3 text-right">National</th>
              <th className="pb-2 text-right">Delta</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-stone-100 last:border-0"
              >
                <td className="py-2.5 pr-3 text-stone-700">{row.label}</td>
                <td className="py-2.5 pr-3 text-right font-medium text-stone-900">
                  {formatUsd(row.local)}
                </td>
                <td className="py-2.5 pr-3 text-right text-stone-600">
                  {formatUsd(row.national)}
                </td>
                <td className="py-2.5 text-right font-medium text-teal-900">
                  {formatSignedPct(row.delta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeepSection section={content.infantSection} />
      <DeepSection section={content.preschoolSection} />
      <DeepSection section={content.healthcareSection} />
      <DeepSection section={content.educationSection} />

      <div className="mt-8 space-y-3 border-t border-stone-100 pt-6 text-base leading-relaxed text-stone-600">
        {content.closingParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>

      <p className="mt-6 text-xs text-stone-400">
        Estimated unique narrative words on this block ≈{" "}
        {content.estimatedWordCount.toLocaleString()} (including subsidy copy
        referenced elsewhere on the page).
      </p>
    </article>
  );
}

function DeepSection({
  section,
}: {
  section: {
    title: string;
    paragraphs: string[];
    bullets: string[];
  };
}) {
  return (
    <section className="mt-8">
      <h3 className="font-serif text-xl font-semibold text-stone-900">
        {section.title}
      </h3>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-stone-600">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
        {section.bullets.map((bullet) => (
          <li key={bullet.slice(0, 40)}>{bullet}</li>
        ))}
      </ul>
    </section>
  );
}
