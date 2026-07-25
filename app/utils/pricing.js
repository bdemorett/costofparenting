export const PREMIUM_PRICE = "$29";
export const PREMIUM_PERIOD = "lifetime";

export const FREE_PLAN = {
  name: "Free Preview",
  price: "$0",
  period: "forever",
  description:
    "Open city baselines for childcare, housing, food, and healthcare — no credit card required.",
  features: [
    "City cost baselines for curated metros",
    "Category share & annual snapshot",
    "Premium forecast preview (locked)",
    "Ads supported on the free tier",
  ],
  cta: "Browse free baselines",
};

export const PREMIUM_PLAN = {
  name: "Lifetime Premium Pass",
  price: PREMIUM_PRICE,
  period: PREMIUM_PERIOD,
  description:
    "One payment unlocks hyper-localized 18-year parenting cost forecasts for every city you research.",
  features: [
    "Age-banded cost multipliers (infant → teen)",
    "18-year household outlook forecasts",
    "Childcare, housing & healthcare breakdowns",
    "Multi-child localized planning tools",
    "Lifestyle scenario modeling",
    "Unlimited US cities — forever",
  ],
  cta: "Get Lifetime Pass",
  badge: "Best Value",
};
