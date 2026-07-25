import { getSitemapChunkIds } from "../utils/sitemapScale";
import { normalizeSiteUrl } from "../utils/siteUrl";

/**
 * Sitemap index pointing at chunked App Router sitemaps
 * (`/sitemap/0.xml`, `/sitemap/1.xml`, …) from `app/sitemap.ts`.
 *
 * Kept separate from `app/sitemap.ts` — Next.js cannot serve both a metadata
 * sitemap and a `/sitemap.xml` route handler at the same path.
 */
export async function GET() {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const chunks = await getSitemapChunkIds();
  const lastmod = new Date().toISOString();

  const entries = chunks
    .map(
      ({ id }) => `  <sitemap>
    <loc>${siteUrl}/sitemap/${id}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
