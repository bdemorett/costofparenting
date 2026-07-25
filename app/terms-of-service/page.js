import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

export const metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of Cost of Parenting.",
};

const UPDATED = "July 10, 2026";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="Please read these terms carefully before using Cost of Parenting."
      updatedAt={UPDATED}
    >
      <LegalSection title="1. Agreement">
        <p>
          By accessing or using Cost of Parenting (&ldquo;the Service,&rdquo;
          &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;), you agree to these Terms of Service
          (&ldquo;Terms&rdquo;). If you do not agree, do not use the
          Service.
        </p>
      </LegalSection>

      <LegalSection title="2. The Service">
        <p>
          Cost of Parenting provides localized parenting cost tools, including city baselines,
          age-band multipliers, multi-year outlook forecasts, and related location insights for
          the United States. We offer a free tier with open-access scores and a paid Lifetime
          Premium Pass with additional features.
        </p>
        <p>
          The Service is provided for informational purposes only. It is not legal, financial,
          childcare, insurance, or professional advice. You are responsible for
          verifying information independently before making decisions.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts">
        <p>
          Some features require an account. You are responsible for maintaining the confidentiality
          of your credentials and for all activity under your account. You must provide accurate
          information and notify us promptly of unauthorized use.
        </p>
        <p>
          We may suspend or terminate accounts that violate these Terms or pose a security or legal
          risk.
        </p>
      </LegalSection>

      <LegalSection title="4. Free and premium access">
        <p>
          Free access includes limited neighborhood reports and may include advertising through
          Google AdSense. Premium access is granted through a one-time Lifetime Premium Pass
          purchase and is tied to your account unless otherwise stated at checkout. Premium users
          do not see ads.
        </p>
        <p>
          Premium entitlements are non-transferable. We may modify free or premium feature sets over
          time, but we will not remove core paid functionality you reasonably purchased without
          notice or remedy where required by law.
        </p>
      </LegalSection>

      <LegalSection title="5. Payments and refunds">
        <p>
          Payments are processed by Stripe. By purchasing premium access, you authorize us and
          Stripe to charge your selected payment method for the displayed amount, currently a
          one-time $29 USD Lifetime Premium Pass unless otherwise shown at checkout.
        </p>
        <p>
          Except where required by law, all sales are final. If you believe a charge was made in
          error, contact{" "}
          <a href="mailto:support@costofparenting.com" className="text-teal-700 underline">
            support@costofparenting.com
          </a>{" "}
          within 14 days of purchase and we will review your request.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Use the Service for unlawful, harmful, or fraudulent purposes</li>
          <li>Scrape, crawl, or bulk-download content without written permission</li>
          <li>Attempt to bypass paywalls, access controls, or security measures</li>
          <li>Reverse engineer, resell, or commercially redistribute our reports without consent</li>
          <li>Interfere with the operation of the Service or other users&apos; access</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Data accuracy and disclaimers">
        <p>
          Neighborhood scores and summaries are generated from third-party data, models, and
          heuristics. Data may be incomplete, estimated, outdated, or unavailable for some
          locations. We do not warrant that any report is accurate, complete, or suitable for your
          specific situation.
        </p>
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
          WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          The Service, including its design, text, graphics, software, and branding, is owned by
          Cost of Parenting or its licensors and is protected by applicable intellectual
          property laws. You receive a limited, non-exclusive, non-transferable license to use the
          Service for personal, non-commercial research unless we agree otherwise in writing.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, COST OF PARENTING AND ITS AFFILIATES,
          OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
          PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SERVICE WILL NOT
          EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM OR (B)
          USD $100.
        </p>
      </LegalSection>

      <LegalSection title="10. Indemnification">
        <p>
          You agree to indemnify and hold harmless Cost of Parenting
          from claims, damages, and expenses arising from your misuse of the Service or violation
          of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate access if you
          breach these Terms or if we discontinue the Service. Sections that by their nature
          should survive termination will survive.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of the United States and the State of Texas, without
          regard to conflict-of-law principles. Disputes will be brought in the state or federal
          courts located in Texas, unless applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes">
        <p>
          We may update these Terms from time to time. Material changes will be posted on this
          page with an updated date. Continued use after changes take effect constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          Cost of Parenting
          <br />
          Email:{" "}
          <a href="mailto:support@costofparenting.com" className="text-teal-700 underline">
            support@costofparenting.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
