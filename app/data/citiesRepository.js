import { readFile } from "node:fs/promises";
import path from "node:path";
import { toCitySlug } from "./sitemapCities";

const CATALOG_PATH = path.join(process.cwd(), "app/data/sitemap-cities.json");

/** Cached backup when the primary data source is unavailable. */
export const SITEMAP_FALLBACK_CITIES = [
  { slug: "austin-tx", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "miami-fl", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "nashville-tn", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "phoenix-az", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "tampa-fl", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "orlando-fl", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "charlotte-nc", updated_at: "2026-01-01T00:00:00.000Z" },
  { slug: "dallas-tx", updated_at: "2026-01-01T00:00:00.000Z" },
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
    slug,
    updated_at: entry.updated_at || catalogUpdatedAt,
  };
}

function dedupeCityRows(rows) {
  const seen = new Set();

  return rows.filter((row) => {
    if (!row?.slug || seen.has(row.slug)) return false;
    seen.add(row.slug);
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
        slug: String(row.slug || "").trim(),
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

async function fetchCitiesFromCatalogFile() {
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
 * Loads lightweight sitemap rows (slug + updated_at only).
 * Prefers DATABASE_URL when configured; otherwise reads the local catalog JSON.
 */
export async function fetchActiveCitiesForSitemap() {
  const databaseRows = await fetchCitiesFromDatabase();
  if (databaseRows?.length) {
    return databaseRows;
  }

  const catalogRows = await fetchCitiesFromCatalogFile();
  if (catalogRows.length > 0) {
    return catalogRows;
  }

  throw new Error("No active cities found in catalog file.");
}
