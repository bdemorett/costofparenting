import {
  fetchActiveCitiesForSitemap,
  SITEMAP_FALLBACK_CITIES,
} from "../data/citiesRepository";
import { normalizeSiteUrl } from "../utils/siteUrl";
import { citySlugToMoveToUrl } from "../utils/sitemapUrls";

export const dynamic = "force-dynamic";

const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastmod(value) {
  if (!value) {
    return new Date().toISOString().split("T")[0];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return date.toISOString().split("T")[0];
}

export function generateSiteMap(cities) {
  const homepageLastmod = formatLastmod(
    cities.reduce((latest, city) => {
      const timestamp = new Date(city.updated_at).getTime();
      return Number.isNaN(timestamp) ? latest : Math.max(latest, timestamp);
    }, 0) || Date.now(),
  );

  const cityEntries = cities
    .map((city) => {
      const slug = String(city.slug || "")
        .trim()
        .replace(/^\/+|\/+$/g, "");

      if (!slug) return "";

      const loc = citySlugToMoveToUrl(slug, SITE_URL);
      if (!loc) return "";

      return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${formatLastmod(city.updated_at)}</lastmod>
  </url>`;
    })
    .join("");

  const staticEntries = [
    "/pricing",
    "/privacy-policy",
    "/terms-of-service",
    "/about",
    "/contact",
  ]
    .map(
      (path) => `
  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <lastmod>${homepageLastmod}</lastmod>
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(SITE_URL)}</loc>
    <lastmod>${homepageLastmod}</lastmod>
  </url>${staticEntries}${cityEntries}
</urlset>`;
}

function xmlResponse(xml, { fallback = false, status = 200 } = {}) {
  return new Response(xml, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": fallback
        ? "public, max-age=300, stale-while-revalidate=600"
        : "public, s-maxage=3600, stale-while-revalidate=86400",
      ...(fallback ? { "X-Sitemap-Fallback": "true" } : {}),
    },
  });
}

export async function GET() {
  try {
    const cities = await fetchActiveCitiesForSitemap();
    return xmlResponse(generateSiteMap(cities));
  } catch (error) {
    console.error("[sitemap] Primary city fetch failed:", error);

    try {
      return xmlResponse(generateSiteMap(SITEMAP_FALLBACK_CITIES), {
        fallback: true,
      });
    } catch (fallbackError) {
      console.error("[sitemap] Fallback generation failed:", fallbackError);

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><error>Sitemap unavailable</error>`,
        {
          status: 500,
          headers: { "Content-Type": "text/xml; charset=utf-8" },
        },
      );
    }
  }
}
