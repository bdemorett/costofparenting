import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseCitySlug } from "./app/data/sitemapCities";

export default clerkMiddleware((auth, request) => {
  const { pathname, search } = request.nextUrl;
  const compoundCityMatch = pathname.match(/^\/cities\/([a-z0-9-]+)$/i);

  if (compoundCityMatch) {
    const parsed = parseCitySlug(compoundCityMatch[1]);

    if (parsed) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/move-to/${parsed.state}/${parsed.city}`;
      return NextResponse.redirect(destination);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
