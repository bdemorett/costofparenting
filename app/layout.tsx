import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import AdSenseScript from "./components/AdSenseScript";
import CookieNotice from "./components/CookieNotice";
import { normalizeSiteUrl } from "./utils/siteUrl";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cost of Parenting",
    template: "%s — Cost of Parenting",
  },
  description:
    "Hyper-localized forecasts for the real cost of raising kids — childcare, housing, healthcare, and more by city.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f766e" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-stone-700 antialiased selection:bg-teal-100 selection:text-stone-900">
        <ClerkProvider>{children}</ClerkProvider>
        <AdSenseScript />
        <CookieNotice />
        {/* Lightweight, non-blocking Web Analytics (Vercel) */}
        <Analytics />
      </body>
      {/* GA4 via @next/third-parties — loads gtag after hydration (avoids LCP/INP hits) */}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
