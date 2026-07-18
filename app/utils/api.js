import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  lookupNeighborhood,
  isZipCode,
  demoNeighborhood,
} from "../data/neighborhoods";
import {
  deterministicSchoolScore,
  resolveSchoolGrade,
} from "./schoolGrade";
import { buildMockNeighborhoodReport } from "./mockAttomData";

// -----------------------------------------------------------------------------
// ATTOM Data API (production metrics)
//   · Location     → /v4/location/lookup
//   · Community    → /v4/neighborhood/community  (crime / safety indices)
//   · Schools      → /propertyapi/v1.0.0/school/search
// Set ATTOM_API_KEY in your environment. Without it, dev falls back to
// structured local sample data so the UI never crashes.
// -----------------------------------------------------------------------------

const ATTOM_BASE_URL = "https://api.gateway.attomdata.com";
const FETCH_TIMEOUT_MS = 10000;
const NEIGHBORHOOD_CACHE_SECONDS = Number(
  process.env.NEIGHBORHOOD_CACHE_SECONDS || 60 * 60 * 24 * 30,
);

function getAttomApiKey() {
  return process.env.ATTOM_API_KEY?.trim() || "";
}

function isAttomApiKeyPausedOrMissing(apiKey = getAttomApiKey()) {
  if (!apiKey) return true;
  return /PAUSED/i.test(apiKey);
}

function serveMockNeighborhoodData(cityQuery, reason = "paused/missing") {
  console.log("⚠️ ATTOM Key paused/missing. Serving local mock data.");
  if (reason !== "paused/missing" && process.env.NODE_ENV === "development") {
    console.warn(`[Before You Move There] ATTOM fallback reason: ${reason}`);
  }
  return buildMockNeighborhoodReport(cityQuery);
}

function logAttomMissingInProduction() {
  if (process.env.NODE_ENV === "production" && isAttomApiKeyPausedOrMissing()) {
    console.warn(
      "[Before You Move There] ATTOM_API_KEY is missing or paused in production. Serving mock neighborhood data."
    );
  }
}

const FALLBACK_SCHOOL_TREND = "Modeled district estimate from public data";

