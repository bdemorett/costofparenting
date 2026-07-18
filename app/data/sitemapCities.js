/**
 * Parses compound slugs like "austin-tx" or "salt-lake-city-ut"
 * into { city: "austin", state: "tx" } for route generation.
 */
export function parseCitySlug(slug) {
  const normalized = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");

  const lastDash = normalized.lastIndexOf("-");
  if (lastDash <= 0) return null;

  const state = normalized.slice(lastDash + 1);
  const city = normalized.slice(0, lastDash);

  if (!city || !state) return null;

  return { city, state };
}

export function toCitySlug(city, state) {
  const cityPart = String(city || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const statePart = String(state || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (!cityPart || !statePart) return null;
  return `${cityPart}-${statePart}`;
}
