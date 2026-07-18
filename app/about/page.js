import Link from "next/link";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";
import { PREMIUM_PLAN } from "../utils/pricing";

export const metadata = {
  title: "About — Before You Move There",
  description:
    "Learn about Before You Move There — neighborhood intelligence for smarter relocation decisions.",
};

export default function AboutPage() {
  return (
    <LegalPageLayout
      title="About Before You Move There"
      description="We help people understand neighborhoods before they sign a lease, make an offer, or pack a single box."
    >
      <LegalSection title="Our mission">
        <p>
          Moving is one of the biggest decisions most people make — and bad neighborhood intel is
          expensive. Before You Move There exists to surface the signals that matter before you
          commit: safety, schools, noise, air quality, true ownership costs, insurance hazards, and
          commute math.
        </p>
        <p>
          We believe open-access basics should stay free. When you need the full picture, a single
          lifetime pass unlocks the deep-dive tools serious movers rely on.
        </p>
      </LegalSection>

      <LegalSection title="What we offer">
        <p>
          <strong className="text-slate-900">Free neighborhood reports</strong> include
          open-access safety, noise, school, and environmental scores for US locations you search.
        </p>
        <p>
          <strong className="text-slate-900">{PREMIUM_PLAN.name}</strong> ({PREMIUM_PLAN.price}{" "}
          {PREMIUM_PLAN.period}) unlocks premium intelligence on every neighborhood, including:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          {PREMIUM_PLAN.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p>
          See full details on our{" "}
          <Link href="/pricing" className="text-emerald-700 underline">
            pricing page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="How our data works">
        <p>
          Reports combine third-party property and neighborhood datasets, public records, and
          modeled estimates. When a location cannot be verified through geocoding, we may show
          estimated scores derived from your search text.
        </p>
        <p>
          Our content is for research and education — not a substitute for professional inspections,
          appraisals, legal review, or on-the-ground due diligence. Always verify critical facts
          independently.
        </p>
      </LegalSection>

      <LegalSection title="Who we serve">
        <p>
          Renters comparing cities, families evaluating school districts, remote workers testing
          commute tradeoffs, and agents preparing clients with neighborhood briefs — anyone who wants
          clearer context before a move.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions, feedback, or partnership inquiries:
          <br />
          <a href="mailto:support@beforeyoumovethere.com" className="text-emerald-700 underline">
            support@beforeyoumovethere.com
          </a>
        </p>
        <p>
          For privacy-specific requests, email{" "}
          <a href="mailto:privacy@beforeyoumovethere.com" className="text-emerald-700 underline">
            privacy@beforeyoumovethere.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
