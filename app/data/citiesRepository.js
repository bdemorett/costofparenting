import { readFile } from "node:fs/promises";
import path from "node:path";
import { toCitySlug } from "./sitemapCities";

const CATALOG_PATH = path.join(process.cwd(), "app/data/sitemap-cities.json");

/** Cached backup when the catalog file is unavailable. */
export const SITEMAP_FALLBACK_CITIES = [
  { slug: "austin-tx", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "new-york-ny", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "los-angeles-ca", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "chicago-il", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "denver-co", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "seattle-wa", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "dallas-tx", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "miami-fl", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "boston-ma", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "atlanta-ga", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "phoenix-az", updated_at: "2026-01-15T00:00:00.000Z" },
  { slug: "san-francisco-ca", updated_at: "2026-01-15T00:00:00.000Z" },
];

function normalizeCityRow(entry, catalogUpdatedAt) {
  if (typeof entry === "string") {
    const slug = entry.trim();
    return slug ? { slug, updated_at: catalogUpdatedAt } : null;
  }

  if (!entry || typeof entry !== "object") return null;

  const slug =
    entry.slug ||
    toCitySlug(entry.city_name || entry.city, entry.state || entry.state_code);

  if (!slug) return null;

  return {
    slug: String(slug).trim().toLowerCase(),
    updated_at: entry.updated_at || catalogUpdatedAt,
  };
}

function dedupeCityRows(rows) {
  const seen = new Set();

  return rows.filter((row) => {
    const key = String(row?.slug || "")
      .trim()
      .toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    row.slug = key;
    return true;
  });
}

async function fetchCitiesFromDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  let pool;

  try {
    const pg = await import(/* webpackIgnore: true */ "pg");
    pool = new pg.default.Pool({ connectionString });

    const result = await pool.query(
      `SELECT slug, updated_at
       FROM cities
       WHERE active IS DISTINCT FROM false
       ORDER BY slug ASC`,
    );

    const rows = result.rows
      .map((row) => ({
        slug: String(row.slug || "").trim().toLowerCase(),
        updated_at: row.updated_at,
      }))
      .filter((row) => row.slug);

    return rows.length > 0 ? dedupeCityRows(rows) : null;
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") {
      console.error("[sitemap] Database query failed:", error);
    }
    return null;
  } finally {
    if (pool) {
      await pool.end().catch(() => {});
    }
  }
}

/**
 * Reads every city/state route from `app/data/sitemap-cities.json`.
 */
export async function fetchCitiesFromCatalogFile() {
  const raw = await readFile(CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const catalogUpdatedAt =
    parsed.catalog_updated_at || new Date().toISOString();
  const entries = Array.isArray(parsed.cities) ? parsed.cities : [];

  const rows = entries
    .map((entry) => normalizeCityRow(entry, catalogUpdatedAt))
    .filter(Boolean);

  return dedupeCityRows(rows);
}

/**
 * Loads lightweight sitemap rows (slug + updated_at).
 * Primary source: `sitemap-cities.json`. Optionally merges active DB cities.
 */
export async function fetchActiveCitiesForSitemap() {
  const catalogRows = await fetchCitiesFromCatalogFile();
  if (!catalogRows.length) {
    throw new Error("No active cities found in sitemap-cities.json.");
  }

  const databaseRows = await fetchCitiesFromDatabase();
  if (databaseRows?.length) {
    return dedupeCityRows([...catalogRows, ...databaseRows]);
  }

  return catalogRows;
}
