"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type {
  AgeBand,
  LocationBaseline,
  ParentingCostForecast,
} from "@/types/parenting";

export type ChildcareType = "public" | "private";
export type AgeCounts = Record<AgeBand, number>;

export const AGE_BAND_META: {
  key: AgeBand;
  label: string;
  hint: string;
  defaultAge: number;
}[] = [
  { key: "infant", label: "Infant", hint: "0–2 yrs", defaultAge: 0 },
  { key: "toddler", label: "Toddler", hint: "2–4 yrs", defaultAge: 3 },
  { key: "elementary", label: "Elementary", hint: "5–12 yrs", defaultAge: 8 },
  { key: "teen", label: "Teen", hint: "13–17 yrs", defaultAge: 15 },
];

export const CURATED_LOCATIONS = [
  { id: "austin", label: "Austin, TX", href: "/cost-of-parenting/tx/austin" },
  {
    id: "new-york",
    label: "New York City, NY",
    href: "/cost-of-parenting/ny/new-york",
  },
  {
    id: "los-angeles",
    label: "Los Angeles, CA",
    href: "/cost-of-parenting/ca/los-angeles",
  },
  { id: "chicago", label: "Chicago, IL", href: "/cost-of-parenting/il/chicago" },
  { id: "denver", label: "Denver, CO", href: "/cost-of-parenting/co/denver" },
  { id: "seattle", label: "Seattle, WA", href: "/cost-of-parenting/wa/seattle" },
] as const;

export const PAYWALL_FEATURES = [
  "Custom 18-year inflation-adjusted projections",
  "Regional tax credit deductions",
  "Hyper-local private school database access",
  "Multi-child lifestyle scenario modeling",
  "Export-ready family cost briefs",
];

type CostExperienceContextValue = {
  baseline: LocationBaseline;
  cityLabel: string;
  stateSlug: string;
  citySlug: string;
  isCurated: boolean;
  ageCounts: AgeCounts;
  familySize: number;
  childcareType: ChildcareType;
  childCount: number;
  showPaywall: boolean;
  chartRevealed: boolean;
  forecast: ParentingCostForecast | null;
  fetchError: string | null;
  isPending: boolean;
  subscribed: boolean;
  cityContext: string;
  baselineTeaserTotal: number;
  updateAgeCount: (band: AgeBand, next: number) => void;
  updateFamilySize: (next: number) => void;
  updateChildcareType: (next: ChildcareType) => void;
  /** Set elementary count and clear teen (school-age bracket). */
  setSchoolAgeCount: (next: number) => void;
  revealForecastChart: () => void;
  setShowPaywall: (open: boolean) => void;
};

const CostExperienceContext = createContext<CostExperienceContextValue | null>(
  null,
);

function countsToAges(counts: AgeCounts): number[] {
  const ages: number[] = [];
  for (const band of AGE_BAND_META) {
    for (let i = 0; i < counts[band.key]; i += 1) {
      ages.push(band.defaultAge);
    }
  }
  return ages;
}

function totalChildren(counts: AgeCounts): number {
  return AGE_BAND_META.reduce((sum, band) => sum + counts[band.key], 0);
}

function isActiveSubscriber(
  user: ReturnType<typeof useUser>["user"],
): boolean {
  if (!user) return false;
  const meta = (
    user as unknown as {
      privateMetadata?: { stripeSubscriptionStatus?: unknown };
    }
  ).privateMetadata;
  return meta?.stripeSubscriptionStatus === "active";
}

