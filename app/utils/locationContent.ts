/**
 * App-router facing helpers for programmatic location uniqueness.
 * Re-exports the synthesizer used by city SEO content components.
 */
export {
  computeLocationCostMetrics,
  getNationalCostBenchmarks,
  synthesizeLocationContent,
  type LocationCostMetrics,
  type SynthesizedLocationContent,
} from "@/lib/locationCommentary";

export {
  getStateSubsidyProfile,
  type StateSubsidyProfile,
  type SubsidyProgram,
} from "@/lib/stateSubsidies";
