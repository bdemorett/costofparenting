import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy — Before You Move There",
  description:
    "How Before You Move There collects, uses, and protects your information.",
};

const UPDATED = "July 10, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="We respect your privacy. This policy explains what we collect, why we collect it, and the choices you have."
      updatedAt={UPDATED}
    >
      <LegalSection title="1. Who we are">
        <p>
          Before You Move There (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates{" "}
          <a href="https://www.beforeyoumovethere.com" className="text-emerald-700 underline">
            beforeyoumovethere.com
          </a>
          , a neighborhood intelligence service for people researching places to live in the United
          States.
        </p>
        <p>
          Questions about this policy can be sent to{" "}
          <a href="mailto:privacy@beforeyoumovethere.com" className="text-emerald-700 underline">
            privacy@beforeyoumovethere.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong className="text-slate-900">Account information.</strong> If you create an account,
          our authentication provider (Clerk) processes your email address, name, and sign-in
          credentials. We receive account identifiers and profile information needed to provide the
          service.
        </p>
        <p>
          <strong className="text-slate-900">Payment information.</strong> Premium purchases are
          processed by Stripe. We do not store full card numbers on our servers. Stripe provides us
          with payment status, transaction identifiers, and the email used at checkout.
        </p>
        <p>
          <strong className="text-slate-900">Search and usage data.</strong> We collect the
          neighborhoods, cities, and zip codes you search, pages you view, and basic technical
          information such as browser type, device type, and IP address.
        </p>
        <p>
          <strong className="text-slate-900">Cookies and similar technologies.</strong> We use
          cookies and local storage for authentication, session management, and site functionality.
          Third-party services we use may set their own cookies as described below.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide neighborhood reports and premium features you request</li>
          <li>Create and manage your account and premium entitlements</li>
          <li>Process payments and prevent fraud</li>
          <li>Improve site performance, reliability, and product features</li>
          <li>Respond to support requests and legal obligations</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="4. Advertising and Google AdSense">
        <p>
          Our free tier is supported by advertising. We use <strong className="text-slate-900">Google AdSense</strong>{" "}
          to display ads on free neighborhood reports and other open-access pages. Premium
          subscribers do not see ads.
        </p>
        <p>
          Google and its advertising partners may use cookies, mobile identifiers, and similar
          technologies to serve ads, measure ad performance, and show ads based on your visits to
          this site and other websites.
        </p>
        <p>
          You can learn more about how Google uses data from partner sites and apps in{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            className="text-emerald-700 underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google&apos;s partner sites policy
          </a>
          . Google&apos;s advertising policies are available at{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            className="text-emerald-700 underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            policies.google.com/technologies/ads
          </a>
          .
        </p>
        <p>
          You may opt out of personalized advertising from Google by visiting{" "}
          <a
            href="https://adssettings.google.com"
            className="text-emerald-700 underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Ads Settings
          </a>
          . You can also visit{" "}
          <a
            href="https://www.aboutads.info"
            className="text-emerald-700 underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            aboutads.info
          </a>{" "}
          to opt out of some third-party vendors&apos; use of cookies for personalized advertising.
        </p>
      </LegalSection>

      <LegalSection title="5. Third-party services">
        <p>We rely on trusted providers to operate the site, including:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-slate-900">Clerk</strong> — user authentication and account
            management
          </li>
          <li>
            <strong className="text-slate-900">Stripe</strong> — payment processing
          </li>
          <li>
            <strong className="text-slate-900">Vercel</strong> — hosting and infrastructure
          </li>
          <li>
            <strong className="text-slate-900">Google AdSense</strong> — advertising on the free
            tier (see section 4)
          </li>
          <li>
            <strong className="text-slate-900">Data partners</strong> — third-party sources such as
            ATTOM and public datasets used to generate neighborhood scores and summaries
          </li>
        </ul>
        <p>
          Each provider processes data under its own privacy policy. We encourage you to review
          those policies for more detail.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We retain account and purchase records for as long as your account is active or as needed
          to provide the service, comply with law, resolve disputes, and enforce our agreements.
          You may request deletion of your account by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="7. Your choices and rights">
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or export
          personal information, or to object to certain processing. To make a request, email{" "}
          <a href="mailto:privacy@beforeyoumovethere.com" className="text-emerald-700 underline">
            privacy@beforeyoumovethere.com
          </a>
          . We may need to verify your identity before fulfilling a request.
        </p>
        <p>
          You can manage cookies through your browser settings. Disabling cookies may limit some
          site features, including sign-in.
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>
          Our service is not directed to children under 13, and we do not knowingly collect personal
          information from children under 13. If you believe a child has provided us personal
          information, contact us and we will take appropriate steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use reasonable administrative, technical, and organizational measures to protect
          information. No method of transmission or storage is completely secure, and we cannot
          guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version on
          this page and update the &ldquo;Last updated&rdquo; date. Continued use of the service
          after changes become effective constitutes acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Before You Move There
          <br />
          Email:{" "}
          <a href="mailto:privacy@beforeyoumovethere.com" className="text-emerald-700 underline">
            privacy@beforeyoumovethere.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
