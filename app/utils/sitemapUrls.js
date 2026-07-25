import { parseCitySlug } from "../data/sitemapCities";
import { getSiteUrl, normalizeSiteUrl } from "./siteUrl";

/**
 * Converts a compound slug like `austin-tx` into a programmatic city path.
 * @returns {string | null}
 */
export function citySlugToCostOfParentingPath(slug) {
  const parsed = parseCitySlug(slug);
  if (!parsed) return null;
  return `/cost-of-parenting/${parsed.state}/${parsed.city}`;
}

/**
 * Absolute URL for a compound city slug.
 * @param {string} slug
 * @param {string} [siteUrl]
 */
export function citySlugToCostOfParentingUrl(
  slug,
  siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
) {
  const path = citySlugToCostOfParentingPath(slug);
  if (!path) return null;
  const base = normalizeSiteUrl(siteUrl);
  return `${base}${path}`;
}

/** @deprecated Prefer citySlugToCostOfParentingPath */
export function citySlugToMoveToPath(slug) {
  return citySlugToCostOfParentingPath(slug);
}

/** @deprecated Prefer citySlugToCostOfParentingUrl */
export function citySlugToMoveToUrl(slug, siteUrl) {
  return citySlugToCostOfParentingUrl(slug, siteUrl);
}

/**
 * Resolves the production site origin for sitemap generation.
 * Prefers NEXT_PUBLIC_SITE_URL; falls back to request origin / default.
 */
export function resolveSitemapSiteUrl(request) {
  return getSiteUrl(request);
}

/**
 * Static marketing / legal routes included in the sitemap.
 * Home is handled separately at priority 1.0.
 */
export const SITEMAP_STATIC_PAGES = [
  { path: "/pricing", priority: 0.8, changefreq: "monthly" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
  { path: "/privacy-policy", priority: 0.8, changefreq: "monthly" },
  { path: "/terms-of-service", priority: 0.8, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
];

export const SITEMAP_CITY_PRIORITY = 0.8;
export const SITEMAP_CITY_CHANGEFREQ = "monthly";
export const SITEMAP_HOME_PRIORITY = 1.0;