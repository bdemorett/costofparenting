export interface CalculatorCtaCardProps {
  cityLabel: string;
}

/**
 * Encourages visitors to use the sticky FamilyCostConsole / generate a custom budget.
 */
export default function CalculatorCtaCard({ cityLabel }: CalculatorCtaCardProps) {
  return (
    <aside
      className="rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-cream px-5 py-6 sm:px-7 sm:py-7"
      aria-labelledby="calculator-cta-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Custom budget
      </p>
      <h2
        id="calculator-cta-heading"
        className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900"
      >
        Model your {cityLabel} household
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
        Use the Family Cost Console to set child ages, family size, and public vs
        private childcare — then unlock an 18-year Premium forecast tailored to
        this metro.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="#family-cost-console"
          className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
        >
          Open calculator console
        </a>
        <a
          href="#cost-by-age"
          className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white/80 px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
        >
          Review cost-by-age tabs
        </a>
      </div>
    </aside>
  );
}
