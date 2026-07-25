import type { LocationBaseline } from "@/types/parenting";
import { monthlyToAnnual, sumStageMonthly } from "@/lib/mockData";

export interface AuthorityArticleProps {
  cityLabel: string;
  state: string;
  baseline: LocationBaseline;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * SEO / E-E-A-T editorial block for city cost pages — uses deep baseline fields.
 */
export default function AuthorityArticle({
  cityLabel,
  state,
  baseline,
}: AuthorityArticleProps) {
  const infantMonthly = sumStageMonthly(baseline.stageMonthly.infant);
  const toddlerMonthly = sumStageMonthly(baseline.stageMonthly.toddler);
  const schoolMonthly = sumStageMonthly(baseline.stageMonthly.schoolAge);
  const housingJump = baseline.housing.familyPremiumMonthly;
  const childcareSchool = baseline.stageMonthly.schoolAge.childcare;
  const food = baseline.foodAndSupplies.foodPerChild;
  const diapers = baseline.foodAndSupplies.diapersAndWipes;
  const employerPremium = baseline.healthcare.employerFamilyPremiumMonthly;

  return (
    <article className="rounded-2xl border border-stone-200/40 bg-white p-6 shadow-pillow sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
        Local cost authority
      </p>
      <h2 className="font-serif mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        What it really costs to raise a child in {cityLabel}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-stone-600">
        Families comparing {cityLabel} with other U.S. metros often underestimate
        how sharply stage-based childcare, the family housing jump, and healthcare
        stack over nearly two decades. Our {state} baseline puts infant months near{" "}
        <strong className="font-semibold text-stone-800">
          {formatUsd(infantMonthly)}
        </strong>
        , toddlers near{" "}
        <strong className="font-semibold text-stone-800">
          {formatUsd(toddlerMonthly)}
        </strong>
        , and school-age near{" "}
        <strong className="font-semibold text-stone-800">
          {formatUsd(schoolMonthly)}
        </strong>{" "}
        before personalized Premium forecasts.
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-stone-700">
        <section>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Childcare sets the pace early
          </h3>
          <p className="mt-2">
            Infant childcare alone averages about{" "}
            {formatUsd(baseline.stageMonthly.infant.childcare)}/mo in {cityLabel},
            with diapers and formula adding roughly{" "}
            {formatUsd(
              baseline.foodAndSupplies.diapersAndWipes +
                baseline.foodAndSupplies.formulaOrBabyFood,
            )}
            . By school age, care often settles near {formatUsd(childcareSchool)}
            /mo ({formatUsd(monthlyToAnnual(childcareSchool))}/yr) as after-school
            replaces full-day daycare.
          </p>
        </section>

        <section>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Housing premium is a quiet budget leak
          </h3>
          <p className="mt-2">
            Moving from a typical 1–2 bedroom ({formatUsd(baseline.housing.avgRent1to2Bed)}
            /mo) into a 3+ bedroom family home (
            {formatUsd(baseline.housing.avgFamilyHome3Plus)}/mo,{" "}
            {baseline.housing.tenure}) creates about {formatUsd(housingJump)} in
            monthly housing differential — compounding across an 18-year horizon
            even when sticker rents look “stable.”
          </p>
        </section>

        <section>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Food, supplies, and healthcare
          </h3>
          <p className="mt-2">
            Plan on roughly {formatUsd(food)}/mo in child food spend and about{" "}
            {formatUsd(diapers)}/mo for infant diapers and wipes. Employer family
            health contributions average near {formatUsd(employerPremium)}/mo
            (regional index {baseline.healthcare.regionalIndex}), with about{" "}
            {formatUsd(baseline.healthcare.outOfPocketPerChildMonthly)} per child
            in routine out-of-pocket care.
          </p>
        </section>

        <section>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            How to use this page
          </h3>
          <p className="mt-2">
            Start with the cost-by-age tabs for a transparent stage snapshot. Then
            use the Family Cost Console to model ages and lifestyle. An active
            Premium subscription unlocks the full 18-year inflation-aware forecast.
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
