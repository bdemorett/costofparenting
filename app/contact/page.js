import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

export const metadata = {
  title: "Contact",
  description: "Contact Cost of Parenting for support, privacy requests, and partnerships.",
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact us"
      description="We're a small team building localized parenting cost tools for families. Reach out anytime."
    >
      <LegalSection title="General support">
        <p>
          Questions about your account, premium access, or cost forecasts:
          <br />
          <a href="mailto:support@costofparenting.com" className="text-teal-700 underline">
            support@costofparenting.com
          </a>
        </p>
        <p>We aim to respond within 2 business days.</p>
      </LegalSection>

      <LegalSection title="Privacy requests">
        <p>
          For privacy, data access, or deletion requests:
          <br />
          <a href="mailto:privacy@costofparenting.com" className="text-teal-700 underline">
            privacy@costofparenting.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Advertising">
        <p>
          Our free tier is supported by advertising, including Google AdSense. For
          advertising or partnership inquiries, email{" "}
          <a href="mailto:support@costofparenting.com" className="text-teal-700 underline">
            support@costofparenting.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Website">
        <p>
          <a href="https://www.costofparenting.com" className="text-teal-700 underline">
            https://www.costofparenting.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
