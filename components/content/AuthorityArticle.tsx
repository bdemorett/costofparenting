import type { LocationBaseline } from "@/types/parenting";
import type { SynthesizedLocationContent } from "@/lib/locationCommentary";
import { synthesizeLocationContent } from "@/lib/locationCommentary";

export interface AuthorityArticleProps {
  cityLabel: string;
  state: string;
  baseline: LocationBaseline;
  /** Precomputed synthesizer output (avoids double work on the city page). */
  content?: SynthesizedLocationContent;
}

/**
 * SEO / E-E-A-T editorial block — synthesizer framing for the console column.
 * Long-form infant/preschool/healthcare/education lives in LocationDeepGuide.
 */
export default function AuthorityArticle({
  cityLabel,
  state,
  baseline,
  content: contentProp,
}: AuthorityArticleProps) {
  const cityName = cityLabel.split(",")[0]?.trim() || cityLabel;
  const content =
    contentProp ?? synthesizeLocationContent(baseline, cityName, state);
  const { metrics } = content;

  return (
    <article className="rounded-2xl border border-stone-200/40 bg-white p-6 shadow-pillow sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
        Local cost authority
      </p>
      <h2 className="font-serif mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        What it really costs to raise a child in {cityLabel}
      </h2>

      <div className="mt-4 space-y-3 text-base leading-relaxed text-stone-600">
        {content.closingParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-stone-700">
        <section>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Care-to-income pressure in {metrics.cityName}
          </h3>
          <p className="mt-2">
            With median income modeled near{" "}
            {Math.round(metrics.medianIncomeIndex * 100)}% of national and
            childcare {Math.round(metrics.childcareVsNationalPct)}% versus peer
            metros, the care-to-income pressure score is{" "}
            <strong className="font-semibold text-stone-900">
              {metrics.careToIncomePressure.toFixed(2)}
            </strong>
            . Scores above 1.1 usually mean center-based infant care outruns
            typical local wages unless subsidies or family care intervene.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>
              Infant stage ≈ {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics.infantMonthly)}
              /mo
            </li>
            <li>
              Toddler stage ≈ {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics.toddlerMonthly)}
              /mo
            </li>
            <li>
              School-age annual baseline ≈{" "}
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics.annualTotal)}
            </li>
            <li>
              Healthcare regional index {metrics.healthcareIndex.toFixed(2)}
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            How to use this page
          </h3>
          <p className="mt-2">
            Start with the cost-by-age tabs and deep guide for transparent{" "}
            {cityLabel} numbers, review {state} subsidies, then use the Family
            Cost Console to model ages and lifestyle. Premium unlocks the full
            18-year inflation-aware forecast.
          </p>
        </section>
      </div>

      <p className="mt-8 border-t border-stone-100 pt-5 text-xs leading-relaxed text-stone-500">
        Data vintage {baseline.updatedAt}. Figures are illustrative planning
        baselines, not quotes from a specific daycare, insurer, or landlord.
        Always verify local rates before making financial decisions.
      </p>
    </article>
  );
}