export function formatUsd(value: number, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildHouseholdYearlyTotals(
  forecast: ParentingCostForecast,
): number[] {
  const years = forecast.horizonYears;
  const totals = Array.from({ length: years }, () => 0);
  for (const child of forecast.children) {
    for (const row of child.yearly) {
      totals[row.yearIndex] += row.totalAnnual;
    }
  }
  return totals.map((n) => Math.round(n));
}

export interface CostExperienceProviderProps {
  baseline: LocationBaseline;
  cityLabel: string;
  stateSlug: string;
  citySlug: string;
  isCurated?: boolean;
  children: ReactNode;
}

export function CostExperienceProvider({
  baseline,
  cityLabel,
  stateSlug,
  citySlug,
  isCurated = true,
  children,
}: CostExperienceProviderProps) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isPending, startTransition] = useTransition();

  const [ageCounts, setAgeCounts] = useState<AgeCounts>({
    infant: 1,
    toddler: 0,
    elementary: 0,
    teen: 0,
  });
  const [familySize, setFamilySize] = useState(3);
  const [childcareType, setChildcareType] = useState<ChildcareType>("public");
  const [showPaywall, setShowPaywall] = useState(false);
  const [chartRevealed, setChartRevealed] = useState(false);
  const [forecast, setForecast] = useState<ParentingCostForecast | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const cityContext = `${stateSlug}/${citySlug}`;
  const subscribed = isLoaded && isSignedIn && isActiveSubscriber(user);
  const childCount = totalChildren(ageCounts);
  const baselineTeaserTotal =
    baseline.annualCosts.childcare +
    baseline.annualCosts.food +
    baseline.annualCosts.healthcare +
    baseline.annualCosts.housing;

  const runSecureCalculate = useCallback(
    async (
      nextCounts: AgeCounts = ageCounts,
      nextChildcare: ChildcareType = childcareType,
      nextFamilySize: number = familySize,
    ) => {
      const ages = countsToAges(nextCounts);
      if (ages.length === 0) {
        setFetchError("Add at least one child to run a forecast.");
        return;
      }

      setFetchError(null);

      try {
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationId: baseline.locationId,
            childAges: ages,
            horizonYears: 18,
            childcareType: nextChildcare,
            familySize: nextFamilySize,
          }),
        });

        const data = await response.json();

        if (response.status === 401) {
          clerk.openSignIn();
          return;
        }

        if (response.status === 402) {
          setShowPaywall(true);
          setChartRevealed(false);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Unable to calculate costs.",
          );
        }

        setForecast(data as ParentingCostForecast);
        setChartRevealed(true);
        setShowPaywall(false);
      } catch (error) {
        setFetchError(
          error instanceof Error ? error.message : "Unable to calculate costs.",
        );
      }
    },
    [ageCounts, baseline.locationId, childcareType, clerk, familySize],
  );

  const gatePremiumAction = useCallback(
    (onAllowed: () => void) => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        clerk.openSignUp();
        return;
      }

      if (!isActiveSubscriber(user)) {
        setShowPaywall(true);
        return;
      }

      onAllowed();
    },
    [clerk, isLoaded, isSignedIn, user],
  );

  const updateAgeCount = useCallback(
    (band: AgeBand, next: number) => {
      const clamped = Math.max(0, Math.min(6, next));
      setAgeCounts((prev) => {
        const updated = { ...prev, [band]: clamped };
        const adults = Math.max(1, familySize - totalChildren(prev));
        const nextFamily = adults + totalChildren(updated);
        setFamilySize(nextFamily);
        return updated;
      });
    },
    [familySize],
  );

  const setSchoolAgeCount = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(6, next));
      setAgeCounts((prev) => {
        const updated = { ...prev, elementary: clamped, teen: 0 };
        const adults = Math.max(1, familySize - totalChildren(prev));
        const nextFamily = adults + totalChildren(updated);
        setFamilySize(nextFamily);
        return updated;
      });
    },
    [familySize],
  );

  const updateFamilySize = useCallback((next: number) => {
    const value = Math.max(1, Math.min(12, next));
    setFamilySize(value);
  }, []);

  const updateChildcareType = useCallback((next: ChildcareType) => {
    setChildcareType(next);
  }, []);

  const revealForecastChart = useCallback(() => {
    gatePremiumAction(() => {
      startTransition(() => {
        void runSecureCalculate();
      });
    });
  }, [gatePremiumAction, runSecureCalculate]);

  const value = useMemo<CostExperienceContextValue>(
    () => ({
      baseline,
      cityLabel,
      stateSlug,
      citySlug,
      isCurated,
      ageCounts,
      familySize,
      childcareType,
      childCount,
      showPaywall,
      chartRevealed,
      forecast,
      fetchError,
      isPending,
      subscribed,
      cityContext,
      baselineTeaserTotal,
      updateAgeCount,
      updateFamilySize,
      updateChildcareType,
      setSchoolAgeCount,
      revealForecastChart,
      setShowPaywall,
    }),
    [
      ageCounts,
      baseline,
      baselineTeaserTotal,
      chartRevealed,
      childcareType,
      childCount,
      cityContext,
      cityLabel,
      citySlug,
      familySize,
      fetchError,
      forecast,
      isCurated,
      isPending,
      revealForecastChart,
      setSchoolAgeCount,
      showPaywall,
      stateSlug,
      subscribed,
      updateAgeCount,
      updateChildcareType,
      updateFamilySize,
    ],
  );

  return (
    <CostExperienceContext.Provider value={value}>
      {children}
    </CostExperienceContext.Provider>
  );
}

export function useCostExperience(): CostExperienceContextValue {
  const ctx = useContext(CostExperienceContext);
  if (!ctx) {
    throw new Error(
      "useCostExperience must be used within CostExperienceProvider",
    );
  }
  return ctx;
}
