import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

export const metadata = {
  title: "Contact — Before You Move There",
  description: "Contact Before You Move There for support, privacy requests, and partnerships.",
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact us"
      description="We're a small team building neighborhood intelligence for movers. Reach out anytime."
    >
      <LegalSection title="General support">
        <p>
          Questions about your account, premium access, or neighborhood reports:
          <br />
          <a href="mailto:support@beforeyoumovethere.com" className="text-emerald-700 underline">
            support@beforeyoumovethere.com
          </a>
        </p>
        <p>We aim to respond within 2 business days.</p>
      </LegalSection>

      <LegalSection title="Privacy requests">
        <p>
          For privacy, data access, or deletion requests:
          <br />
          <a href="mailto:privacy@beforeyoumovethere.com" className="text-emerald-700 underline">
            privacy@beforeyoumovethere.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Advertising">
        <p>
          Our free tier is supported by advertising, including Google AdSense. For
          advertising or partnership inquiries, email{" "}
          <a href="mailto:support@beforeyoumovethere.com" className="text-emerald-700 underline">
            support@beforeyoumovethere.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Website">
        <p>
          <a href="https://www.beforeyoumovethere.com" className="text-emerald-700 underline">
            https://www.beforeyoumovethere.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
