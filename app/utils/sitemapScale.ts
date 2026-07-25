import {
  fetchActiveCitiesForSitemap,
  SITEMAP_FALLBACK_CITIES,
} from "../data/citiesRepository";
import { SITEMAP_STATIC_PAGES } from "./sitemapUrls";

/**
 * Google's hard limit is 50,000 URLs per sitemap file.
 * Stay under that so home + static + cities fit cleanly per chunk.
 */
export const SITEMAP_CHUNK_SIZE = 45_000;

export type SitemapCityRow = {
  slug: string;
  updated_at?: string | Date;
};

/**
 * Loads city rows for sitemap generation (catalog JSON, optional DB merge).
 */
export async function loadSitemapCities(): Promise<SitemapCityRow[]> {
  try {
    return await fetchActiveCitiesForSitemap();
  } catch (error) {
    console.error("[sitemap] Primary city fetch failed:", error);
    return SITEMAP_FALLBACK_CITIES;
  }
}

/**
 * Total URL count for home + static marketing pages + city guides.
 */
export function countSitemapUrls(cityCount: number): number {
  return 1 + SITEMAP_STATIC_PAGES.length + cityCount;
}

/**
 * Returns sitemap chunk ids for `generateSitemaps` / the sitemap index.
 */
export async function getSitemapChunkIds(): Promise<Array<{ id: number }>> {
  const cities = await loadSitemapCities();
  const totalUrls = countSitemapUrls(cities.length);
  const sitemapCount = Math.max(
    1,
    Math.ceil(totalUrls / SITEMAP_CHUNK_SIZE),
  );

  return Array.from({ length: sitemapCount }, (_, id) => ({ id }));
}
