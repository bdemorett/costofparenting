import {
  getAdSenseClientIdFromServerEnv,
  getAdSensePublisherId,
} from "../utils/adsense";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = getAdSenseClientIdFromServerEnv();
  const publisherId = getAdSensePublisherId(clientId);

  if (!clientId || !publisherId) {
    return new Response(
      [
        "# Google AdSense publisher ID is not configured yet.",
        "# Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in Vercel, then redeploy.",
        "# Optional server-only alias: ADSENSE_CLIENT_ID=ca-pub-...",
      ].join("\n") + "\n",
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
