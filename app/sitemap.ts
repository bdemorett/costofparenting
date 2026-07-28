import type { MetadataRoute } from "next";
import {
  citySlugToCostOfParentingUrl,
  SITEMAP_STATIC_PAGES,
} from "@/app/utils/sitemapUrls";
import {
  getSitemapChunkIds,
  loadSitemapCities,
  SITEMAP_CHUNK_SIZE,
  type SitemapCityRow,
} from "@/app/utils/sitemapScale";
import { normalizeSiteUrl } from "@/app/utils/siteUrl";
import { listSitemapStateSlugs } from "@/lib/stateHub";

function siteOrigin(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

/**
 * Flat list of all sitemap entries (home, static pages, state hubs, city guides).
 */
function buildAllSitemapEntries(
  cities: SitemapCityRow[],
  siteUrl: string,
  lastModified: Date,
): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap[number] = {
    url: siteUrl,
    lastModified,
    changeFrequency: "monthly",
    priority: 1.0,
  };

  const staticPages: MetadataRoute.Sitemap = SITEMAP_STATIC_PAGES.map(
    (page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  const statePages: MetadataRoute.Sitemap = listSitemapStateSlugs().map(
    (state) => ({
      url: `${siteUrl}/${state}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }),
  );

  const cityPages: MetadataRoute.Sitemap = [];
  for (const city of cities) {
    const slug = String(city.slug || "")
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();
    if (!slug) continue;

    const url = citySlugToCostOfParentingUrl(slug, siteUrl);
    if (!url) continue;

    cityPages.push({
      url,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return [home, ...staticPages, ...statePages, ...cityPages];
}

/**
 * Declares sitemap chunks served at `/sitemap/0.xml`, `/sitemap/1.xml`, …
 */
export async function generateSitemaps() {
  return getSitemapChunkIds();
}

/**
 * Builds one sitemap chunk for programmatic city scaling.
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
 */
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  if (!Number.isFinite(id) || id < 0) {
    return [];
  }

  const siteUrl = siteOrigin();
  const lastModified = new Date();
  const cities = await loadSitemapCities();
  const allEntries = buildAllSitemapEntries(cities, siteUrl, lastModified);

  const start = id * SITEMAP_CHUNK_SIZE;
  return allEntries.slice(start, start + SITEMAP_CHUNK_SIZE);
}
