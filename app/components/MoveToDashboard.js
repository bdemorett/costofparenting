"use client";

import Link from "next/link";
import { Show, useClerk, useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { resolveSchoolGrade } from "../utils/schoolGrade";
import AdSenseUnit from "./AdSenseUnit";
import { getAdSenseSlots } from "../utils/adsense";

const adSlots = getAdSenseSlots();

const IS_DEV = process.env.NODE_ENV === "development";

const PAYWALL_COPY =
  "Moving is exhausting, and nobody wants to buy into a money pit or a neighborhood that completely drains their energy. Free tools give you basic grades, but Before You Move There unlocks the unvarnished truth before you sign a contract. Unlock your $29 Premium Pass to reveal the True Cost of Ownership, Climate & Insurance Hazard checks, and our custom Commute & Expense Calculator.";

const PREMIUM_BULLETS = [
  "True Cost of Ownership matrix",
  "Property tax trajectories & utility estimates",
  "Flood, wildfire & insurance hazard checks",
  "Custom commute & expense calculator",
  "Agent-ready PDF neighborhood brief export",
];

function formatNoiseDisplay(noise) {
  const scoreStr = String(noise?.score || "");
  const dbMatch = scoreStr.match(/(\d+)\s*dB/i);
  const db = dbMatch ? dbMatch[1] : String(Math.round(30 + (noise?.meter || 50) / 5));
  const shortLabel =
    (noise?.label || "Moderate area")
      .split("—")[0]
      .split(" - ")[0]
      .replace(/^Quiet\s*/i, "Quiet Suburb")
      .trim() || "Moderate area";
  return `${db} dB — ${shortLabel}`;
}

function formatAcousticContext(noise) {
  const traffic = noise?.stats?.find((stat) => /traffic/i.test(stat.label))?.value;
  const nighttime = noise?.stats?.find((stat) => /night/i.test(stat.label))?.value;
  const airport = noise?.stats?.find((stat) => /airport/i.test(stat.label))?.value;

  if (traffic && nighttime) {
    return `Peak traffic: ${traffic} · Nighttime baseline ${nighttime}`;
  }
  if (traffic && airport) {
    return `${traffic} street noise · ${airport}`;
  }
  if (traffic) return `Street acoustic profile: ${traffic}`;
  return noise.trend || "Typical suburban soundscape for the area";
}

function formatSafetySummary(safety) {
  const vsNational =
    safety?.stats?.find((stat) => /national/i.test(stat.label))?.value ?? null;
  const score = safety?.score ?? 0;

  if (score >= 85) {
    return `Exceptionally safe for families${vsNational ? ` — ${vsNational} vs. national` : ""}`;
  }
  if (score >= 70) {
    return `Above-average peace of mind${vsNational ? ` — ${vsNational}` : ` — ${safety?.label || "Good"}`}`;
  }
  if (score >= 55) {
    return `Typical urban safety profile${vsNational ? ` — ${vsNational}` : ""}`;
  }
  return `Worth extra due diligence${vsNational ? ` — ${vsNational}` : ` — ${safety?.label || "Review block-by-block"}`}`;
}

function formatSchoolTrends(schools) {
  const ratio = schools?.stats?.find((stat) =>
    /student-teacher/i.test(stat.label)
  )?.value;
  const coverage = schools?.stats?.find((stat) =>
    /grade coverage|district/i.test(stat.label)
  )?.value;

  const parts = [];
  if (ratio) parts.push(`${ratio} staffing ratio`);
  const trend = schools?.trend;
  if (trend && !/ATTOM_API_KEY|configure/i.test(trend)) {
    parts.push(trend);
  } else if (coverage) {
    parts.push(coverage);
  } else if (schools?.label && !/ATTOM_API_KEY|configure/i.test(schools.label)) {
    parts.push(schools.label);
  }

  return parts.join(" · ") || "Local district composite from public school data";
}

function sanitizeSchoolContext(text) {
  if (!text || /ATTOM_API_KEY|configure/i.test(text)) {
    return "District composite";
  }
  return text;
}

function estimateAqi(noise) {
  const meter = noise?.meter ?? 50;
  return Math.max(25, Math.min(150, Math.round(145 - meter * 1.1)));
}

function aqiTier(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  return "Unhealthy";
}

function formatEnvironmentalDisplay(noise) {
  const aqi = estimateAqi(noise);
  return `AQI ${aqi} — ${aqiTier(aqi)}`;
}

function formatPollenBaseline(noise) {
  const meter = noise?.meter ?? 50;
  const windStat = noise?.stats?.find((stat) => /wind/i.test(stat.label))?.value;

  if (meter >= 70) {
    return windStat
      ? `Low pollen & dust baseline · wind index ${windStat}`
      : "Low pollen & dust baseline — comfortable for most allergy sufferers";
  }
  if (meter >= 55) {
    return "Seasonal pollen spikes possible — monitor spring tree & grass counts";
  }
  return "Higher dust and allergen load in dry months — check local air alerts";
}

function formatEnvironmentalVibe(noise) {
  const meter = noise?.meter ?? 50;
  if (meter >= 70) return "Good / Low Pollen";
  if (meter >= 55) return "Fair / Moderate Air Quality";
  return "Caution / Elevated Hazard Index";
}

function estimateMonthlyUtilities(medianHome, noise) {
  const weatherStat = noise?.stats?.find((stat) =>
    /weather hazard/i.test(stat.label)
  );
  const weatherIndex = weatherStat
    ? parseInt(String(weatherStat.value), 10) || 100
    : 100;
  const climateMultiplier = 0.85 + weatherIndex / 200;
  return Math.round((medianHome / 100000) * 165 * climateMultiplier);
}

function parseInsuranceAnnual(insuranceEst) {
  const numeric = Number(insuranceEst);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const match = String(insuranceEst || "").match(/\$?([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : 1650;
}

function formatCompactCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

function buildPriceTrendSeries(medianHome, appreciationPct) {
  const currentYear = new Date().getFullYear();
  const totalGrowth = 1 + parseFloat(String(appreciationPct)) / 100;
  const annualRate = Math.pow(totalGrowth, 1 / 5) - 1;

  return Array.from({ length: 5 }, (_, index) => {
    const yearsAgo = 4 - index;
    const year = currentYear - yearsAgo;
    const price = Math.round(medianHome / Math.pow(1 + annualRate, yearsAgo));
    return { year, price };
  });
}

function buildRentVsBuy(premium) {
  const medianHome = premium.medianHome;
  const medianRent = premium.medianRent;
  const loanAmount = medianHome * 0.8;
  const monthlyRate = 0.065 / 12;
  const termMonths = 360;
  const mortgage =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  const monthlyTax = (medianHome * parseFloat(String(premium.propertyTax)) / 100) / 12;
  const monthlyInsurance = premium.insuranceEst / 12;
  const monthlyHoa = premium.hoaAvg;
  const buyTotal = Math.round(mortgage + monthlyTax + monthlyInsurance + monthlyHoa);

  return {
    rent: medianRent,
    buy: buyTotal,
    breakdown: {
      mortgage: Math.round(mortgage),
      tax: Math.round(monthlyTax),
      insurance: Math.round(monthlyInsurance),
      hoa: monthlyHoa,
    },
    verdict:
      buyTotal > medianRent
        ? `Renting saves ~$${(buyTotal - medianRent).toLocaleString()}/mo vs buying`
        : `Buying saves ~$${(medianRent - buyTotal).toLocaleString()}/mo vs renting`,
  };
}

function buildPremiumInsights(premium, cityLabel) {
  const data = premium ?? {
    medianHome: 385000,
    medianRent: 1750,
    appreciation: "14.2",
    propertyTax: "1.45",
    hoaAvg: 95,
    insuranceEst: 1650,
    changes: {},
  };
  const lifestyle = data.lifestyle ?? {
    walkScore: 68,
    walkLabel: "Somewhat Walkable",
    transitScore: 42,
    transitLabel: "Some Transit",
    ownerOccupied: 58,
    renterOccupied: 42,
  };

  const economic = data.economic ?? {
    medianHouseholdIncome: 72400,
    incomeTrend: "+3.8% vs national median",
    topEmployers: [
      { name: `${cityLabel} Public Schools`, sector: "Education", share: "14%" },
      { name: "Regional Health System", sector: "Healthcare", share: "11%" },
      { name: "County Government", sector: "Public Sector", share: "9%" },
      { name: "Metro Retail & Services", sector: "Retail", share: "8%" },
      { name: "Local Manufacturing Co.", sector: "Manufacturing", share: "6%" },
    ],
  };

  return {
    ...data,
    lifestyle,
    economic,
    priceTrend: buildPriceTrendSeries(data.medianHome, data.appreciation),
    rentVsBuy: buildRentVsBuy(data),
    taxTrend: buildTaxTrendSeries(data),
  };
}

function buildTaxTrendSeries(premium) {
  const rate = parseFloat(String(premium.propertyTax));
  const annualTax = Math.round((premium.medianHome * rate) / 100);
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 4 }, (_, index) => {
    const yearsAgo = 3 - index;
    const year = currentYear - yearsAgo;
    const growth = Math.pow(1.03, yearsAgo);
    return {
      year,
      rate: (rate - yearsAgo * 0.04).toFixed(2),
      annual: Math.round(annualTax / growth),
    };
  });
}

function statValue(stats, label, fallback = "—") {
  return stats?.find((stat) => stat.label === label)?.value ?? fallback;
}

function buildCommandCenterContext({
  insights,
  schools,
  schoolsList,
  noise,
  safety,
  cityLabel,
  schoolGrade,
}) {
  const floodZone =
    insights.changes?.insuranceEst?.match(/Flood zone:?\s*([^·]+)/i)?.[1]?.trim() ??
    "Zone X — minimal flood risk";

  return {
    studentTeacherRatio: statValue(schools.stats, "Student-teacher ratio", "16:1"),
    districtLabel: schools.label ?? `${cityLabel} area schools`,
    districtGrade: schoolGrade,
    schoolsList,
    safetyScore: safety.score,
    safetyLabel: safety.label,
    climate: {
      floodZone,
      wildfireIndex: statValue(noise.stats, "Weather hazard index", "92 (100 = avg)"),
      windIndex: statValue(noise.stats, "Wind hazard index", "88 (100 = avg)"),
      earthquakeIndex: statValue(noise.stats, "Earthquake index", "42"),
      tornadoIndex: statValue(noise.stats, "Tornado index", "115"),
      environmentalLabel: noise.label,
    },
    mobility: {
      walkScore: insights.lifestyle.walkScore,
      walkLabel: insights.lifestyle.walkLabel,
      transitScore: insights.lifestyle.transitScore,
      transitLabel: insights.lifestyle.transitLabel,
      bikeScore: Math.min(99, Math.round(insights.lifestyle.walkScore * 0.85)),
      commutes: [
        { destination: `${cityLabel} city center`, drive: "19 min", transit: "34 min", distance: "8.2 mi" },
        { destination: "Nearest airport", drive: "26 min", transit: "—", distance: "14 mi" },
        { destination: "Regional employment hub", drive: "22 min", transit: "48 min", distance: "11 mi" },
      ],
    },
  };
}

export default function MoveToDashboard({
  location,
  displayCity,
  stateSlug,
  citySlug,
  safety,
  schools,
  schoolsList,
  noise,
  premium,
  hasCardData,
  schoolStats,
}) {
  const [checkoutVerified, setCheckoutVerified] = useState(false);
  const [devPreviewPremium, setDevPreviewPremium] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showPremiumWelcome, setShowPremiumWelcome] = useState(false);
  const { isSignedIn, isLoaded: authLoaded, user } = useUser();
  const clerk = useClerk();

  // Premium entitlement is resolved client-side from Clerk so the route can
  // stay on the public ISR cache (no cookies / currentUser() on the page).
  const clerkPremiumActive =
    isSignedIn &&
    (user?.publicMetadata?.premium === true ||
      (user?.publicMetadata?.premium &&
        typeof user.publicMetadata.premium === "object" &&
        user.publicMetadata.premium.active === true));

  const premiumUnlocked =
    authLoaded &&
    isSignedIn &&
    (clerkPremiumActive ||
      checkoutVerified ||
      (IS_DEV && devPreviewPremium));

  useEffect(() => {
    if (!authLoaded || isSignedIn) return;

    setCheckoutVerified(false);
    setDevPreviewPremium(false);
    setShowPremiumWelcome(false);
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    if (!authLoaded) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const successFromUrl = params.get("success") === "true";

    if (!sessionId || !successFromUrl) return;

    let cancelled = false;

    async function verifyCheckoutSession() {
      setIsVerifyingSession(true);

      try {
        const response = await fetch("/api/premium/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();

        if (!cancelled && response.ok && data.premium) {
          setCheckoutVerified(true);
          setShowPremiumWelcome(true);
          await user?.reload();
        }
      } catch (error) {
        console.error("[MoveToDashboard] Session verification failed:", error);
      } finally {
        if (!cancelled) {
          setIsVerifyingSession(false);
          params.delete("success");
          params.delete("session_id");
          const remainingQuery = params.toString();
          const cleanUrl = `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}`;
          window.history.replaceState({}, "", cleanUrl);
        }
      }
    }

    verifyCheckoutSession();

    return () => {
      cancelled = true;
    };
  }, [authLoaded, user]);

  function unlockPremium() {
    if (!IS_DEV) return;
    setDevPreviewPremium(true);
  }

  function lockPremium() {
    if (!IS_DEV) return;
    setDevPreviewPremium(false);
    setCheckoutVerified(false);
    setShowPremiumWelcome(false);
  }

  const cityLabel = displayCity || location?.split(",")[0]?.trim() || "this area";
  const schoolGrade = resolveSchoolGrade(schools);
  const insights = buildPremiumInsights(premiumUnlocked ? premium : null, cityLabel);
  const commandCenter = buildCommandCenterContext({
    insights,
    schools,
    schoolsList,
    noise,
    safety,
    cityLabel,
    schoolGrade,
  });

  function handleExportPdf() {
    const url = `/move-to/${stateSlug}/${citySlug}/brief`;
    const briefWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!briefWindow) {
      window.location.assign(url);
    }
  }

  async function handlePremiumCheckout() {
    if (!authLoaded) {
      clerk?.openSignUp?.();
      return;
    }

    if (!isSignedIn) {
      clerk.openSignUp();
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!user?.id || !email) {
      alert("We need a verified email on your account before checkout.");
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const response = await fetch("/api/checkout/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityContext: `${stateSlug}/${citySlug}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error.message || "Unable to start checkout. Please try again.");
      setIsCheckoutLoading(false);
    }
  }

  function handlePdfAction() {
    if (premiumUnlocked) {
      handleExportPdf();
      return;
    }
    setShowPaywallModal(true);
  }

  const premiumPassCtaLabel = !authLoaded
    ? "Checking your account..."
    : isVerifyingSession
      ? "Confirming your payment..."
      : isSignedIn
      ? "Secure Your $29 Lifetime Pass via Stripe"
      : "Step 1: Sign Up to Unlock Premium Pass";

  const lockedPremiumClass = premiumUnlocked
    ? ""
    : "pointer-events-none select-none blur-md opacity-40";

  const monthlyUtilities = estimateMonthlyUtilities(insights.medianHome, noise);
  const annualInsurance = parseInsuranceAnnual(insights.insuranceEst);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {showPremiumWelcome && premiumUnlocked && (
        <PremiumWelcomeBanner onDismiss={() => setShowPremiumWelcome(false)} />
      )}

      {IS_DEV && premiumUnlocked && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-100">
            <span className="font-semibold text-amber-200">Dev mode:</span> Premium
            UI preview only — billing state comes from Clerk metadata after Stripe
            payment.
          </p>
          <button
            type="button"
            onClick={lockPremium}
            className="shrink-0 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/30"
          >
            Reset to Free Tier
          </button>
        </div>
      )}

      {!premiumUnlocked && (
        <AdSenseUnit
          slot={adSlots.leaderboard}
          className="mb-4"
          placeholderLabel="AD SLOT — HEADER LEADERBOARD (728×90 RESPONSIVE)"
        />
      )}

      <div className={`flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between ${premiumUnlocked ? "mt-8" : "mt-4"}`}>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            {premiumUnlocked ? "Neighborhood intelligence" : "Free neighborhood report"}
          </p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            {premiumUnlocked ? `Your ${cityLabel} relocation brief` : `${cityLabel} vibe check`}
          </h2>
          {!premiumUnlocked && (
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              The four open-access scores everyone asks first — safety, noise, schools, and air
              quality. Upgrade anytime for true cost, hazard, and commute intelligence.
            </p>
          )}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center lg:pt-1">
          <Show when="signed-in">
            <div className="flex items-center gap-2.5 self-end rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 sm:self-auto">
              <span className="hidden text-xs font-medium text-emerald-200/90 sm:inline">
                {user?.firstName ? `Hi, ${user.firstName}` : "Signed in"}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-emerald-500/40",
                  },
                }}
              />
            </div>
          </Show>
          <button
            type="button"
            onClick={handlePdfAction}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
              premiumUnlocked
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:text-white"
                : "border border-white/15 bg-white/5 font-semibold text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-100"
            }`}
          >
            📄 Export Your Comprehensive Brief (PDF)
          </button>
        </div>
      </div>

      {hasCardData ? (
        <NeighborhoodVibeCheckGrid
          safety={safety}
          noise={noise}
          schools={schools}
          schoolGrade={schoolGrade}
          schoolMeter={schools?.meter}
          showAds={!premiumUnlocked}
        />
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-amber-200">Report data unavailable</p>
          <p className="mt-2 text-sm text-amber-200/80">
            We couldn&apos;t load safety, school, or noise scores for &ldquo;{location}&rdquo;.
            Try a 5-digit US zip code or a city with state (e.g. Austin TX).
          </p>
        </div>
      )}

      <section className="relative mt-10 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        <div className="p-6 sm:p-8">
          <div className="border-b border-white/10 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
              Premium deep-dive
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Before you sign anything
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              True ownership costs, insurance hazards, and commute math — the details free
              summaries never show.
            </p>
          </div>

          <div className={`mt-6 space-y-6 ${lockedPremiumClass}`}>
            <TrueCostMatrixCard insights={insights} monthlyUtilities={monthlyUtilities} />
            <DisasterInsuranceCard
              commandCenter={commandCenter}
              insights={insights}
              annualInsurance={annualInsurance}
            />
            <PremiumFeatureCard
              emoji="🚗"
              title="Custom Commute Calculator"
              subtitle="Work address, MPG, and toll footprint estimates"
            >
              <CommuteCalculator cityLabel={cityLabel} interactive={premiumUnlocked} />
            </PremiumFeatureCard>
          </div>
        </div>

        {!premiumUnlocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px] sm:p-8">
            <PaywallCalloutCard
              cityLabel={cityLabel}
              isCheckoutLoading={isCheckoutLoading || isVerifyingSession}
              primaryCtaLabel={premiumPassCtaLabel}
              onCheckout={handlePremiumCheckout}
              onSimulateUnlock={unlockPremium}
              showDevControls={IS_DEV}
            />
          </div>
        )}
      </section>

      {showPaywallModal && !premiumUnlocked && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Unlock premium pass"
        >
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setShowPaywallModal(false)}
              className="absolute -top-10 right-0 text-sm text-slate-400 transition hover:text-white"
            >
              Close
            </button>
            <PaywallCalloutCard
              cityLabel={cityLabel}
              isCheckoutLoading={isCheckoutLoading || isVerifyingSession}
              primaryCtaLabel={premiumPassCtaLabel}
              onCheckout={handlePremiumCheckout}
              onSimulateUnlock={() => {
                unlockPremium();
                setShowPaywallModal(false);
              }}
              showDevControls={IS_DEV}
            />
          </div>
        </div>
      )}

      {!premiumUnlocked && <FreeTierComplianceFooter />}

      {premiumUnlocked && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-center text-xs text-emerald-400/80">
            Premium pass active · full intelligence unlocked · ads hidden
          </p>
          {IS_DEV && (
            <button
              type="button"
              onClick={lockPremium}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-200"
            >
              Dev: Simulate Free Tier
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FreeTierComplianceFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 pt-8 pb-4">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400"
        aria-label="Site compliance"
      >
        <Link href="/privacy-policy" className="transition hover:text-emerald-400">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="transition hover:text-emerald-400">
          Terms of Service
        </Link>
        <Link href="/about" className="transition hover:text-emerald-400">
          About
        </Link>
        <Link href="/contact" className="transition hover:text-emerald-400">
          Contact
        </Link>
      </nav>
      <p className="mt-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Before You Move There · Free neighborhood intelligence
      </p>
    </footer>
  );
}

function NeighborhoodVibeCheckGrid({
  safety,
  noise,
  schools,
  schoolGrade,
  schoolMeter,
  showAds = true,
}) {
  return (
    <section className="mt-6" aria-label="Neighborhood vibe check">
      <div
        className={`grid gap-4 sm:grid-cols-2 ${showAds ? "lg:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-4"}`}
      >
        <VibeCheckTile
          emoji="🛡️"
          title="Safety & Crime Index"
          value={`${safety.score}/100`}
          summary={formatSafetySummary(safety)}
          context={safety.label}
          accent="emerald"
          meter={safety.meter}
        />
        <VibeCheckTile
          emoji="🔊"
          title="Noise Level"
          value={formatNoiseDisplay(noise)}
          summary={formatAcousticContext(noise)}
          context={noise.label}
          accent="violet"
          meter={noise.meter}
        />
        <VibeCheckTile
          emoji="🏫"
          title="High-Level School Grade"
          value={schoolGrade}
          summary={formatSchoolTrends(schools)}
          context={sanitizeSchoolContext(schools?.label)}
          accent="blue"
          meter={schoolMeter ?? 70}
        />
        <VibeCheckTile
          emoji="🌲"
          title="Environmental / Air Quality"
          value={formatEnvironmentalDisplay(noise)}
          summary={formatPollenBaseline(noise)}
          context={formatEnvironmentalVibe(noise)}
          accent="emerald"
          meter={noise.meter}
        />
      </div>
      {showAds && (
        <div className="mt-4">
          <AdSenseUnit
            slot={adSlots.infeed}
            placeholderLabel="AD SLOT — IN-FEED NATIVE (728×90 RESPONSIVE)"
          />
        </div>
      )}
    </section>
  );
}

function VibeCheckTile({ emoji, title, value, summary, context, accent, meter }) {
  const accentBar = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
  }[accent] || "bg-emerald-500";

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl" aria-hidden="true">
          {emoji}
        </span>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Free
        </span>
      </div>
      <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h4>
      <p className="mt-2 text-2xl font-bold leading-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{summary}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{context}</p>
      {Number.isFinite(meter) && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${accentBar}`}
            style={{ width: `${Math.min(100, Math.max(0, meter))}%` }}
          />
        </div>
      )}
    </article>
  );
}

