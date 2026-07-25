/** Shared budget-export lead payload (client + API). */

export type LeadCaptureBudgetSummary = {
  cityName: string;
  stateName: string;
  stateSlug: string;
  citySlug: string;
  cityPath: string;
  childCount: number;
  ageCategory: string;
  ageCategoryLabel: string;
  careType: string;
  careTypeLabel: string;
  monthlyTotal: number;
  annualTotal: number;
  monthlyBreakdown: {
    housing: number;
    food: number;
    healthcare: number;
    childcare: number;
    clothing: number;
    education: number;
  };
};

export type LeadCaptureRequest = {
  name: string;
  email: string;
  targetMoveDate?: string;
  budget: LeadCaptureBudgetSummary;
};
