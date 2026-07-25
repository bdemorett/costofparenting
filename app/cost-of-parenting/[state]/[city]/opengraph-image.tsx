import { ImageResponse } from "next/og";
import { LOCATION_BASELINES, sumCostBreakdown } from "@/lib/mockData";

export const runtime = "edge";

export const alt = "Cost of Parenting Estimate";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function deslugifyCity(segment: string): string {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeState(segment: string): string {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function resolveLocationId(citySlug: string): string {
  const city = citySlug.trim().toLowerCase();
  const aliases: Record<string, string> = {
    austin: "austin",
    "new-york": "new-york",
    nyc: "new-york",
    "los-angeles": "los-angeles",
    la: "los-angeles",
    chicago: "chicago",
    denver: "denver",
    seattle: "seattle",
    dallas: "dallas",
    miami: "miami",
    boston: "boston",
    atlanta: "atlanta",
    phoenix: "phoenix",
    "san-francisco": "san-francisco",
    sf: "san-francisco",
  };

  if (aliases[city]) return aliases[city];
  if (city.includes("york")) return "new-york";
  if (city.includes("austin")) return "austin";
  if (city.includes("angeles")) return "los-angeles";
  if (city.includes("francisco")) return "san-francisco";
  return city;
}

/** Edge-safe baseline lookup — mock catalog only (no Node DB drivers). */
function getOgBaseline(citySlug: string) {
  const locationId = resolveLocationId(citySlug);
  return (
    LOCATION_BASELINES[locationId] ??
    LOCATION_BASELINES.austin ??
    Object.values(LOCATION_BASELINES)[0]
  );
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Dynamic Open Graph share card for programmatic city guides.
 * Served at `/cost-of-parenting/[state]/[city]/opengraph-image`.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const cityName = deslugifyCity(city);
  const stateName = normalizeState(state);
  const baseline = getOgBaseline(city);

  const avgMonthlyChildcare = Math.round(
    (baseline.stageMonthly.infant.childcare +
      baseline.stageMonthly.toddler.childcare +
      baseline.stageMonthly.schoolAge.childcare) /
      3,
  );
  const estimatedAnnual = sumCostBreakdown(baseline.annualCosts);
  const headline = `Cost of Raising a Child in ${cityName}, ${stateName}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg, #faf9f6 0%, #f0fdfa 48%, #ccfbf1 100%)",
          padding: "56px 64px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: "#0f766e",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            CP
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                color: "#292524",
                letterSpacing: "-0.02em",
              }}
            >
              Cost of Parenting
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#0f766e",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Localized family cost guide
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 980,
            marginTop: 40,
            marginBottom: 40,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#1c1917",
            letterSpacing: "-0.03em",
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              background: "rgba(255, 255, 255, 0.92)",
              border: "1px solid rgba(15, 118, 110, 0.18)",
              borderRadius: 24,
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                fontWeight: 600,
                color: "#0f766e",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Avg monthly childcare
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 48,
                fontWeight: 700,
                color: "#1c1917",
                letterSpacing: "-0.02em",
              }}
            >
              {formatUsd(avgMonthlyChildcare)}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 18,
                color: "#57534e",
              }}
            >
              Infant to school-age average
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              background: "#0f766e",
              borderRadius: 24,
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                fontWeight: 600,
                color: "#99f6e4",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Estimated annual expense
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 48,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              {formatUsd(estimatedAnnual)}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 18,
                color: "#ccfbf1",
              }}
            >
              School-age planning baseline
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
