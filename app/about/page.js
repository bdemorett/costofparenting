import Link from "next/link";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";
import { PREMIUM_PLAN } from "../utils/pricing";

export const metadata = {
  title: "About",
  description:
    "Learn about Cost of Parenting — hyper-localized forecasts for the real cost of raising kids.",
};

export default function AboutPage() {
  return (
    <LegalPageLayout
      title="About Cost of Parenting"
      description="We help families understand what raising kids actually costs where they live — before budgets get blindsided."
    >
      <LegalSection title="Our mission">
        <p>
          Parenting costs vary wildly by city. Childcare in New York is not childcare in Austin,
          and housing, healthcare, and everyday expenses shift with every move. Cost of Parenting
          exists to surface clear, location-aware numbers: annual baselines, age-band multipliers,
          and multi-year outlooks families can plan around.
        </p>
        <p>
          We believe open-access basics should stay free. When you need the full picture, a single
          lifetime pass unlocks deeper localized forecasts and premium tools.
        </p>
      </LegalSection>

      <LegalSection title="What we offer">
        <p>
          <strong className="text-slate-900">Free location insights</strong> include
          open-access scores and cost-of-living context for US cities you search.
        </p>
        <p>
          <strong className="text-slate-900">{PREMIUM_PLAN.name}</strong> ({PREMIUM_PLAN.price}{" "}
          {PREMIUM_PLAN.period}) unlocks premium intelligence, including:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          {PREMIUM_PLAN.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p>
          See full details on our{" "}
          <Link href="/pricing" className="text-teal-700 underline">
            pricing page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="How our data works">
        <p>
          Forecasts combine local baseline cost models, age-band multipliers, and public datasets.
          When a location cannot be verified through live data, we fall back to curated mock
          baselines so planning tools keep working.
        </p>
        <p>
          Our content is for research and education — not a substitute for professional financial,
          legal, or childcare advice. Always verify critical figures independently.
        </p>
      </LegalSection>

      <LegalSection title="Who we serve">
        <p>
          Expecting parents comparing cities, families weighing a relocation, and anyone who wants
          a clearer multi-year picture of childcare, housing, and everyday kid costs by location.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions, feedback, or partnership inquiries:
          <br />
          <a href="mailto:support@costofparenting.com" className="text-teal-700 underline">
            support@costofparenting.com
          </a>
        </p>
        <p>
          For privacy-specific requests, email{" "}
          <a href="mailto:privacy@costofparenting.com" className="text-teal-700 underline">
            privacy@costofparenting.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
