import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseCitySlug } from "./app/data/sitemapCities";

export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;

  // Legacy /sitemap.xml → chunked sitemap index
  if (pathname === "/sitemap.xml") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/sitemap-index.xml";
    return NextResponse.redirect(destination, 308);
  }

  // Legacy /compare/{city1}/vs/{city2} → /compare/{city1}-vs-{city2}
  const legacyCompareMatch = pathname.match(
    /^\/compare\/([a-z0-9-]+)\/vs\/([a-z0-9-]+)\/?$/i,
  );
  if (legacyCompareMatch) {
    const destination = request.nextUrl.clone();
    destination.pathname = `/compare/${legacyCompareMatch[1]}-vs-${legacyCompareMatch[2]}`;
    return NextResponse.redirect(destination, 308);
  }

  // Legacy compound /cities/{slug} → /cost-of-parenting/{state}/{city}
  const compoundCityMatch = pathname.match(/^\/cities\/([a-z0-9-]+)$/i);
  if (compoundCityMatch) {
    const parsed = parseCitySlug(compoundCityMatch[1]);
    if (parsed) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/cost-of-parenting/${parsed.state}/${parsed.city}`;
      return NextResponse.redirect(destination);
    }
  }

  // Legacy /move-to/* → /cost-of-parenting/*
  const legacyMoveMatch = pathname.match(
    /^\/move-to\/([^/]+)\/([^/]+)(\/.*)?$/i,
  );
  if (legacyMoveMatch) {
    const destination = request.nextUrl.clone();
    const suffix =
      legacyMoveMatch[3] && !legacyMoveMatch[3].startsWith("/brief")
        ? legacyMoveMatch[3]
        : "";
    destination.pathname = `/cost-of-parenting/${legacyMoveMatch[1]}/${legacyMoveMatch[2]}${suffix}`;
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk auto-proxy path
    "/__clerk/:path*",
  ],
};
