import { ClerkProvider } from "@clerk/nextjs";
import AdSenseScript from "./components/AdSenseScript";
import CookieNotice from "./components/CookieNotice";
import { normalizeSiteUrl } from "./utils/siteUrl";
import "./globals.css";

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Before You Move There",
  description: "Research neighborhoods before you move.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
        <AdSenseScript />
        <CookieNotice />
      </body>
    </html>
  );
}