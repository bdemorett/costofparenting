export const demoNeighborhood = {
  id: "demo",
  name: "Demo City",
  state: "Sample State",
  safety: {
    score: 76,
    label: "Good",
    trend: "+2 pts vs last year",
    meter: 76,
    stats: [
      { label: "Violent crime index", value: "32/100" },
      { label: "Property crime index", value: "41/100" },
      { label: "vs. national average", value: "-4%" },
      { label: "Night safety", value: "Moderate" },
    ],
  },
  schools: {
    score: "B+",
    label: "Top 35% statewide",
    trend: "Stable district performance",
    meter: 84,
    stats: [
      { label: "Elementary", value: "7/10 — Maple Grove ES" },
      { label: "Middle school", value: "7/10 — Central MS" },
      { label: "High school", value: "8/10 — Riverside HS" },
      { label: "Student-teacher ratio", value: "16:1" },
    ],
  },
  noise: {
    score: "48 dB avg",
    label: "Moderate — Suburban",
    trend: "Peak hours: 7–9 AM, 5–7 PM",
    meter: 52,
    stats: [
      { label: "Traffic noise", value: "Moderate" },
      { label: "Airport proximity", value: "14 mi — Low impact" },
      { label: "Nighttime index", value: "38 dB" },
      { label: "Green space buffer", value: "Medium — 2 parks within 1 mi" },
    ],
  },
  premium: {
    medianHome: 385000,
    medianRent: 1750,
    appreciation: "14.2",
    daysOnMarket: 28,
    pricePerSqFt: 215,
    propertyTax: "1.45",
    hoaAvg: 95,
    insuranceEst: 1650,
    changes: {
      medianHome: "+8.2% YoY",
      medianRent: "+4.5% YoY",
      appreciation: "Near national average",
      daysOnMarket: "Balanced market",
      pricePerSqFt: "+5% vs county",
      propertyTax: "Annual est. $5,580",
      hoaAvg: "28% of homes",
      insuranceEst: "Flood zone: X",
    },
  },
};

