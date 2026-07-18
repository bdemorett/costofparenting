const DEFAULT_SITE_URL = "https://beforeyoumovethere.com";

/**
 * Normalizes site URL env values that may have been pasted as Markdown links
 * or include trailing slashes / stray characters.
 */
export function normalizeSiteUrl(value, fallback = DEFAULT_SITE_URL) {
  const raw = String(value || fallback).trim();
  if (!raw) return DEFAULT_SITE_URL;

  const markdownMatch = raw.match(/\[([^\]]*)\]\(([^)]+)\)/);
  if (markdownMatch?.[2]) {
    return stripTrailingSlash(markdownMatch[2].trim());
  }

  const urlMatch = raw.match(/https?:\/\/[^\s\])"'<>]+/i);
  if (urlMatch?.[0]) {
    return stripTrailingSlash(urlMatch[0]);
  }

  return stripTrailingSlash(raw);
}

function stripTrailingSlash(url) {
  return String(url).replace(/\/+$/, "");
}

export function getSiteUrl(request, fallback = DEFAULT_SITE_URL) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    return normalizeSiteUrl(fromEnv, fallback);
  }

  const origin = request?.headers?.get?.("origin");
  if (origin) {
    return normalizeSiteUrl(origin, fallback);
  }

  return normalizeSiteUrl(fallback);
}
