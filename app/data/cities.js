/**
 * Autocomplete dataset — major US relocation markets and global cities.
 * Used by the homepage search bar for instant suggestions.
 */
export const AUTOCOMPLETE_CITIES = [
  // United States — top relocation markets
  { label: "Austin, TX", region: "United States" },
  { label: "New York, NY", region: "United States" },
  { label: "Miami, FL", region: "United States" },
  { label: "Seattle, WA", region: "United States" },
  { label: "Chicago, IL", region: "United States" },
  { label: "Los Angeles, CA", region: "United States" },
  { label: "San Francisco, CA", region: "United States" },
  { label: "San Diego, CA", region: "United States" },
  { label: "San Jose, CA", region: "United States" },
  { label: "Denver, CO", region: "United States" },
  { label: "Boston, MA", region: "United States" },
  { label: "Atlanta, GA", region: "United States" },
  { label: "Dallas, TX", region: "United States" },
  { label: "Houston, TX", region: "United States" },
  { label: "San Antonio, TX", region: "United States" },
  { label: "Phoenix, AZ", region: "United States" },
  { label: "Philadelphia, PA", region: "United States" },
  { label: "Portland, OR", region: "United States" },
  { label: "Nashville, TN", region: "United States" },
  { label: "Charlotte, NC", region: "United States" },
  { label: "Raleigh, NC", region: "United States" },
  { label: "Minneapolis, MN", region: "United States" },
  { label: "Detroit, MI", region: "United States" },
  { label: "Orlando, FL", region: "United States" },
  { label: "Tampa, FL", region: "United States" },
  { label: "Las Vegas, NV", region: "United States" },
  { label: "Salt Lake City, UT", region: "United States" },
  { label: "Kansas City, MO", region: "United States" },
  { label: "St. Louis, MO", region: "United States" },
  { label: "Pittsburgh, PA", region: "United States" },
  { label: "Cleveland, OH", region: "United States" },
  { label: "Cincinnati, OH", region: "United States" },
  { label: "Columbus, OH", region: "United States" },
  { label: "Indianapolis, IN", region: "United States" },
  { label: "Milwaukee, WI", region: "United States" },
  { label: "Baltimore, MD", region: "United States" },
  { label: "Washington, DC", region: "United States" },
  { label: "Sacramento, CA", region: "United States" },
  { label: "Oklahoma City, OK", region: "United States" },
  { label: "Memphis, TN", region: "United States" },
  { label: "Louisville, KY", region: "United States" },
  { label: "Richmond, VA", region: "United States" },
  { label: "Boise, ID", region: "United States" },
  { label: "Albuquerque, NM", region: "United States" },
  { label: "Tucson, AZ", region: "United States" },
  { label: "Honolulu, HI", region: "United States" },
  { label: "Anchorage, AK", region: "United States" },
  { label: "Bozeman, MT", region: "United States" },
  { label: "Asheville, NC", region: "United States" },
  { label: "Charleston, SC", region: "United States" },
  { label: "Savannah, GA", region: "United States" },
  { label: "Boulder, CO", region: "United States" },
  { label: "Madison, WI", region: "United States" },
  { label: "Ann Arbor, MI", region: "United States" },
  { label: "Bend, OR", region: "United States" },
  { label: "Santa Fe, NM", region: "United States" },
  { label: "Scottsdale, AZ", region: "United States" },
  { label: "Fort Lauderdale, FL", region: "United States" },
  { label: "Jersey City, NJ", region: "United States" },
  { label: "Brooklyn, NY", region: "United States" },
  // Popular zip codes
  { label: "78704", region: "Austin, TX" },
  { label: "10001", region: "New York, NY" },
  { label: "33139", region: "Miami, FL" },
  { label: "98103", region: "Seattle, WA" },
  { label: "60614", region: "Chicago, IL" },
  { label: "90210", region: "Beverly Hills, CA" },
  { label: "94110", region: "San Francisco, CA" },
  { label: "80202", region: "Denver, CO" },
  // Global cities
  { label: "London, UK", region: "United Kingdom" },
  { label: "Paris, France", region: "Europe" },
  { label: "Berlin, Germany", region: "Europe" },
  { label: "Amsterdam, Netherlands", region: "Europe" },
  { label: "Barcelona, Spain", region: "Europe" },
  { label: "Dublin, Ireland", region: "Europe" },
  { label: "Toronto, Canada", region: "Canada" },
  { label: "Vancouver, Canada", region: "Canada" },
  { label: "Montreal, Canada", region: "Canada" },
  { label: "Mexico City, Mexico", region: "Latin America" },
  { label: "São Paulo, Brazil", region: "Latin America" },
  { label: "Buenos Aires, Argentina", region: "Latin America" },
  { label: "Tokyo, Japan", region: "Asia Pacific" },
  { label: "Singapore", region: "Asia Pacific" },
  { label: "Hong Kong", region: "Asia Pacific" },
  { label: "Sydney, Australia", region: "Asia Pacific" },
  { label: "Melbourne, Australia", region: "Asia Pacific" },
  { label: "Dubai, UAE", region: "Middle East" },
  { label: "Tel Aviv, Israel", region: "Middle East" },
  { label: "Cape Town, South Africa", region: "Africa" },
];

const MAX_SUGGESTIONS = 8;

export function filterCitySuggestions(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const startsWith = [];
  const contains = [];

  for (const city of AUTOCOMPLETE_CITIES) {
    const label = city.label.toLowerCase();
    const region = city.region.toLowerCase();
    const haystack = `${label} ${region}`;

    if (label.startsWith(normalized) || region.startsWith(normalized)) {
      startsWith.push(city);
    } else if (haystack.includes(normalized)) {
      contains.push(city);
    }
  }

  return [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
}
