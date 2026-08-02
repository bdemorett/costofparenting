import { getStateSubsidyProfile } from "@/lib/stateSubsidies";

export interface LocalSubsidiesProps {
  cityName: string;
  stateName: string;
  stateCode: string;
  /** Optional synthesizer framing paragraph. */
  framing?: string;
}

const KIND_LABEL: Record<string, string> = {
  tax_credit: "Tax credit",
  dependent_care: "Dependent care",
  prek: "Pre-K / early ed",
  assistance: "Assistance",
};

/**
 * State-specific child tax credits and dependent-care assistance for city guides.
 */
export default function LocalSubsidies({
  cityName,
  stateName,
  stateCode,
  framing,
}: LocalSubsidiesProps) {
  const profile = getStateSubsidyProfile(stateCode);
  const intro = framing || profile.dependentTaxFraming;

  return (
    <section
      id="local-subsidies"
      className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm sm:p-7"
      aria-labelledby="local-subsidies-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Local subsidies &amp; tax offsets
      </p>
      <h2
        id="local-subsidies-heading"
        className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
      >
        {stateName} child tax credits &amp; care assistance for {cityName}{" "}
        families
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
        {intro}
      </p>
      <p className="mt-2 text-xs text-stone-500">
        Median household income modeled at about{" "}
        {Math.round(profile.medianIncomeIndex * 100)}% of the national index for
        planning comparisons. Verify eligibility — programs change.
      </p>

      <ul className="mt-6 space-y-4">
        {profile.programs.map((program) => (
          <li
            key={program.name}
            className="rounded-xl border border-stone-200/60 bg-cream-muted/40 px-4 py-4"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                {program.name}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                {KIND_LABEL[program.kind] || program.kind}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {program.summary}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              <span className="font-medium text-stone-800">Planning note: </span>
              {program.planningNote}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
