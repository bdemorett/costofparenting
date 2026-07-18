/**
 * Rich mock ATTOM neighborhood payload for local development.
 * Mirrors the flat report shape returned by getNeighborhoodData().
 */

function formatCityName(city) {
  return city
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function parseCityQuery(cityQuery) {
  const trimmed = (cityQuery || "Austin, TX").trim();
  const zipMatch = trimmed.match(/^(\d{5})$/);
  if (zipMatch) {
    return {
      city: "Sauk Rapids",
      state: "MN",
      zip: zipMatch[1],
      location: `Sauk Rapids, MN · ${zipMatch[1]}`,
    };
  }

  const commaMatch = trimmed.match(/^(.+?),\s*([a-zA-Z]{2})$/);
  if (commaMatch) {
    const city = formatCityName(commaMatch[1]);
    const state = commaMatch[2].toUpperCase();
    return { city, state, zip: null, location: `${city}, ${state}` };
  }

  const city = formatCityName(trimmed);
  return { city, state: "TX", zip: null, location: `${city}, TX` };
}

/** Reference raw ATTOM-style nested payload (not used directly by the UI). */
export const mockAttomApiPayload = {
  location: {
    geoIdV4: "mock-geo-austin-tx",
    name: "Austin, TX",
  },
  community: {
    crime: {
      crime_Index: 88,
      murder_Index: 72,
      forcible_Robbery_Index: 85,
      aggravated_Assault_Index: 90,
      burglary_Index: 92,
      larceny_Index: 95,
      motor_Vehicle_Theft_Index: 98,
    },
    naturalDisasters: {
      wind_Index: 78,
      weather_Index: 82,
      earthquake_Index: 12,
      tornado_Index: 108,
    },
  },
  schools: [
    {
      detail: {
        schoolName: "Casis Elementary School",
        schoolRating: 9,
        instructionalLevel: "Elementary",
        gradeSpanLow: "PK",
        gradeSpanHigh: "5",
        institutionType: "Public",
        distance: 1.2,
        district: { schoolDistrictName: "Austin Independent School District" },
      },
    },
    {
      detail: {
        schoolName: "O Henry Middle School",
        schoolRating: 8,
        instructionalLevel: "Middle",
        gradeSpanLow: "6",
        gradeSpanHigh: "8",
        institutionType: "Public",
        distance: 2.1,
        district: { schoolDistrictName: "Austin Independent School District" },
      },
    },
    {
      detail: {
        schoolName: "Austin High School",
        schoolRating: 9,
        instructionalLevel: "High",
        gradeSpanLow: "9",
        gradeSpanHigh: "12",
        institutionType: "Public",
        distance: 3.4,
        district: { schoolDistrictName: "Austin Independent School District" },
      },
    },
  ],
};

/**
 * Builds a complete neighborhood report matching getNeighborhoodData() output.
 */
export function buildMockNeighborhoodReport(cityQuery = "Austin, TX") {
  const { city, state, zip, location } = parseCityQuery(cityQuery);
  const districtName = `${city} Independent School District`;

  const schoolsList = {
    elementary: {
      name: `${city} Elementary School`,
      score: 9,
      gradeRange: "Grades PK-5",
      rating: 9,
    },
    middle: {
      name: `${city} Middle School`,
      score: 8,
      gradeRange: "Grades 6-8",
      rating: 8,
    },
    high: {
      name: `${city} High School`,
      score: 9,
      gradeRange: "Grades 9-12",
      rating: 9,
    },
  };

  const schools = {
    score: "A-",
    numericIndex: 86,
    label: `${districtName} · top 18% statewide`,
    trend: "Stable district funding · +4.2% per-pupil spend vs 2022",
    fromAttom: true,
    meter: 86,
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
      { label: "Student-teacher ratio", value: "15:1" },
      {
        label: "Grade coverage",
        value: "PK-5 · 6-8 · 9-12",
      },
    ],
  };

  const safety = {
    score: 84,
    label: "Above Average",
    trend: "ATTOM crime index 88 (100 = U.S. average)",
    meter: 84,
    stats: [
      { label: "Overall crime index", value: "88 (100 = avg)" },
      { label: "Violent crime index", value: "84" },
      { label: "Property crime index", value: "95" },
      { label: "vs. national average", value: "12% below average" },
    ],
  };

  const noise = {
    score: "44 dB est.",
    label: "Quiet — Low environmental index",
    trend: "ATTOM environmental hazard indexes",
    meter: 74,
    stats: [
      { label: "Wind hazard index", value: "78 (100 = avg)" },
      { label: "Weather hazard index", value: "82 (100 = avg)" },
      { label: "Earthquake index", value: "12" },
      { label: "Tornado index", value: "108" },
      { label: "Traffic noise", value: "Low — arterial buffer 0.4 mi" },
      { label: "Nighttime index", value: "36 dB" },
    ],
  };

  const premium = {
    medianHome: 485000,
    medianRent: 2150,
    appreciation: "11.8",
    daysOnMarket: 24,
    pricePerSqFt: 312,
    propertyTax: "1.82",
    hoaAvg: 125,
    insuranceEst: 2180,
    changes: {
      medianHome: "+6.4% YoY",
      medianRent: "+3.1% YoY",
      appreciation: "Above regional average",
      daysOnMarket: "Competitive · homes move in ~24 days",
      pricePerSqFt: "+4.8% vs county",
      propertyTax: "+0.22% effective rate since 2021 · annual est. $8,827",
      hoaAvg: "31% of homes in HOA communities",
      insuranceEst: "Flood zone: X — minimal FEMA surge risk · wind deductible may apply",
    },
    lifestyle: {
      walkScore: 72,
      walkLabel: "Very Walkable",
      transitScore: 48,
      transitLabel: "Some Transit",
      ownerOccupied: 54,
      renterOccupied: 46,
    },
  };

  return {
    location,
    city,
    state,
    zip,
    source: "verified",
    isDemo: false,
    safety,
    schools,
    schoolsList,
    noise,
    premium,
  };
}
