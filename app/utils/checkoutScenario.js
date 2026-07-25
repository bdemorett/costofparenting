/**
 * Stripe Checkout metadata helpers.
 * Stripe requires string values (max 500 chars each).
 */

const META_MAX_LEN = 450;

function asString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function clip(value, max = META_MAX_LEN) {
  const text = asString(value);
  return text.length > max ? text.slice(0, max) : text;
}

function asNonNegInt(value, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

/**
 * Normalize client checkout payload into Stripe-safe metadata + redirects.
 */
export function buildCheckoutScenario(body = {}) {
  const cityContext = clip(
    String(body.cityContext || body.cityId || "")
      .trim()
      .replace(/^\/+/, "")
      .replace(/\/+$/, "") || "general",
  );

  const [stateSlug = "", citySlug = ""] = cityContext.includes("/")
    ? cityContext.split("/")
    : ["", ""];

  const intent =
    body.intent === "pdf_report" || body.intent === "pdf_budget_report"
      ? "pdf_report"
      : "lifetime_pass";

  const childCount = asNonNegInt(body.childCount ?? body.kids, 0);
  const infantCount = asNonNegInt(body.infantCount, 0);
  const toddlerCount = asNonNegInt(body.toddlerCount, 0);
  const schoolAgeCount = asNonNegInt(
    body.schoolAgeCount ?? body.elementaryCount,
    0,
  );
  const familySize = asNonNegInt(body.familySize, Math.max(1, childCount + 1));
  const monthlyTotal = asNonNegInt(body.monthlyTotal ?? body.budgetMonthly, 0);
  const annualTotal = asNonNegInt(
    body.annualTotal ?? body.budgetAnnual ?? monthlyTotal * 12,
    0,
  );
  const childcareType =
    body.childcareType === "private" ? "private" : "public";

  const cityLabel = clip(
    body.cityLabel || body.displayName || cityContext || "General",
  );
  const stateCode = clip(
    body.stateCode || body.state || stateSlug.toUpperCase() || "",
  );

  /** @type {Record<string, string>} */
  const metadata = {
    cityContext,
    cityLabel,
    stateCode,
    stateSlug: clip(stateSlug),
    citySlug: clip(citySlug),
    intent,
    childCount: String(childCount),
    infantCount: String(infantCount),
    toddlerCount: String(toddlerCount),
    schoolAgeCount: String(schoolAgeCount),
    familySize: String(familySize),
    childcareType,
    monthlyTotal: String(monthlyTotal),
    annualTotal: String(annualTotal),
  };

  return {
    cityContext,
    intent,
    metadata,
    hasCityPath: cityContext !== "general" && cityContext.includes("/"),
  };
}

export function parseCheckoutSummary(metadata = {}) {
  const meta = metadata && typeof metadata === "object" ? metadata : {};
  return {
    cityContext: asString(meta.cityContext, "general"),
    cityLabel: asString(meta.cityLabel, ""),
    stateCode: asString(meta.stateCode, ""),
    stateSlug: asString(meta.stateSlug, ""),
    citySlug: asString(meta.citySlug, ""),
    intent: asString(meta.intent, "lifetime_pass"),
    childCount: asNonNegInt(meta.childCount, 0),
    infantCount: asNonNegInt(meta.infantCount, 0),
    toddlerCount: asNonNegInt(meta.toddlerCount, 0),
    schoolAgeCount: asNonNegInt(meta.schoolAgeCount, 0),
    familySize: asNonNegInt(meta.familySize, 0),
    childcareType: meta.childcareType === "private" ? "private" : "public",
    monthlyTotal: asNonNegInt(meta.monthlyTotal, 0),
    annualTotal: asNonNegInt(meta.annualTotal, 0),
  };
}
