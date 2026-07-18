export const PREMIUM_PRICE = "$29";
export const PREMIUM_PERIOD = "lifetime";

export const FREE_PLAN = {
  name: "Free Preview",
  price: "$0",
  period: "forever",
  description:
    "Open-access neighborhood scores before you commit to a move — no credit card required.",
  features: [
    "Safety, noise, school & air quality scores",
    "Search any US neighborhood",
    "Premium deep-dive preview (locked)",
    "Ads supported",
  ],
  cta: "Start Free",
};

export const PREMIUM_PLAN = {
  name: "Lifetime Premium Pass",
  price: PREMIUM_PRICE,
  period: PREMIUM_PERIOD,
  description:
    "One payment unlocks true cost, hazard, and commute intelligence on every neighborhood you research.",
  features: [
    "True Cost of Ownership matrix",
    "Property tax trajectories & utility estimates",
    "Flood, wildfire & insurance hazard checks",
    "Custom commute & expense calculator",
    "Agent-ready PDF neighborhood brief export",
    "Unlimited US neighborhoods — forever",
  ],
  cta: "Get Lifetime Pass",
  badge: "Best Value",
};
