function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

export type ExpenseCategoryKey =
  | "housing"
  | "childcare"
  | "food"
  | "transportation"
  | "healthcare"
  | "clothing"
  | "misc";

export interface ExpenseBreakdownProps {
  cityName: string;
  stateName: string;
  housing: number;
  childcare: number;
  food: number;
  transportation: number;
  healthcare: number;
  clothing: number;
  misc: number;
  /** Optional metro context for city-specific “why” copy. */
  context?: {
    housingPremiumMonthly?: number;
    tenure?: "rent" | "mortgage" | "mixed";
    infantChildcareMonthly?: number;
    foodPerChildMonthly?: number;
    regionalHealthcareIndex?: number;
  };
}

type CategoryDef = {
  key: ExpenseCategoryKey;
  label: string;
  amount: number;
  why: string;
};

function buildCategories(props: ExpenseBreakdownProps): CategoryDef[] {
  const { cityName, stateName, context } = props;
  const tenure = context?.tenure ?? "mixed";
  const housingJump = context?.housingPremiumMonthly;
  const infantCare = context?.infantChildcareMonthly;
  const foodMonthly = context?.foodPerChildMonthly;
  const healthIndex = context?.regionalHealthcareIndex;

  return [
    {
      key: "housing",
      label: "Housing",
      amount: props.housing,
      why:
        housingJump != null
          ? `In ${cityName}, the typical jump from a 1–2 bedroom into a family-sized home adds about ${formatUsd(housingJump)}/mo (${tenure}). That premium — not just base rent or mortgage — is what shows up in this annual housing share for ${stateName} families.`
          : `Family housing in ${cityName} usually means more bedrooms, larger utilities, and a metro premium versus couple-sized footprints. This line is the annual share of that child-driven housing uplift in ${stateName}.`,
    },
    {
      key: "childcare",
      label: "Childcare",
      amount: props.childcare,
      why:
        infantCare != null
          ? `Center-based infant care alone runs near ${formatUsd(infantCare)}/mo in ${cityName}. Even after kids start school, after-care and camps keep this category elevated versus national averages for many ${stateName} metros.`
          : `Licensed daycare, preschool, and after-school care dominate early years in ${cityName}. Local wage floors and facility demand keep childcare one of the stickiest line items for ${stateName} parents.`,
    },
    {
      key: "food",
      label: "Food",
      amount: props.food,
      why:
        foodMonthly != null
          ? `Grocery spend attributable to one school-age child averages about ${formatUsd(foodMonthly)}/mo in ${cityName}. Infant formula and toddler food push earlier years higher before settling into this annual food share.`
          : `Child food costs in ${cityName} track local grocery prices, school lunch habits, and dining-out norms across ${stateName} — compounding steadily from infancy through the teen years.`,
    },
    {
      key: "transportation",
      label: "Transportation",
      amount: props.transportation,
      why: `Car seats, larger vehicles, school commute miles, and activity travel add a durable transportation tax in ${cityName}. This share reflects the child-driven lift above a couple-only mobility budget in ${stateName}.`,
    },
    {
      key: "healthcare",
      label: "Healthcare",
      amount: props.healthcare,
      why:
        healthIndex != null
          ? `${cityName} healthcare costs sit at about ${Math.round(healthIndex * 100)}% of the national index. Employer family premiums, pediatric visits, and dental/vision add-ons together form this annual healthcare share for ${stateName} families.`
          : `Family premiums, pediatric care, and out-of-pocket visits in ${cityName} stack into this annual healthcare line — often underestimated until a second child or marketplace coverage enters the picture.`,
    },
    {
      key: "clothing",
      label: "Clothing",
      amount: props.clothing,
      why: `Kids outgrow sizes fast. In ${cityName}, seasonal gear, school clothes, and activity kits keep clothing as a smaller but recurring slice of the annual child budget across ${stateName}.`,
    },
    {
      key: "misc",
      label: "Misc",
      amount: props.misc,
      why: `Diapers and supplies early on, plus activities, gifts, and household uplift later, land here. In ${cityName} this catch-all covers the soft costs that don’t fit neatly into housing or childcare.`,
    },
  ];
}

