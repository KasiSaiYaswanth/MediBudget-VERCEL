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
 * Falls back to low accuracy if high accuracy fails or times out
 */
export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 6000, // 6s timeout for fast high-accuracy attempt
      maximumAge: 300000, // cache for 5 min
    };

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        // Fallback to low-accuracy (faster, IP/Wifi based) if high accuracy fails
        console.warn("High-accuracy geolocation failed, falling back to standard accuracy...", err.message);
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err2) => {
            switch (err2.code) {
              case err2.PERMISSION_DENIED:
                reject(new Error("Location permission denied. Please allow location access in your browser settings."));
                break;
              case err2.POSITION_UNAVAILABLE:
                reject(new Error("Location information is unavailable. Please ensure GPS is enabled."));
                break;
              case err2.TIMEOUT:
                reject(new Error("Location request timed out. Please try again."));
                break;
              default:
                reject(new Error("An unknown error occurred while getting location."));
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      },
      options
    );
  });
}

// Simple in-memory cache for geocoding results
const geocodeCache = new Map<string, LocationResult>();

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim (free, CORS-enabled, no API key)
 * with robust client-side BigDataCloud fallback in case of Nominatim rate limits/errors.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<LocationResult> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    // Try Nominatim first
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "MediBudget-App/1.0 (healthcare cost estimation)"
        }
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      const result: LocationResult = {
        latitude: lat,
        longitude: lon,
        city: addr.city || addr.town || addr.municipality || addr.village || addr.county || addr.state_district || "",
        locality: addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || addr.road || "",
        state: addr.state || "",
        postalCode: addr.postcode || "",
        displayName: data.display_name || "",
      };

      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn("Nominatim reverse geocoding failed. Trying BigDataCloud fallback...", e);
  }

  // Try BigDataCloud fallback (free, no API key required for client-side geolocation, extremely fast)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );

    if (!res.ok) throw new Error("Reverse geocoding API returned an error status.");

    const data = await res.json();
    const result: LocationResult = {
      latitude: lat,
      longitude: lon,
      city: data.city || data.locality || "",
      locality: data.locality || "",
      state: data.principalSubdivision || "",
      postalCode: data.postcode || "",
      displayName: [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(", "),
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (e) {
    console.error("BigDataCloud reverse geocoding fallback failed:", e);
    throw new Error("Failed to detect city from coordinates. Please select your nearest city manually.");
  }
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
    name.includes("civil hospital") ||
    name.includes("primary health") ||
    name.includes("phc") ||
    name.includes("chc") ||
    name.includes("esi")
  ) {
    return { type: "government", typeLabel: "Government Hospital" };
  }

  if (
    name.includes("trust") ||
    name.includes("charitable") ||
    name.includes("mission") ||
    name.includes("seva") ||
    name.includes("charity")
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
    name.includes("rainbow") ||
    name.includes("kims") ||
    name.includes("nims") ||
    name.includes("aiims") ||
    name.includes("corporate")
  ) {
    return { type: "corporate", typeLabel: "Corporate Hospital" };
  }

  return { type: "private", typeLabel: "Private Hospital" };
}

/**
 * Fetch nearby hospitals using OpenStreetMap Overpass API (free, CORS-enabled, no API key needed)
 * Calls directly from browser to avoid edge function latency/restrictions.
 */
export async function fetchNearbyHospitals(
  lat: number,
  lon: number,
  radiusKm: number = 10
): Promise<NearbyHospital[]> {
  const radiusM = radiusKm * 1000;

  // Overpass QL query - fetch hospitals, clinics, and health centres
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lon});
      way["amenity"="hospital"](around:${radiusM},${lat},${lon});
      relation["amenity"="hospital"](around:${radiusM},${lat},${lon});
      node["amenity"="clinic"](around:${radiusM},${lat},${lon});
      way["amenity"="clinic"](around:${radiusM},${lat},${lon});
    );
    out center tags;
  `;

  // Try multiple Overpass API mirrors for reliability
  const mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
  ];

  let lastError: Error | null = null;

  for (const mirror of mirrors) {
    try {
      const res = await fetch(mirror, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(20000), // 20s timeout per mirror
      });

      if (!res.ok) {
        lastError = new Error(`Overpass returned ${res.status}`);
        continue;
      }

      const data = await res.json();

      const hospitals: NearbyHospital[] = (data.elements || [])
        .filter((el: Record<string, unknown>) => {
          const tags = el.tags as Record<string, string> | undefined;
          return tags?.name;
        })
        .map((el: Record<string, unknown>) => {
          const tags = el.tags as Record<string, string>;
          const hLat = (el.lat as number) || (el.center as { lat: number } | undefined)?.lat;
          const hLon = (el.lon as number) || (el.center as { lon: number } | undefined)?.lon;
          if (!hLat || !hLon) return null;

          const dist = haversineKm(lat, lon, hLat, hLon);
          const { type, typeLabel } = classifyHospital(tags);
          const addr =
            tags["addr:full"] ||
            [tags["addr:street"], tags["addr:city"] || tags["addr:district"]]
              .filter(Boolean)
              .join(", ") ||
            "";

          return {
            id: String(el.id),
            name: tags.name,
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
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown error");
      continue; // try next mirror
    }
  }

  throw lastError || new Error("Failed to fetch nearby hospitals. Please check your internet connection.");
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

  // Guard against empty city string matching everything due to partial matching
  if (!dc) {
    return null;
  }

  // Exact label match
  const exact = citiesList.find((c) => c.label.toLowerCase() === dc);
  if (exact) return exact.value;

  // Exact value/id match
  const exactValue = citiesList.find((c) => c.value.toLowerCase() === dc);
  if (exactValue) return exactValue.value;

  // Fuzzy / Partial match with minimum length check to prevent erroneous matching
  if (dc.length >= 3) {
    const partial = citiesList.find(
      (c) =>
        dc.includes(c.label.toLowerCase()) ||
        c.label.toLowerCase().includes(dc)
    );
    if (partial) return partial.value;

    const valueMatch = citiesList.find((c) => dc.includes(c.value.toLowerCase()));
    if (valueMatch) return valueMatch.value;
  }

  // We explicitly DO NOT automatically match the first city in the state as a fallback,
  // because cost multipliers (economy tiers vs premium cities) vary drastically within
  // the same state (e.g., Mumbai vs Nagpur). Silently setting the first city in the state
  // results in highly inaccurate estimations. Instead, we let the user manually select the closest city.

  return null;
}