function normalizeQuery(query) {
  return query
    .toLowerCase()
    .trim()
    .replace(/[,.\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStateAbbr(value) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return trimmed;
}

function formatCityName(city) {
  return city
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildDisplayName(city, stateOrAbbr, zip = null) {
  const formattedCity = formatCityName(city);
  const statePart = normalizeStateAbbr(stateOrAbbr);
  const base =
    statePart.length === 2
      ? `${formattedCity}, ${statePart}`
      : `${formattedCity}, ${formatCityName(statePart)}`;

  return zip ? `${base} · ${zip}` : base;
}

function formatDisplayName(query) {
  const trimmed = query.trim();
  if (!trimmed) return "Austin, TX";
  if (isZipCode(trimmed)) return `Zip ${trimmed}`;

  const commaMatch = trimmed.match(/^(.+?),\s*([a-zA-Z]{2})$/);
  if (commaMatch) {
    return buildDisplayName(commaMatch[1], commaMatch[2]);
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2 && parts[parts.length - 1].length === 2) {
    const state = parts.pop();
    const city = parts.join(" ");
    return buildDisplayName(city, state);
  }

  return formatCityName(trimmed);
}

function scoreTierFrom100(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Above Average";
  if (score >= 55) return "Good";
  if (score >= 40) return "Average";
  return "Below Average";
}

function averageNumbers(values) {
  const nums = values.filter((value) => Number.isFinite(value));
  if (nums.length === 0) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function buildFallbackSchoolNames(city) {
  const formattedCity = formatCityName(city) || "Local";
  return {
    elementaryName: `${formattedCity} Elementary`,
    middleName: `${formattedCity} Middle School`,
    highName: `${formattedCity} High School`,
  };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function attomFetch(path, searchParams = {}) {
  const apiKey = getAttomApiKey();
  if (!apiKey) return null;

  const url = new URL(`${ATTOM_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value != null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  try {
    const response = await fetchWithTimeout(url.toString(), {
      headers: {
        Accept: "application/json",
        apikey: apiKey,
      },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function extractGeographies(payload) {
  const geographies = payload?.geographies ?? payload?.geography;
  if (Array.isArray(geographies)) return geographies;
  if (geographies) return [geographies];
  return [];
}

function geographyToResolved(geo, zip = null) {
  const geographyName = geo.geographyName || geo.name || "";
  const city = formatCityName(
    geo.name || geographyName.split(",")[0]?.trim() || "Unknown"
  );
  const stateAbbr = normalizeStateAbbr(
    geo.stateCode ||
      geographyName.match(/,\s*([A-Z]{2})(?:\s*,|\s*$)/)?.[1] ||
      ""
  );

  const latitude = geo.latitude ?? geo.geocodingLatitude ?? null;
  const longitude = geo.longitude ?? geo.geocodingLongitude ?? null;

  return {
    city,
    state: stateAbbr,
    stateAbbr,
    zip,
    geoIdV4: geo.geoIdV4 || geo.geoIDv4 || null,
    latitude: latitude != null ? Number(latitude) : null,
    longitude: longitude != null ? Number(longitude) : null,
    displayName: buildDisplayName(city, stateAbbr, zip),
    hashKey: geo.geoIdV4 || geo.geoIDv4 || normalizeQuery(geographyName),
  };
}

async function lookupAttomGeography(params) {
  const payload = await attomFetch("/v4/location/lookup", params);
  const geographies = extractGeographies(payload);
  return geographies[0] ?? null;
}

/**
 * Runs ATTOM's text geocoding pipeline (Place, then City) for a "City, ST"
 * label and returns the first resolved geography, or null.
 */
async function lookupAttomByText(label, zip = null) {
  const cleanLabel = formatDisplayName(label);
  const cityOnly = cleanLabel.split(",")[0]?.trim() || label;

  for (const [type, name] of [
    ["PL", cleanLabel],
    ["CI", cleanLabel],
    ["PL", cityOnly],
  ]) {
    const geo = await lookupAttomGeography({
      geographyTypeAbbreviation: type,
      name,
    });
    if (geo) return geographyToResolved(geo, zip);
  }

  return null;
}

/**
 * Decodes a US zip into real city/state words via the free Zippopotam
 * service. Returns { city, stateAbbr, label } or null.
 */
async function resolveZipViaZippopotam(zip) {
  try {
    const response = await fetchWithTimeout(
      `https://api.zippopotam.is/us/${zip}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const place = data?.places?.[0];
    const city = place?.["place name"]?.trim();
    const stateAbbr = place?.["state abbreviation"]?.trim();
    if (!city || !stateAbbr) return null;

    return { city, stateAbbr, label: `${city}, ${stateAbbr}` };
  } catch {
    return null;
  }
}

/**
 * Forces a zip-resolved geography to carry human-readable city/state text so
 * the header never renders the zip against itself (e.g. "56379, · 56379").
 * Prefers the decoded Zippopotam words; falls back to ATTOM-derived text only
 * when it is not just the zip digits.
 */
function applyZipIdentity(resolved, decoded, zip) {
  if (!resolved) return null;

  const attomCity =
    resolved.city && !/^\d+$/.test(resolved.city) ? resolved.city : null;
  const city = decoded?.city || attomCity || null;
  const stateAbbr = decoded?.stateAbbr || resolved.stateAbbr || "";

  const displayName = city
    ? buildDisplayName(city, stateAbbr, zip)
    : `Zip ${zip}`;

  return {
    ...resolved,
    city: city || `Zip ${zip}`,
    state: stateAbbr,
    stateAbbr,
    zip,
    displayName,
  };
}

/**
 * Resolves a US zip or city to an ATTOM geoIdV4 via Location Lookup.
 */
export async function resolveAttomLocation(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // Detect a leading 5-digit zip even when the /move-to route appends a
  // filler state segment (e.g. "56379, US") so zip searches still resolve.
  const zipMatch = trimmed.match(/^(\d{5})(?!\d)/);
  const zip = zipMatch ? zipMatch[1] : null;

  if (zip) {
    // Decode the zip to real city/state words up front so the header always
    // binds to human-readable text regardless of which lookup path succeeds.
    const decoded = await resolveZipViaZippopotam(zip);

    // 1. Try ATTOM's native zip (ZI) geography lookup first for the geoIdV4.
    const zipGeo = await lookupAttomGeography({
      geographyTypeAbbreviation: "ZI",
      name: zip,
    });
    if (zipGeo) {
      return applyZipIdentity(geographyToResolved(zipGeo, zip), decoded, zip);
    }

    // 2. ZI lookup came back empty — feed the decoded "City, ST" label into
    //    ATTOM's text pipeline so community and school records resolve on
    //    words instead of numbers.
    if (decoded) {
      const byText = await lookupAttomByText(decoded.label, zip);
      if (byText) return applyZipIdentity(byText, decoded, zip);
    }

    return null;
  }

  return lookupAttomByText(trimmed);
}

/** @deprecated Use resolveAttomLocation */
export async function resolveUsLocation(query) {
  return resolveAttomLocation(query);
}

async function fetchAttomCommunity(geoIdV4) {
  return attomFetch("/v4/neighborhood/community", { geoIdV4 });
}

async function fetchAttomSchools({ geoIdV4 }) {
  if (!geoIdV4) return null;
  return attomFetch("/v4/school/search", {
    geoIdV4,
    radius: "5",
    page: "1",
    pageSize: "50",
  });
}

function readCrimeIndex(crime, key) {
  const value = crime?.[key];
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapAttomCrimeToSafety(crime) {
  if (!crime) return null;

  const crimeIndex = readCrimeIndex(crime, "crime_Index") ?? 100;
  const violentIndex = averageNumbers([
    readCrimeIndex(crime, "murder_Index"),
    readCrimeIndex(crime, "forcible_Rape_Index"),
    readCrimeIndex(crime, "forcible_Robbery_Index"),
    readCrimeIndex(crime, "aggravated_Assault_Index"),
  ]);
  const propertyIndex = averageNumbers([
    readCrimeIndex(crime, "burglary_Index"),
    readCrimeIndex(crime, "larceny_Index"),
    readCrimeIndex(crime, "motor_Vehicle_Theft_Index"),
  ]);

  const safetyScore = Math.round(
    Math.max(0, Math.min(100, 220 - crimeIndex))
  );
  const delta = crimeIndex - 100;
  const vsNational =
    delta === 0
      ? "At national average"
      : delta < 0
        ? `${Math.abs(delta)}% below average`
        : `${delta}% above average`;

  return {
    score: safetyScore,
    label: scoreTierFrom100(safetyScore),
    trend: `ATTOM crime index ${crimeIndex} (100 = U.S. average)`,
    meter: safetyScore,
    stats: [
      { label: "Overall crime index", value: `${crimeIndex} (100 = avg)` },
      {
        label: "Violent crime index",
        value: violentIndex != null ? `${Math.round(violentIndex)}` : "—",
      },
      {
        label: "Property crime index",
        value: propertyIndex != null ? `${Math.round(propertyIndex)}` : "—",
      },
      { label: "vs. national average", value: vsNational },
    ],
  };
}

function mapAttomNaturalDisastersToNoise(naturalDisasters) {
  if (!naturalDisasters) return null;

  const wind = Number(naturalDisasters.wind_Index ?? 100);
  const weather = Number(naturalDisasters.weather_Index ?? 100);
  const composite = Math.round((wind + weather) / 2);
  const quietScore = Math.max(0, Math.min(100, 220 - composite));

  return {
    score: `${Math.round(30 + composite / 5)} dB est.`,
    label:
      quietScore >= 70
        ? "Quiet — Low environmental index"
        : quietScore >= 50
          ? "Moderate — Typical area"
          : "Active — Elevated environmental index",
    trend: "ATTOM environmental hazard indexes",
    meter: quietScore,
    stats: [
      {
        label: "Wind hazard index",
        value: `${wind} (100 = avg)`,
      },
      {
        label: "Weather hazard index",
        value: `${weather} (100 = avg)`,
      },
      {
        label: "Earthquake index",
        value: `${naturalDisasters.earthquake_Index ?? "—"}`,
      },
      {
        label: "Tornado index",
        value: `${naturalDisasters.tornado_Index ?? "—"}`,
      },
    ],
  };
}

function parseGradeNumber(value) {
  if (value == null || value === "") return NaN;
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "K" || normalized === "PK") return 0;
  const parsed = parseInt(normalized, 10);
  return Number.isNaN(parsed) ? NaN : parsed;
}

function formatGradeRange(detail) {
  const low = detail.gradeSpanLow;
  const high = detail.gradeSpanHigh;
  if (low == null && high == null) return null;
  if (low != null && high != null) return `Grades ${low}-${high}`;
  return low != null ? `From grade ${low}` : `Through grade ${high}`;
}

function classifyAttomSchoolLevel(detail) {
  const instructional = String(detail.instructionalLevel || "").toLowerCase();
  const schoolType = String(detail.schoolType || "").toLowerCase();
  const name = String(detail.schoolName || "").toLowerCase();
  const low = parseGradeNumber(detail.gradeSpanLow);
  const high = parseGradeNumber(detail.gradeSpanHigh);

  // "Combined" schools (e.g. K-12, 6-12) contain multiple level keywords in
  // their label, so classify them by grade span instead of substring match.
  if (/combined/.test(instructional)) {
    if (!Number.isNaN(low) && !Number.isNaN(high)) {
      if (high <= 5) return "elementary";
      if (low >= 9) return "high";
      if (low >= 6 && high <= 8) return "middle";
      if (high >= 9) return "high";
    }
    return null;
  }

  if (
    /elementary|primary/.test(instructional) ||
    /elementary|primary/.test(schoolType) ||
    /elementary/.test(name)
  ) {
    return "elementary";
  }

  if (
    /middle|junior/.test(instructional) ||
    /middle|junior/.test(schoolType) ||
    /middle|junior/.test(name)
  ) {
    return "middle";
  }

  if (
    /high|secondary|senior/.test(instructional) ||
    /high|secondary/.test(schoolType) ||
    /high school|senior high/.test(name)
  ) {
    return "high";
  }

  if (!Number.isNaN(low) && !Number.isNaN(high)) {
    if (high <= 5) return "elementary";
    if (low >= 9 || high >= 12) return "high";
    if (low >= 6 && high <= 8) return "middle";
    if (high <= 8) return "middle";
    if (low <= 5 && high >= 9) return "high";
    if (high <= 6) return "elementary";
  }

  return null;
}

function normalizeSchoolScore(detail) {
  const rawRating =
    detail.schoolRating ??
    detail.gsTestRating ??
    detail.GSTestRating ??
    detail.institutionRating;

  const numeric = Number(rawRating);
  if (Number.isFinite(numeric)) {
    if (numeric <= 10) return Math.round(numeric);
    if (numeric <= 100) return Math.round(numeric / 10);
  }

  return deterministicSchoolScore(
    detail.schoolName || detail.institutionRating || "school"
  );
}

function extractAttomSchoolRecords(payload) {
  const schools =
    payload?.schools ?? payload?.school ?? payload?.property ?? null;
  if (Array.isArray(schools)) return schools;
  if (schools) return [schools];
  return [];
}

/**
 * Derives a real "City, ST" identity from ATTOM school records by taking the
 * most common location.city. Used to give zip searches human-readable header
 * text straight from ATTOM data when the zip decoder is unavailable.
 */
function deriveCityStateFromSchoolRecords(records) {
  const counts = new Map();
  for (const record of records) {
    const loc = record?.location ?? {};
    const city = String(loc.city || "").trim();
    const stateAbbr = normalizeStateAbbr(loc.stateCode || loc.state || "");
    if (!city) continue;
    const key = `${city}|${stateAbbr}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  let bestKey = null;
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }
  if (!bestKey) return null;

  const [city, stateAbbr] = bestKey.split("|");
  return { city: formatCityName(city), stateAbbr };
}

// Name fragments that mark a school as alternative/specialized rather than a
// flagship traditional public school. Word-boundary matched so tokens like
// "ALC" don't false-positive inside words such as "Falcon".
const SCHOOL_PENALTY_PATTERNS = [
  /\balternative\b/,
  /\blearning\s+center\b/,
  /\balc\b/,
  /\bcharter\b/,
  /\bspecial\s+education\b/,
  /\badministrative\b/,
  /\bopportunity\b/,
  /\bjuvenile\b/,
  /\bdetention\b/,
  /\bcorrectional\b/,
  /\bvirtual\b/,
  /\bonline\b/,
];

/**
 * Scores a school for how likely it is to be the main traditional public
 * school. Lower is better:
 *   - alternative/specialized centers get a heavy penalty (+100)
 *   - non-public institutions get a moderate penalty (+50) so public/zoned
 *     schools always outrank private ones
 *   - names echoing the school district (+bonus) or city (+smaller bonus)
 *     rise within their tier
 */
function scoreSchoolRelevance(name, { city, districtName, institutionType } = {}) {
  const lower = String(name || "").toLowerCase();
  let score = 0;

  for (const pattern of SCHOOL_PENALTY_PATTERNS) {
    if (pattern.test(lower)) score += 100;
  }

  if (institutionType && !/public/i.test(institutionType)) {
    score += 50;
  }

  const districtLower = String(districtName || "").trim().toLowerCase();
  if (districtLower && lower.includes(districtLower)) score -= 15;

  const cityLower = String(city || "").trim().toLowerCase();
  if (cityLower && lower.includes(cityLower)) score -= 10;

  return score;
}

function mapAttomSchoolsToPipeline(schoolRecords, city) {
  const fallback = buildFallbackSchoolNames(city);
  const slots = {
    elementary: null,
    middle: null,
    high: null,
  };
  const unclassified = [];
  const seen = new Set();

  const districtName = schoolRecords
    .map((record) => record?.detail?.district?.schoolDistrictName)
    .find(Boolean);

  // Rank flagship traditional public schools first: lowest relevance penalty
  // wins, then nearest. This keeps alternative/specialized learning centers
  // and private schools out of the standard level slots.
  const ordered = [...schoolRecords].sort((a, b) => {
    const aDetail = a?.detail ?? a;
    const bDetail = b?.detail ?? b;

    const aScore = scoreSchoolRelevance(aDetail?.schoolName, {
      city,
      districtName,
      institutionType: aDetail?.institutionType,
    });
    const bScore = scoreSchoolRelevance(bDetail?.schoolName, {
      city,
      districtName,
      institutionType: bDetail?.institutionType,
    });
    if (aScore !== bScore) return aScore - bScore;

    const aDist = Number(aDetail?.distance) || Infinity;
    const bDist = Number(bDetail?.distance) || Infinity;
    return aDist - bDist;
  });

  for (const record of ordered) {
    const detail = record?.detail ?? record;
    const name = String(detail?.schoolName || "").trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const level = classifyAttomSchoolLevel(detail);
    const entry = {
      name,
      score: normalizeSchoolScore(detail),
      gradeRange: formatGradeRange(detail),
      rating: detail.schoolRating ?? detail.gsTestRating ?? null,
      instructionalLevel: detail.instructionalLevel ?? null,
    };

    if (level && !slots[level]) {
      slots[level] = entry;
      continue;
    }

    if (!level) {
      unclassified.push(entry);
    }
  }

  for (const entry of unclassified) {
    for (const level of ["elementary", "middle", "high"]) {
      if (!slots[level]) {
        slots[level] = entry;
        break;
      }
    }
  }

  const schoolsList = {
    elementary: slots.elementary || {
      name: fallback.elementaryName,
      score: 7,
    },
    middle: slots.middle || {
      name: fallback.middleName,
      score: 7,
    },
    high: slots.high || {
      name: fallback.highName,
      score: 8,
    },
  };

  const matchedCount =
    (slots.elementary ? 1 : 0) +
    (slots.middle ? 1 : 0) +
    (slots.high ? 1 : 0);
  const fromAttom = matchedCount > 0;

  const averageScore = averageNumbers([
    schoolsList.elementary.score,
    schoolsList.middle.score,
    schoolsList.high.score,
  ]);
  const numericIndex = Math.round((averageScore ?? 7) * 10);

  const schools = {
    score: resolveSchoolGrade({ meter: numericIndex, schoolsList }),
    numericIndex,
    label: districtName
      ? `${districtName} district schools`
      : fromAttom
        ? "ATTOM institutional school ratings"
        : "Estimated school profile",
    trend: fromAttom
      ? "School names and ratings sourced from ATTOM"
      : "No ATTOM school records for this area · showing estimates",
    fromAttom,
    meter: numericIndex,
    schoolsList,
    stats: [
      {
        label: "Elementary",
        value: `${schoolsList.elementary.score}/10 — ${schoolsList.elementary.name}`,
      },
      {
        label: "Middle school",
        value: `${schoolsList.middle.score}/10 — ${schoolsList.middle.name}`,
      },
      {
        label: "High school",
        value: `${schoolsList.high.score}/10 — ${schoolsList.high.name}`,
      },
      {
        label: "Grade coverage",
        value:
          [
            schoolsList.elementary.gradeRange,
            schoolsList.middle.gradeRange,
            schoolsList.high.gradeRange,
          ]
            .filter(Boolean)
            .join(" · ") || "See school listings",
      },
    ],
  };

  return { schools, schoolsList };
}

function buildStructuredFallbackReport(trimmed, options = {}) {
  const lookup = lookupNeighborhood(trimmed);
  const displayName = lookup.location || formatDisplayName(trimmed);
  const city = displayName.split(",")[0]?.trim() || "Demo City";
  const state = displayName.split(",")[1]?.trim() || "";
  const schoolNames = buildFallbackSchoolNames(city);
  const data = lookup.data ?? demoNeighborhood;

  const schoolsList = {
    elementary: { name: schoolNames.elementaryName, score: 7 },
    middle: { name: schoolNames.middleName, score: 7 },
    high: { name: schoolNames.highName, score: 8 },
  };

  const schools = {
    ...data.schools,
    schoolsList,
    trend: options.fallbackReason || FALLBACK_SCHOOL_TREND,
    stats: [
      {
        label: "Elementary",
        value: `${schoolsList.elementary.score}/10 — ${schoolsList.elementary.name}`,
      },
      {
        label: "Middle school",
        value: `${schoolsList.middle.score}/10 — ${schoolsList.middle.name}`,
      },
      {
        label: "High school",
        value: `${schoolsList.high.score}/10 — ${schoolsList.high.name}`,
      },
      data.schools.stats.find((stat) => stat.label === "Student-teacher ratio") ??
        { label: "Student-teacher ratio", value: "16:1" },
    ].filter(Boolean),
  };

  return {
    location: displayName,
    city: formatCityName(city),
    state,
    zip: isZipCode(trimmed) ? trimmed.replace(/\D/g, "").slice(0, 5) : null,
    source: "estimated",
    isDemo: lookup.isDemo ?? false,
    safety: data.safety,
    schools,
    schoolsList,
    noise: data.noise,
    premium: data.premium,
  };
}

/**
 * Fetches neighborhood data for any US city, town, or zip code.
 * Production ATTOM responses are cached for 30 days by default to limit API usage.
 * Missing/paused keys and live fetch failures fall back to structured mock data.
 */
async function fetchNeighborhoodDataLive(normalizedQuery) {
  const trimmed = normalizedQuery.trim() || "austin tx";
  logAttomMissingInProduction();

  const apiKey = getAttomApiKey();

  if (isAttomApiKeyPausedOrMissing(apiKey)) {
    return serveMockNeighborhoodData(trimmed, "paused/missing");
  }

  try {
    const resolved = await resolveAttomLocation(trimmed);
    if (!resolved?.geoIdV4) {
      return serveMockNeighborhoodData(trimmed, "location lookup failed");
    }

    const [communityPayload, schoolPayload] = await Promise.all([
      fetchAttomCommunity(resolved.geoIdV4),
      fetchAttomSchools(resolved),
    ]);

    if (!communityPayload && !schoolPayload) {
      return serveMockNeighborhoodData(trimmed, "community and school fetch failed");
    }

    const community = communityPayload?.community;
    const fallback = buildStructuredFallbackReport(trimmed);
    const schoolRecords = extractAttomSchoolRecords(schoolPayload);

    let city = resolved.city;
    let stateAbbr = resolved.stateAbbr;
    let displayName = resolved.displayName;
    const identityIsWeak =
      !city || /^\d+$/.test(city) || /^zip\b/i.test(city);

    if (identityIsWeak) {
      const derived = deriveCityStateFromSchoolRecords(schoolRecords);
      if (derived?.city) {
        city = derived.city;
        stateAbbr = derived.stateAbbr || stateAbbr;
        displayName = buildDisplayName(city, stateAbbr, resolved.zip);
      }
    }

    const safety =
      mapAttomCrimeToSafety(community?.crime) ?? fallback.safety;
    const noise =
      mapAttomNaturalDisastersToNoise(community?.naturalDisasters) ??
      fallback.noise;
    const { schools, schoolsList } = mapAttomSchoolsToPipeline(
      schoolRecords,
      city
    );

    return {
      location: displayName,
      city,
      state: stateAbbr,
      zip: resolved.zip,
      source: "verified",
      isDemo: false,
      safety,
      schools,
      schoolsList,
      noise,
      premium: fallback.premium,
    };
  } catch (error) {
    console.error("[Before You Move There] ATTOM fetch failed:", error);
    return serveMockNeighborhoodData(trimmed, "fetch exception");
  }
}

const getPersistedNeighborhoodReport = unstable_cache(
  fetchNeighborhoodDataLive,
  ["attom-neighborhood-report-v2"],
  {
    revalidate: NEIGHBORHOOD_CACHE_SECONDS,
    tags: ["attom-neighborhood-report"],
  },
);

const getNeighborhoodDataImpl = cache(async function getNeighborhoodDataImpl(
  cityQuery,
) {
  const trimmed = cityQuery.trim() || "Austin, TX";

  if (process.env.NODE_ENV === "development") {
    console.info(
      "[Before You Move There] Development mode — serving mock ATTOM data (no live API calls)."
    );
    return buildMockNeighborhoodReport(trimmed);
  }

  if (isAttomApiKeyPausedOrMissing()) {
    return serveMockNeighborhoodData(trimmed, "paused/missing");
  }

  try {
    const cacheKey = normalizeQuery(trimmed);
    return await getPersistedNeighborhoodReport(cacheKey);
  } catch (error) {
    console.error("[Before You Move There] Neighborhood data cache/fetch failed:", error);
    return serveMockNeighborhoodData(trimmed, "cache/fetch exception");
  }
});

export async function getNeighborhoodData(cityQuery) {
  return getNeighborhoodDataImpl(cityQuery);
}