function biggestDriverCopy(
  cityName: string,
  leader: CategoryDef,
  pct: number,
  infantChildcareMonthly?: number,
  totalAnnual?: number,
): string {
  if (
    leader.key === "childcare" &&
    infantChildcareMonthly != null &&
    totalAnnual &&
    totalAnnual > 0
  ) {
    const infantAnnual = infantChildcareMonthly * 12;
    const infantShare = Math.round((infantAnnual / totalAnnual) * 100);
    if (infantShare >= 15) {
      return `In ${cityName}, center-based infant care accounts for over ${infantShare}% of total child expenses—exceeding national averages for many peer metros.`;
    }
  }

  return `In ${cityName}, ${leader.label.toLowerCase()} is the biggest cost driver at roughly ${formatPct(pct)} of the annual child budget (${formatUsd(leader.amount)}/yr).`;
}

/**
 * Server-rendered annual expense mix with percentage bars and expandable
 * city-specific explanations for each category.
 */
export default function ExpenseBreakdown(props: ExpenseBreakdownProps) {
  const { cityName, stateName, context } = props;
  const categories = buildCategories(props)
    .map((c) => ({ ...c, amount: Math.max(0, Math.round(c.amount)) }))
    .sort((a, b) => b.amount - a.amount);

  const total = categories.reduce((sum, c) => sum + c.amount, 0);
  const leader = categories[0];
  const leaderPct = total > 0 ? (leader.amount / total) * 100 : 0;
  const takeaway = biggestDriverCopy(
    cityName,
    leader,
    leaderPct,
    context?.infantChildcareMonthly,
    total,
  );

  return (
    <section
      id="expense-breakdown"
      className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm sm:p-7"
      aria-labelledby="expense-breakdown-heading"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
        Annual budget mix
      </p>
      <h2
        id="expense-breakdown-heading"
        className="font-serif mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
      >
        Where the Money Goes: Expense Breakdown for {cityName}, {stateName}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        School-age reference year for one child in {cityName}. Percentages show
        how the annual parenting budget allocates across major categories.
      </p>

      <aside
        className="mt-6 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-4 sm:px-5"
        aria-label="Key takeaways"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
          Biggest cost driver in {cityName}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-800 sm:text-base">
          {takeaway}
        </p>
        <p className="mt-2 font-serif text-lg font-semibold text-stone-900">
          {formatUsd(total)}
          <span className="ml-1.5 font-sans text-xs font-medium text-stone-500">
            total / yr
          </span>
        </p>
      </aside>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {categories.map((category) => {
          const pct = total > 0 ? (category.amount / total) * 100 : 0;
          return (
            <div key={category.key} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-stone-800">
                  {category.label}
                </p>
                <p className="shrink-0 text-right">
                  <span className="font-serif text-lg font-semibold text-stone-900">
                    {formatPct(pct)}
                  </span>
                  <span className="ml-2 text-xs font-medium text-stone-500">
                    {formatUsd(category.amount)}
                  </span>
                </p>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-800 to-teal-500"
                  style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${category.label} share of annual budget`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-2">
        <p className="text-sm font-medium text-stone-800">
          Why costs look like this in {cityName}
        </p>
        {categories.map((category) => {
          const pct = total > 0 ? (category.amount / total) * 100 : 0;
          return (
            <details
              key={`why-${category.key}`}
              className="group rounded-xl border border-stone-200/60 bg-cream-muted/40 open:bg-white"
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-stone-800 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  <span>
                    {category.label}
                    <span className="ml-2 font-normal text-stone-500">
                      {formatPct(pct)} · {formatUsd(category.amount)}/yr
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="text-teal-700 transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </span>
              </summary>
              <p className="border-t border-stone-200/50 px-4 py-3 text-sm leading-relaxed text-stone-600">
                {category.why}
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