export const neighborhoods = {
  austin: {
    id: "austin",
    name: "Austin, TX",
    state: "Texas",
    aliases: ["austin", "austin tx", "austin texas", "austin, tx", "78704", "78701", "78702"],
    safety: {
      score: 82,
      label: "Above Average",
      trend: "+4 pts vs last year",
      meter: 82,
      stats: [
        { label: "Violent crime index", value: "24/100" },
        { label: "Property crime index", value: "38/100" },
        { label: "vs. national average", value: "-11%" },
        { label: "Night safety", value: "Low concern" },
      ],
    },
    schools: {
      score: "A-",
      label: "Top 18% in Texas",
      trend: "District improving 3 yrs running",
      meter: 88,
      stats: [
        { label: "Elementary", value: "9/10 — Zilker ES" },
        { label: "Middle school", value: "8/10 — O. Henry MS" },
        { label: "High school", value: "9/10 — Austin HS" },
        { label: "Student-teacher ratio", value: "15:1" },
      ],
    },
    noise: {
      score: "44 dB avg",
      label: "Quiet — Residential",
      trend: "Peak hours: 7–9 AM, 5–7 PM",
      meter: 56,
      stats: [
        { label: "Traffic noise", value: "Low" },
        { label: "Airport proximity", value: "8 mi — Minimal impact" },
        { label: "Nighttime index", value: "36 dB" },
        { label: "Green space buffer", value: "High — 3 parks within 1 mi" },
      ],
    },
    premium: {
      medianHome: 525000,
      medianRent: 2150,
      appreciation: "22.4",
      daysOnMarket: 22,
      pricePerSqFt: 312,
      propertyTax: "1.72",
      hoaAvg: 145,
      insuranceEst: 1920,
      changes: {
        medianHome: "+12.4% YoY",
        medianRent: "+6.1% YoY",
        appreciation: "Outpacing Texas avg",
        daysOnMarket: "Seller's market",
        pricePerSqFt: "+8% vs Travis County",
        propertyTax: "Annual est. $9,030",
        hoaAvg: "42% of homes",
        insuranceEst: "Flood zone: X",
      },
    },
  },

  "new-york": {
    id: "new-york",
    name: "New York, NY",
    state: "New York",
    aliases: [
      "new york",
      "new york ny",
      "new york city",
      "nyc",
      "manhattan",
      "brooklyn",
      "queens",
      "10001",
      "10019",
      "11201",
    ],
    safety: {
      score: 71,
      label: "Average",
      trend: "+6 pts vs last year",
      meter: 71,
      stats: [
        { label: "Violent crime index", value: "42/100" },
        { label: "Property crime index", value: "35/100" },
        { label: "vs. national average", value: "+8%" },
        { label: "Night safety", value: "Moderate — well-lit corridors" },
      ],
    },
    schools: {
      score: "B+",
      label: "Top 28% in New York",
      trend: "STEM programs expanding citywide",
      meter: 84,
      stats: [
        { label: "Elementary", value: "8/10 — PS 234" },
        { label: "Middle school", value: "7/10 — MS 104" },
        { label: "High school", value: "8/10 — Stuyvesant HS" },
        { label: "Student-teacher ratio", value: "13:1" },
      ],
    },
    noise: {
      score: "62 dB avg",
      label: "Urban bustle",
      trend: "24/7 ambient — sirens & transit",
      meter: 38,
      stats: [
        { label: "Traffic noise", value: "High" },
        { label: "Airport proximity", value: "12 mi — Moderate impact" },
        { label: "Nighttime index", value: "54 dB" },
        { label: "Green space buffer", value: "Low — Central Park 0.8 mi" },
      ],
    },
    premium: {
      medianHome: 785000,
      medianRent: 3450,
      appreciation: "9.8",
      daysOnMarket: 45,
      pricePerSqFt: 892,
      propertyTax: "0.88",
      hoaAvg: 680,
      insuranceEst: 2400,
      changes: {
        medianHome: "+5.2% YoY",
        medianRent: "+3.8% YoY",
        appreciation: "Steady urban appreciation",
        daysOnMarket: "Competitive co-op market",
        pricePerSqFt: "+4% vs borough avg",
        propertyTax: "Annual est. $6,908",
        hoaAvg: "78% of condos",
        insuranceEst: "Flood zone: AE (partial)",
      },
    },
  },

  miami: {
    id: "miami",
    name: "Miami, FL",
    state: "Florida",
    aliases: ["miami", "miami fl", "miami florida", "miami, fl", "33101", "33130", "33139"],
    safety: {
      score: 68,
      label: "Average",
      trend: "+3 pts vs last year",
      meter: 68,
      stats: [
        { label: "Violent crime index", value: "48/100" },
        { label: "Property crime index", value: "44/100" },
        { label: "vs. national average", value: "+14%" },
        { label: "Night safety", value: "Moderate — tourist corridors patrolled" },
      ],
    },
    schools: {
      score: "B",
      label: "Top 42% in Florida",
      trend: "Magnet programs gaining traction",
      meter: 78,
      stats: [
        { label: "Elementary", value: "7/10 — Southside ES" },
        { label: "Middle school", value: "7/10 — Carver MS" },
        { label: "High school", value: "8/10 — Coral Gables SHS" },
        { label: "Student-teacher ratio", value: "17:1" },
      ],
    },
    noise: {
      score: "58 dB avg",
      label: "Moderate — Coastal urban",
      trend: "Peak: cruise ship horns, I-95 rush",
      meter: 42,
      stats: [
        { label: "Traffic noise", value: "Moderate-High" },
        { label: "Airport proximity", value: "6 mi — Noticeable flights" },
        { label: "Nighttime index", value: "49 dB" },
        { label: "Green space buffer", value: "Medium — Bayfront 0.5 mi" },
      ],
    },
    premium: {
      medianHome: 615000,
      medianRent: 2850,
      appreciation: "28.6",
      daysOnMarket: 31,
      pricePerSqFt: 445,
      propertyTax: "1.02",
      hoaAvg: 520,
      insuranceEst: 4200,
      changes: {
        medianHome: "+18.6% YoY",
        medianRent: "+9.2% YoY",
        appreciation: "Top 5% nationally",
        daysOnMarket: "Strong buyer demand",
        pricePerSqFt: "+14% vs Miami-Dade",
        propertyTax: "Annual est. $6,273",
        hoaAvg: "65% of condos",
        insuranceEst: "Flood zone: VE — high premium",
      },
    },
  },

  seattle: {
    id: "seattle",
    name: "Seattle, WA",
    state: "Washington",
    aliases: ["seattle", "seattle wa", "seattle washington", "seattle, wa", "98101", "98103", "98122"],
    safety: {
      score: 74,
      label: "Good",
      trend: "+1 pt vs last year",
      meter: 74,
      stats: [
        { label: "Violent crime index", value: "38/100" },
        { label: "Property crime index", value: "52/100" },
        { label: "vs. national average", value: "+6%" },
        { label: "Night safety", value: "Moderate" },
      ],
    },
    schools: {
      score: "A-",
      label: "Top 15% in Washington",
      trend: "Tech-industry families driving enrollment",
      meter: 88,
      stats: [
        { label: "Elementary", value: "9/10 — John Hay ES" },
        { label: "Middle school", value: "8/10 — Washington MS" },
        { label: "High school", value: "9/10 — Garfield HS" },
        { label: "Student-teacher ratio", value: "16:1" },
      ],
    },
    noise: {
      score: "51 dB avg",
      label: "Moderate — Urban residential",
      trend: "Peak: I-5 corridor, Sea-Tac flight path",
      meter: 49,
      stats: [
        { label: "Traffic noise", value: "Moderate" },
        { label: "Airport proximity", value: "14 mi — Periodic flights" },
        { label: "Nighttime index", value: "42 dB" },
        { label: "Green space buffer", value: "High — Volunteer Park 0.4 mi" },
      ],
    },
    premium: {
      medianHome: 825000,
      medianRent: 2450,
      appreciation: "11.2",
      daysOnMarket: 18,
      pricePerSqFt: 548,
      propertyTax: "0.92",
      hoaAvg: 385,
      insuranceEst: 1580,
      changes: {
        medianHome: "+7.8% YoY",
        medianRent: "+5.4% YoY",
        appreciation: "Steady PNW growth",
        daysOnMarket: "Fast-moving market",
        pricePerSqFt: "+6% vs King County",
        propertyTax: "Annual est. $7,590",
        hoaAvg: "55% of condos",
        insuranceEst: "Flood zone: X",
      },
    },
  },

  chicago: {
    id: "chicago",
    name: "Chicago, IL",
    state: "Illinois",
    aliases: ["chicago", "chicago il", "chicago illinois", "chicago, il", "60601", "60614", "60622"],
    safety: {
      score: 65,
      label: "Below Average",
      trend: "-2 pts vs last year",
      meter: 65,
      stats: [
        { label: "Violent crime index", value: "55/100" },
        { label: "Property crime index", value: "46/100" },
        { label: "vs. national average", value: "+22%" },
        { label: "Night safety", value: "Varies by block — research carefully" },
      ],
    },
    schools: {
      score: "B+",
      label: "Top 32% in Illinois",
      trend: "Selective enrollment schools highly rated",
      meter: 84,
      stats: [
        { label: "Elementary", value: "8/10 — Lincoln ES" },
        { label: "Middle school", value: "7/10 — Ogden MS" },
        { label: "High school", value: "9/10 — Lane Tech HS" },
        { label: "Student-teacher ratio", value: "15:1" },
      ],
    },
    noise: {
      score: "56 dB avg",
      label: "Moderate — Dense urban",
      trend: "Peak: L trains, Lake Shore Drive",
      meter: 44,
      stats: [
        { label: "Traffic noise", value: "Moderate-High" },
        { label: "Airport proximity", value: "16 mi — O'Hare flight path" },
        { label: "Nighttime index", value: "47 dB" },
        { label: "Green space buffer", value: "Medium — Lincoln Park 0.6 mi" },
      ],
    },
    premium: {
      medianHome: 385000,
      medianRent: 1950,
      appreciation: "6.4",
      daysOnMarket: 35,
      pricePerSqFt: 268,
      propertyTax: "2.14",
      hoaAvg: 425,
      insuranceEst: 1480,
      changes: {
        medianHome: "+4.1% YoY",
        medianRent: "+2.9% YoY",
        appreciation: "Stable Midwest market",
        daysOnMarket: "Buyer-friendly pacing",
        pricePerSqFt: "+3% vs Cook County",
        propertyTax: "Annual est. $8,239",
        hoaAvg: "60% of condos",
        insuranceEst: "Flood zone: X",
      },
    },
  },
};

