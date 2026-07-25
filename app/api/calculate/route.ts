import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  addCostBreakdowns,
  ageToBand,
  emptyCostBreakdown,
  getSafeLocationBaseline,
  globalAgeMatrix,
  scaleCostBreakdown,
  sumCostBreakdown,
} from "@/lib/mockData";
import type {
  ChildForecast,
  ForecastYear,
  ParentingCostForecast,
} from "@/types/parenting";

export const dynamic = "force-dynamic";

const DEFAULT_HORIZON_YEARS = 10;
const MAX_HORIZON_YEARS = 18;
const MAX_CHILDREN = 12;
const MAX_STARTING_AGE = 17;
const PRIVATE_CHILDCARE_MULTIPLIER = 1.65;

interface CalculateRequestBody {
  locationId?: unknown;
  childAges?: unknown;
  /** Accepted alias for `childAges`. */
  ages?: unknown;
  /** Forecast length in years (1–18). Defaults to 10. */
  horizonYears?: unknown;
  /** Public daycare vs private childcare premium. */
  childcareType?: unknown;
}

function isActiveSubscriber(
  privateMetadata: Record<string, unknown> | undefined,
): boolean {
  return privateMetadata?.stripeSubscriptionStatus === "active";
}

function parseHorizonYears(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_HORIZON_YEARS;
  return Math.min(MAX_HORIZON_YEARS, Math.max(1, Math.floor(n)));
}

function parseChildcareType(value: unknown): "public" | "private" {
  return value === "private" ? "private" : "public";
}

function applyChildcareLifestyle(
  costs: ReturnType<typeof getSafeLocationBaseline>["annualCosts"],
  childcareType: "public" | "private",
) {
  if (childcareType !== "private") return costs;
  return {
    ...costs,
    childcare: Math.round(costs.childcare * PRIVATE_CHILDCARE_MULTIPLIER * 100) / 100,
  };
}

function parseChildAges(body: CalculateRequestBody): number[] | null {
  const raw = body.childAges ?? body.ages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  if (raw.length > MAX_CHILDREN) {
    return null;
  }

  const ages: number[] = [];
  for (const value of raw) {
    const age = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(age) || age < 0 || age > MAX_STARTING_AGE) {
      return null;
    }
    ages.push(Math.floor(age));
  }

  return ages;
}

function buildChildForecast(
  childIndex: number,
  startingAge: number,
  baselineCosts: ReturnType<typeof getSafeLocationBaseline>["annualCosts"],
  startCalendarYear: number,
  horizonYears: number,
): ChildForecast {
  const yearly: ForecastYear[] = [];
  let categoryTotals = emptyCostBreakdown();

  for (let yearIndex = 0; yearIndex < horizonYears; yearIndex += 1) {
    const age = startingAge + yearIndex;
    const ageBand = ageToBand(age);
    const multiplier = globalAgeMatrix[ageBand];
    const annualCosts = scaleCostBreakdown(baselineCosts, multiplier);
    const totalAnnual = sumCostBreakdown(annualCosts);

    yearly.push({
      yearIndex,
      calendarYear: startCalendarYear + yearIndex,
      age,
      ageBand,
      multiplier,
      annualCosts,
      totalAnnual,
    });

    categoryTotals = addCostBreakdowns(categoryTotals, annualCosts);
  }

  const outlookTotal = sumCostBreakdown(categoryTotals);

  return {
    childIndex,
    startingAge,
    yearly,
    tenYearTotal: outlookTotal,
    categoryTotals,
  };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (
    !clerkUser ||
    !isActiveSubscriber(
      clerkUser.privateMetadata as Record<string, unknown> | undefined,
    )
  ) {
    return NextResponse.json(
      {
        error: "Payment Required",
        message: "An active subscription is required to calculate parenting costs.",
      },
      { status: 402 },
    );
  }

  let body: CalculateRequestBody;
  try {
    body = (await request.json()) as CalculateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const locationId =
    typeof body.locationId === "string" ? body.locationId.trim() : "";
  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required." },
      { status: 400 },
    );
  }

  const childAges = parseChildAges(body);
  if (!childAges) {
    return NextResponse.json(
      {
        error:
          "childAges must be a non-empty array of ages between 0 and 17 (max 12 children).",
      },
      { status: 400 },
    );
  }

  const horizonYears = parseHorizonYears(body.horizonYears);
  const childcareType = parseChildcareType(body.childcareType);
  const baseline = getSafeLocationBaseline(locationId);
  const adjustedCosts = applyChildcareLifestyle(
    baseline.annualCosts,
    childcareType,
  );
  const startCalendarYear = new Date().getFullYear();

  const children = childAges.map((startingAge, childIndex) =>
    buildChildForecast(
      childIndex,
      startingAge,
      adjustedCosts,
      startCalendarYear,
      horizonYears,
    ),
  );

  let householdCategoryTotals = emptyCostBreakdown();
  for (const child of children) {
    householdCategoryTotals = addCostBreakdowns(
      householdCategoryTotals,
      child.categoryTotals,
    );
  }

  const payload: ParentingCostForecast = {
    locationId: baseline.locationId,
    displayName: baseline.displayName,
    state: baseline.state,
    currency: baseline.currency,
    horizonYears,
    baselineUpdatedAt: baseline.updatedAt,
    multipliers: { ...globalAgeMatrix },
    baselineAnnualCosts: adjustedCosts,
    children,
    householdTenYearTotal: sumCostBreakdown(householdCategoryTotals),
    householdCategoryTotals,
  };

  return NextResponse.json(payload, { status: 200 });
}