function PremiumWelcomeBanner({ onDismiss }) {
  return (
    <div
      className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl" aria-hidden="true">
          🎉
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-200">Welcome to Premium!</p>
          <p className="mt-1 text-sm text-emerald-200/80">
            Your lifetime pass is active. True cost, hazard, and commute tools are unlocked.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-sm text-emerald-300/80 transition hover:text-white"
        aria-label="Dismiss welcome message"
      >
        Dismiss
      </button>
    </div>
  );
}

function PaywallCalloutCard({
  cityLabel,
  isCheckoutLoading,
  primaryCtaLabel,
  onCheckout,
  onSimulateUnlock,
  showDevControls = false,
}) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl shadow-black/50 sm:p-8">
      <p className="text-sm leading-relaxed text-slate-300">{PAYWALL_COPY}</p>

      <div className="mt-6 flex items-baseline justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Premium Pass</p>
          <p className="mt-1 text-xs text-slate-400">Unlimited neighborhoods · {cityLabel}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-white">$29</span>
          <span className="text-sm text-slate-400">lifetime</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onCheckout();
        }}
        disabled={isCheckoutLoading}
        aria-busy={isCheckoutLoading}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#635bff] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-[#5249e0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCheckoutLoading ? (
          <>
            <CheckoutSpinner />
            Processing secure checkout...
          </>
        ) : (
          primaryCtaLabel
        )}
      </button>

      {showDevControls && (
        <button
          type="button"
          onClick={onSimulateUnlock}
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-200"
        >
          Simulate Premium Unlock (dev only)
        </button>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        Secure checkout via Stripe · 7-day money-back guarantee
      </p>
    </div>
  );
}

function CheckoutSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function PremiumFeatureCard({ emoji, title, subtitle, children }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-800/40 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function TrueCostMatrixCard({ insights, monthlyUtilities }) {
  return (
    <PremiumFeatureCard
      emoji="💰"
      title="True Cost Matrix"
      subtitle="Property tax trajectories and climate-adjusted utility estimates"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Monthly carrying cost"
          value={`$${insights.rentVsBuy.buy.toLocaleString()}`}
          change="Mortgage + tax + insurance + HOA"
        />
        <MetricTile
          label="Annual property tax"
          value={`$${Math.round((insights.medianHome * parseFloat(insights.propertyTax)) / 100).toLocaleString()}`}
          change={insights.changes.propertyTax}
        />
        <MetricTile
          label="Est. monthly utilities"
          value={`$${monthlyUtilities.toLocaleString()}`}
          change="Climate-adjusted electric, gas & water"
        />
        <MetricTile
          label="Median home price"
          value={`$${insights.medianHome.toLocaleString()}`}
          change={insights.changes.medianHome}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <HomePriceTrendChart series={insights.priceTrend} appreciation={insights.appreciation} />
        <RentVsBuyChart data={insights.rentVsBuy} />
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <p className="text-sm font-semibold text-white">Property tax trajectory</p>
        <p className="mt-1 text-xs text-slate-500">
          Effective rate and estimated annual bill on median home
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {insights.taxTrend.map((row) => (
            <div
              key={row.year}
              className="rounded-xl border border-white/5 bg-slate-800/80 px-4 py-3"
            >
              <p className="text-xs text-slate-500">{row.year}</p>
              <p className="mt-1 text-lg font-bold text-white">{row.rate}%</p>
              <p className="text-xs text-emerald-400">${row.annual.toLocaleString()}/yr</p>
            </div>
          ))}
        </div>
      </div>
    </PremiumFeatureCard>
  );
}

function DisasterInsuranceCard({ commandCenter, insights, annualInsurance }) {
  const floodLevel =
    /high|ve\b/i.test(commandCenter.climate.floodZone) ? "high" : "moderate";
  const wildfireNumeric = parseInt(String(commandCenter.climate.wildfireIndex), 10) || 50;
  const wildfireLevel =
    wildfireNumeric >= 120 ? "elevated" : wildfireNumeric >= 90 ? "moderate" : "low";

  return (
    <PremiumFeatureCard
      emoji="🌪️"
      title="Disaster & Insurance Risk"
      subtitle="Flood zone exposure and average insurance premium impacts"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HazardCard
          label="Flood zone"
          value={commandCenter.climate.floodZone}
          level={floodLevel}
        />
        <HazardCard
          label="Wildfire hazard index"
          value={commandCenter.climate.wildfireIndex}
          level={wildfireLevel}
        />
        <HazardCard
          label="Est. annual homeowners insurance"
          value={`$${annualInsurance.toLocaleString()}/yr`}
          level={annualInsurance >= 2500 ? "elevated" : "moderate"}
        />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <IndexRow label="Wind hazard index" value={commandCenter.climate.windIndex} />
        <IndexRow label="Tornado index" value={commandCenter.climate.tornadoIndex} />
        <IndexRow label="Earthquake index" value={commandCenter.climate.earthquakeIndex} />
        <IndexRow
          label="Insurance trend"
          value={String(insights.changes?.insuranceEst || "Verify carrier quotes")}
        />
      </div>
      <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-relaxed text-slate-400">
        Flood and wind exposure can materially affect premiums — verify FEMA maps and carrier
        quotes before closing. Estimated annual homeowners insurance:{" "}
        <span className="font-semibold text-white">${annualInsurance.toLocaleString()}</span>.
      </p>
    </PremiumFeatureCard>
  );
}

const accentMap = {
  emerald: {
    badge: "bg-emerald-500/20 text-emerald-300",
    icon: "bg-emerald-500/20 text-emerald-400",
    bar: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  blue: {
    badge: "bg-blue-500/20 text-blue-300",
    icon: "bg-blue-500/20 text-blue-400",
    bar: "bg-blue-500",
    ring: "ring-blue-500/20",
  },
  violet: {
    badge: "bg-violet-500/20 text-violet-300",
    icon: "bg-violet-500/20 text-violet-400",
    bar: "bg-violet-500",
    ring: "ring-violet-500/20",
  },
};

function DashboardCard({ accent, icon, title, score, badge, trend, stats, meter }) {
  const colors = accentMap[accent];
  const icons = {
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
    school: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
      />
    ),
    noise: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
      />
    ),
  };

  return (
    <article className={`rounded-2xl border border-white/10 bg-slate-900 p-6 ring-1 ${colors.ring}`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icons[icon]}
          </svg>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}>{badge}</span>
      </div>
      <h2 className="mt-5 text-sm font-medium uppercase tracking-wider text-slate-400">{title}</h2>
      <p className="mt-1 text-3xl font-bold text-white">{score}</p>
      <p className="mt-1 text-xs text-slate-500">{trend}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${Math.min(meter, 100)}%` }} />
      </div>
      <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
        {stats.map((stat) => (
          <li key={stat.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{stat.label}</span>
            <span className="font-medium text-slate-200">{stat.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function MetricTile({ label, value, change }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-emerald-400">{change}</p>
    </div>
  );
}

function HomePriceTrendChart({ series, appreciation }) {
  const minPrice = Math.min(...series.map((point) => point.price));
  const maxPrice = Math.max(...series.map((point) => point.price));
  const range = maxPrice - minPrice || 1;
  const startPrice = series[0]?.price ?? 0;
  const endPrice = series[series.length - 1]?.price ?? 0;
  const changePct = startPrice
    ? (((endPrice - startPrice) / startPrice) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900/30 to-slate-800/90 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Home price trend</p>
          <p className="text-xs text-slate-400">5-year median sale price</p>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
          +{changePct}% · 5 yr
        </span>
      </div>

      <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
        {series.map((point, index) => {
          const barMaxPx = 96;
          const heightPx = 20 + ((point.price - minPrice) / range) * barMaxPx;
          const isLatest = index === series.length - 1;
          return (
            <div key={point.year} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-300 sm:text-xs">
                {formatCompactCurrency(point.price)}
              </span>
              <div
                className={`w-full rounded-t-md ${isLatest ? "bg-emerald-400" : "bg-emerald-500/40"}`}
                style={{ height: `${heightPx}px` }}
                title={`${point.year}: $${point.price.toLocaleString()}`}
              />
              <span className={`text-xs ${isLatest ? "font-bold text-white" : "text-slate-500"}`}>
                {point.year}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Modeled from +{appreciation}% cumulative appreciation · median sale price by year
      </p>
    </div>
  );
}

function RentVsBuyChart({ data }) {
  const maxValue = Math.max(data.rent, data.buy, 1);

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/30 to-slate-800/90 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Rent vs buy index</p>
          <p className="text-xs text-slate-400">Estimated monthly cost comparison</p>
        </div>
        <span className="max-w-[10rem] text-right text-[10px] font-medium leading-snug text-blue-300 sm:text-xs">
          {data.verdict}
        </span>
      </div>

      <div className="mt-5 flex h-40 items-end justify-center gap-8 sm:gap-12">
        {[
          { label: "Rent", value: data.rent, color: "bg-violet-400" },
          { label: "Buy", value: data.buy, color: "bg-blue-400" },
        ].map((item) => {
          const heightPx = Math.max(32, Math.round((item.value / maxValue) * 96));
          return (
          <div key={item.label} className="flex w-24 flex-col items-center gap-2 sm:w-28">
            <span className="text-sm font-bold text-white">${item.value.toLocaleString()}</span>
            <div
              className={`w-full rounded-t-md ${item.color}`}
              style={{ height: `${heightPx}px` }}
            />
            <span className="text-xs font-semibold text-slate-400">{item.label}</span>
          </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs sm:grid-cols-4">
        <div>
          <p className="text-slate-500">Mortgage</p>
          <p className="font-semibold text-slate-200">${data.breakdown.mortgage.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Property tax</p>
          <p className="font-semibold text-slate-200">${data.breakdown.tax.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Insurance</p>
          <p className="font-semibold text-slate-200">${data.breakdown.insurance.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">HOA</p>
          <p className="font-semibold text-slate-200">${data.breakdown.hoa.toLocaleString()}</p>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-slate-500">
        Buy estimate: 20% down, 30-yr fixed at 6.5% APR · taxes, insurance & HOA included
      </p>
    </div>
  );
}

function CommuteCalculator({ cityLabel, interactive = true }) {
  const [workAddress, setWorkAddress] = useState("");
  const [oneWayMiles, setOneWayMiles] = useState(12);
  const [mpg, setMpg] = useState(28);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [dailyTolls, setDailyTolls] = useState(0);

  const safeMpg = Math.max(mpg, 1);
  const safeMiles = Math.max(oneWayMiles, 0);
  const roundTripMiles = safeMiles * 2;
  const dailyGallons = roundTripMiles / safeMpg;
  const monthlyGallons = dailyGallons * 22;
  const monthlyFuelCost = Math.round(monthlyGallons * gasPrice);
  const monthlyTollCost = Math.round(Math.max(dailyTolls, 0) * 22);
  const monthlyCommuteTotal = monthlyFuelCost + monthlyTollCost;
  const oneWayMinutes = Math.round((safeMiles / 30) * 60);
  const roundTripMinutes = oneWayMinutes * 2;
  const annualCommuteTotal = monthlyCommuteTotal * 12;
  const destinationLabel = workAddress.trim() || "your workplace";
  const inputProps = interactive ? {} : { readOnly: true, tabIndex: -1 };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
      <p className="text-sm font-semibold text-white">Work commute & expense calculator</p>
      <p className="mt-1 text-xs text-slate-500">
        Monthly gas and toll footprint from {cityLabel} to {destinationLabel}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-400">Work address</span>
          <input
            type="text"
            value={workAddress}
            onChange={(event) => setWorkAddress(event.target.value)}
            placeholder="e.g. 123 Main St, Downtown"
            {...inputProps}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-400">One-way distance (miles)</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={oneWayMiles}
            onChange={(event) => setOneWayMiles(Number(event.target.value) || 0)}
            {...inputProps}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-400">Car MPG</span>
          <input
            type="number"
            min="1"
            step="1"
            value={mpg}
            onChange={(event) => setMpg(Number(event.target.value) || 1)}
            {...inputProps}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-400">Gas price ($/gal)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={gasPrice}
            onChange={(event) => setGasPrice(Number(event.target.value) || 0)}
            {...inputProps}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-400">Daily tolls ($)</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={dailyTolls}
            onChange={(event) => setDailyTolls(Number(event.target.value) || 0)}
            {...inputProps}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
            One-way drive
          </p>
          <p className="mt-1 text-2xl font-bold text-white">~{oneWayMinutes} min</p>
          <p className="mt-1 text-xs text-slate-500">At ~30 mph average</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
            Monthly fuel
          </p>
          <p className="mt-1 text-2xl font-bold text-white">${monthlyFuelCost}</p>
          <p className="mt-1 text-xs text-slate-500">
            {monthlyGallons.toFixed(1)} gal · 22 days
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
            Monthly tolls
          </p>
          <p className="mt-1 text-2xl font-bold text-white">${monthlyTollCost}</p>
          <p className="mt-1 text-xs text-slate-500">Round-trip toll estimate</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Monthly total
          </p>
          <p className="mt-1 text-2xl font-bold text-white">${monthlyCommuteTotal}</p>
          <p className="mt-1 text-xs text-slate-500">Gas + tolls · {roundTripMinutes} min/day</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Annual footprint
          </p>
          <p className="mt-1 text-2xl font-bold text-white">${annualCommuteTotal.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-500">Commute-only estimate</p>
        </div>
      </div>
    </div>
  );
}

function CommandPanel({ title, subtitle, accent, children }) {
  const accentColors = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    violet: "text-violet-400",
  };

  return (
    <div role="tabpanel" className="mt-6">
      <p className={`text-xs font-semibold uppercase tracking-widest ${accentColors[accent]}`}>
        {title}
      </p>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function PremiumUtilitySidebar({ cityLabel, location, onExportPdf }) {
  return (
    <aside className="w-full shrink-0 xl:w-80">
      <div className="sticky top-6 rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-xl shadow-black/20">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Premium Utility Card
        </p>
        <h3 className="mt-2 text-lg font-bold text-white">Agent-ready exports</h3>
        <p className="mt-2 text-sm text-slate-400">
          Package everything in the Command Center into a shareable brief for {cityLabel}.
        </p>

        <button
          type="button"
          onClick={onExportPdf}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400"
        >
          📄 Export Comprehensive Neighborhood Brief (PDF)
        </button>

        <ul className="mt-5 space-y-2.5">
          {PDF_BRIEF_BULLETS.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
              <span className="mt-0.5 text-emerald-400">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Report covers
          </p>
          <p className="mt-1 text-sm font-medium text-white">{location}</p>
          <p className="mt-2 text-xs text-slate-500">
            Branded PDF · lender & agent formatting · instant download
          </p>
        </div>
      </div>
    </aside>
  );
}

function HighlightStat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function HazardCard({ label, value, level }) {
  const levelStyles = {
    low: "bg-emerald-500/15 text-emerald-300",
    moderate: "bg-amber-500/15 text-amber-300",
    elevated: "bg-orange-500/15 text-orange-300",
    high: "bg-red-500/15 text-red-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold leading-snug text-white">{value}</p>
      <span
        className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${levelStyles[level] || levelStyles.moderate}`}
      >
        {level} exposure
      </span>
    </div>
  );
}

function IndexRow({ label, value }) {
  const numeric = parseInt(String(value), 10) || 100;
  const width = Math.min(100, Math.max(20, numeric));

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-300">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ScoreCard({ label, score, badge, accent, description }) {
  const accentStyles = {
    emerald: { bar: "bg-emerald-500", badge: "bg-emerald-500/20 text-emerald-300" },
    blue: { bar: "bg-blue-500", badge: "bg-blue-500/20 text-blue-300" },
  };
  const colors = accentStyles[accent] || accentStyles.emerald;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${colors.badge}`}>
          {badge}
        </span>
      </div>
      <p className="mt-3 text-4xl font-bold text-white">{score}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function OccupancyCard({ ownerPercent, renterPercent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-5 sm:col-span-2 lg:col-span-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Housing tenure mix
      </p>
      <p className="mt-1 text-xs text-slate-500">Owner-occupied vs renter-occupied</p>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${ownerPercent}%` }} />
        <div className="bg-violet-500" style={{ width: `${renterPercent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Owner-occupied
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{ownerPercent}%</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
            Renter-occupied
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{renterPercent}%</p>
        </div>
      </div>
    </div>
  );
}