function normalizeQuery(query) {
  return query
    .toLowerCase()
    .trim()
    .replace(/[,.\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lookupNeighborhood(query) {
  const normalized = normalizeQuery(query);

  if (!normalized) {
    return {
      location: neighborhoods.austin.name,
      isDemo: false,
      data: neighborhoods.austin,
    };
  }

  for (const city of Object.values(neighborhoods)) {
    const aliases = city.aliases.map(normalizeQuery);
    if (aliases.includes(normalized)) {
      return {
        location: city.name,
        isDemo: false,
        data: city,
      };
    }
  }

  for (const city of Object.values(neighborhoods)) {
    const aliases = city.aliases.map(normalizeQuery);
    if (
      aliases.some(
        (alias) =>
          alias.length >= 4 &&
          (normalized.includes(alias) || alias.includes(normalized))
      )
    ) {
      return {
        location: city.name,
        isDemo: false,
        data: city,
      };
    }
  }

  const displayLocation =
    query.trim().charAt(0).toUpperCase() + query.trim().slice(1);

  return {
    location: displayLocation,
    isDemo: true,
    data: demoNeighborhood,
  };
}

export function isZipCode(query) {
  return /^\d{5}$/.test(query.trim());
}

export function resolveZipToCitySlug(zip) {
  const normalized = zip.trim();
  for (const city of Object.values(neighborhoods)) {
    if (city.aliases.includes(normalized)) {
      return { slug: city.id, name: city.name, zip: normalized };
    }
  }
  return null;
}
