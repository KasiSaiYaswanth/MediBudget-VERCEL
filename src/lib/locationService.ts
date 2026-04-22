export interface LocationResult {
  latitude: number;
  longitude: number;
  city: string;
  locality: string;
  state: string;
  postalCode: string;
  displayName: string;
}

export interface NearbyHospital {
  id: string;
  name: string;
  distance: number; // km
  type: "government" | "private" | "corporate" | "trust";
  typeLabel: string;
  lat: number;
  lon: number;
  address: string;
}

/**
 * Request user's GPS location via HTML5 Geolocation API
 */
export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          reject(new Error("Location permission denied. Please allow location access."));
          break;
        case err.POSITION_UNAVAILABLE:
          reject(new Error("Location information is unavailable."));
          break;
        case err.TIMEOUT:
          reject(new Error("Location request timed out. Please try again."));
          break;
        default:
          reject(new Error("An unknown error occurred."));
      }
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // cache for 5 min
    });
  });
}

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim (free, no API key)
 */
export async function reverseGeocode(lat: number, lon: number): Promise<LocationResult> {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/location-service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action: "detect", lat, lon })
  });
  if (!res.ok) throw new Error("Reverse geocoding failed via backend service.");
  const data = await res.json();
  const addr = data.address || {};
  return {
    latitude: lat,
    longitude: lon,
    city: addr.city || addr.town || addr.village || addr.county || "",
    locality: addr.suburb || addr.neighbourhood || addr.hamlet || "",
    state: addr.state || "",
    postalCode: addr.postcode || "",
    displayName: data.display_name || "",
  };
}

/**
 * Calculate distance between two points (Haversine formula) in km
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Classify OSM hospital tags into our hospital types
 */
function classifyHospital(tags: Record<string, string>): { type: NearbyHospital["type"]; typeLabel: string } {
  const operator = (tags.operator || "").toLowerCase();
  const name = (tags.name || "").toLowerCase();
  const healthcareType = (tags["healthcare:type"] || tags.operator_type || "").toLowerCase();

  if (
    healthcareType.includes("government") ||
    operator.includes("government") ||
    name.includes("government") ||
    name.includes("govt") ||
    name.includes("district") ||
    name.includes("taluk") ||
    name.includes("area hospital") ||
    name.includes("phc") ||
    name.includes("chc")
  ) {
    return { type: "government", typeLabel: "Government Hospital" };
  }

  if (
    name.includes("trust") ||
    name.includes("charitable") ||
    name.includes("mission") ||
    name.includes("seva")
  ) {
    return { type: "trust", typeLabel: "Trust / Charitable Hospital" };
  }

  if (
    name.includes("apollo") ||
    name.includes("fortis") ||
    name.includes("max ") ||
    name.includes("medanta") ||
    name.includes("manipal") ||
    name.includes("narayana") ||
    name.includes("aster") ||
    name.includes("yashoda") ||
    name.includes("care hospital") ||
    name.includes("global hospital") ||
    name.includes("continental") ||
    name.includes("corporate")
  ) {
    return { type: "corporate", typeLabel: "Corporate Hospital" };
  }

  return { type: "private", typeLabel: "Private Hospital" };
}

/**
 * Fetch nearby hospitals using OpenStreetMap Overpass API (free, no API key)
 */
export async function fetchNearbyHospitals(
  lat: number,
  lon: number,
  radiusKm: number = 10
): Promise<NearbyHospital[]> {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/location-service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action: "nearby", lat, lon, radiusKm })
  });

  if (!res.ok) throw new Error("Failed to fetch nearby hospitals via backend service.");
  const data = await res.json();

  const hospitals: NearbyHospital[] = (data.elements || [])
    .filter((el: any) => el.tags?.name)
    .map((el: any) => {
      const hLat = el.lat || el.center?.lat;
      const hLon = el.lon || el.center?.lon;
      if (!hLat || !hLon) return null;

      const dist = haversineKm(lat, lon, hLat, hLon);
      const { type, typeLabel } = classifyHospital(el.tags);
      const addr = el.tags["addr:full"] || [el.tags["addr:street"], el.tags["addr:city"] || el.tags["addr:district"]].filter(Boolean).join(", ");

      return {
        id: String(el.id),
        name: el.tags.name,
        distance: Math.round(dist * 10) / 10,
        type,
        typeLabel,
        lat: hLat,
        lon: hLon,
        address: addr || "Address not available",
      } as NearbyHospital;
    })
    .filter(Boolean)
    .sort((a: NearbyHospital, b: NearbyHospital) => a.distance - b.distance);

  return hospitals;
}

/**
 * Match detected city to our cities list (fuzzy)
 */
export function matchCityToList(
  detectedCity: string,
  detectedState: string,
  citiesList: Array<{ value: string; label: string; state: string }>
): string | null {
  const dc = detectedCity.toLowerCase().trim();
  const ds = detectedState.toLowerCase().trim();

  // Exact label match
  const exact = citiesList.find(
    (c) => c.label.toLowerCase() === dc
  );
  if (exact) return exact.value;

  // Partial match
  const partial = citiesList.find(
    (c) =>
      dc.includes(c.label.toLowerCase()) ||
      c.label.toLowerCase().includes(dc)
  );
  if (partial) return partial.value;

  // State match - pick first city in that state
  const stateMatch = citiesList.find(
    (c) => c.state.toLowerCase() === ds
  );
  if (stateMatch) return stateMatch.value;

  return null;
}
