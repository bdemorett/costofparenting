import { parseCitySlug } from "../data/sitemapCities";
import { normalizeSiteUrl } from "../utils/siteUrl";

export function citySlugToMoveToPath(slug) {
  const parsed = parseCitySlug(slug);
  if (!parsed) return null;
  return `/move-to/${parsed.state}/${parsed.city}`;
}

export function citySlugToMoveToUrl(slug, siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)) {
  const path = citySlugToMoveToPath(slug);
  if (!path) return null;
  return `${siteUrl}${path}`;
}
