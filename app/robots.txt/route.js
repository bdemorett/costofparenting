import { getSiteUrl } from "../utils/siteUrl";

export async function GET(request) {
  const siteUrl = getSiteUrl(request);

  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
