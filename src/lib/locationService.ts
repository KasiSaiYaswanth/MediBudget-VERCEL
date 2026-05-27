import { supabase } from "@/integrations/supabase/client";

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
  const operatorType = (tags.operator_type || tags["operator:type"] || "").toLowerCase();
  const ownership = (tags.ownership || tags["ownership:type"] || "").toLowerCase();
  const healthcareType = (tags["healthcare:type"] || "").toLowerCase();

  // Government / Public Hospitals
  if (
    healthcareType.includes("government") ||
    healthcareType.includes("public") ||
    operator.includes("government") ||
    operator.includes("public") ||
    operator.includes("municipal") ||
    operatorType.includes("government") ||
    operatorType.includes("public") ||
    ownership.includes("government") ||
    ownership.includes("public") ||
    name.includes("government") ||
    name.includes("govt") ||
    name.includes("district") ||
    name.includes("taluk") ||
    name.includes("area hospital") ||
    name.includes("civil hospital") ||
    name.includes("primary health") ||
    name.includes("phc") ||
    name.includes("chc") ||
    name.includes("esi") ||
    name.includes("general hospital") ||
    name.includes("civic") ||
    name.includes("gh ") ||
    name.endsWith(" gh")
  ) {
    return { type: "government", typeLabel: "Government Hospital" };
  }

  // Trust / Charitable Hospitals
  if (
    name.includes("trust") ||
    name.includes("charitable") ||
    name.includes("mission") ||
    name.includes("seva") ||
    name.includes("charity") ||
    name.includes("foundation") ||
    operator.includes("trust") ||
    operator.includes("charity") ||
    operatorType.includes("community") ||
    operatorType.includes("non-profit") ||
    ownership.includes("trust")
  ) {
    return { type: "trust", typeLabel: "Trust / Charitable Hospital" };
  }

  // Corporate Hospitals (Large chains, premium healthcare brands)
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
    name.includes("corporate") ||
    name.includes("cloudnine") ||
    name.includes("columbia asia") ||
    name.includes("hcc") ||
    name.includes("shalky") ||
    name.includes("sims") ||
    name.includes("kauvery") ||
    name.includes("mgm") ||
    name.includes("gleneagles") ||
    ownership.includes("corporate") ||
    ownership.includes("company")
  ) {
    return { type: "corporate", typeLabel: "Corporate Hospital" };
  }

  // Private (Default for most standard clinics/hospitals)
  return { type: "private", typeLabel: "Private Hospital" };
}

/**
 * Fetch nearby hospitals using OpenStreetMap Overpass API (free, CORS-enabled, no API key needed)
 * combined with a local custom hospital database fallback/merge from Supabase.
 */
export async function fetchNearbyHospitals(
  lat: number,
  lon: number,
  radiusKm: number = 10
): Promise<NearbyHospital[]> {
  const radiusM = radiusKm * 1000;
  let hospitals: NearbyHospital[] = [];

  // 1. Fetch from local custom Supabase database first (extremely fast & accurate)
  try {
    const { data: dbHospitals } = await supabase
      .from("hospitals")
      .select("*");

    if (dbHospitals && dbHospitals.length > 0) {
      for (const dbh of dbHospitals) {
        if (dbh.latitude && dbh.longitude) {
          const dist = haversineKm(lat, lon, dbh.latitude, dbh.longitude);
          if (dist <= radiusKm) {
            let type: NearbyHospital["type"] = "private";
            let typeLabel = "Private Hospital";

            const cat = (dbh.category || "").toLowerCase();
            const tier = (dbh.pricing_tier || "").toLowerCase();
            const nameLower = (dbh.name || "").toLowerCase();

            if (
              cat.includes("government") ||
              cat.includes("govt") ||
              nameLower.includes("govt") ||
              nameLower.includes("government") ||
              nameLower.includes("aiims")
            ) {
              type = "government";
              typeLabel = "Government Hospital";
            } else if (
              tier === "premium" ||
              nameLower.includes("apollo") ||
              nameLower.includes("fortis") ||
              nameLower.includes("max ") ||
              nameLower.includes("medanta") ||
              nameLower.includes("manipal") ||
              nameLower.includes("narayana") ||
              nameLower.includes("yashoda") ||
              nameLower.includes("kims") ||
              nameLower.includes("care hospital")
            ) {
              type = "corporate";
              typeLabel = "Corporate Hospital";
            } else if (
              nameLower.includes("trust") ||
              nameLower.includes("charitable") ||
              nameLower.includes("mission")
            ) {
              type = "trust";
              typeLabel = "Trust / Charitable Hospital";
            }

            hospitals.push({
              id: dbh.id || String(Math.random()),
              name: dbh.name,
              distance: Math.round(dist * 10) / 10,
              type,
              typeLabel,
              lat: dbh.latitude,
              lon: dbh.longitude,
              address: dbh.city
                ? `${dbh.city}${dbh.state ? `, ${dbh.state}` : ""}`
                : "Address not available",
            });
          }
        }
      }
    }
  } catch (dbErr) {
    console.warn("Failed to fetch hospitals from local database, relying on OSM:", dbErr);
  }

  // 2. Fetch from OpenStreetMap Overpass API (highly comprehensive search)
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lon});
      way["amenity"="hospital"](around:${radiusM},${lat},${lon});
      relation["amenity"="hospital"](around:${radiusM},${lat},${lon});
      
      node["healthcare"="hospital"](around:${radiusM},${lat},${lon});
      way["healthcare"="hospital"](around:${radiusM},${lat},${lon});
      
      node["building"="hospital"](around:${radiusM},${lat},${lon});
      way["building"="hospital"](around:${radiusM},${lat},${lon});
      
      node["amenity"="clinic"](around:${radiusM},${lat},${lon});
      way["amenity"="clinic"](around:${radiusM},${lat},${lon});
      node["healthcare"="clinic"](around:${radiusM},${lat},${lon});
      way["healthcare"="clinic"](around:${radiusM},${lat},${lon});
      
      node["amenity"="doctors"](around:${radiusM},${lat},${lon});
      way["amenity"="doctors"](around:${radiusM},${lat},${lon});
    );
    out center tags;
  `;

  const mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
  ];

  let lastError: Error | null = null;
  let osmSuccess = false;

  for (const mirror of mirrors) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s traditional timeout

    try {
      const res = await fetch(mirror, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        lastError = new Error(`Overpass returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      const elements = data.elements || [];

      const osmHospitals: NearbyHospital[] = elements
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
        .filter(Boolean) as NearbyHospital[];

      hospitals.push(...osmHospitals);
      osmSuccess = true;
      break; // successfully fetched from this mirror, break loop
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error("Unknown error");
      continue; // try next mirror
    }
  }

  // If both DB and OSM failed, throw the error
  if (hospitals.length === 0 && lastError && !osmSuccess) {
    throw lastError;
  }

  // 3. Fallback/supplement with OpenStreetMap Nominatim Search API if we found very few hospitals
  if (hospitals.length < 5) {
    try {
      console.log("Found few hospitals via Overpass. Supplementing with Nominatim Search API...");
      
      const searchTerms = ["hospital", "clinic", "medical"];
      const searchPromises = searchTerms.map(async (term) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${term}&lat=${lat}&lon=${lon}&limit=15&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "MediBudget-App/1.0 (healthcare search)"
          }
        });
        if (res.ok) {
          return await res.json();
        }
        return [];
      });

      const searchResultsArray = await Promise.all(searchPromises);
      const searchResults = searchResultsArray.flat();

      for (const item of searchResults) {
        const itemLat = parseFloat(item.lat);
        const itemLon = parseFloat(item.lon);
        if (isNaN(itemLat) || isNaN(itemLon)) continue;

        const dist = haversineKm(lat, lon, itemLat, itemLon);
        // Only include if within search radius
        if (dist <= radiusKm) {
          const name = item.display_name.split(",")[0] || "Medical Center";
          
          // Classify based on name and category tags
          const addr = item.display_name || "";
          const isGovt = 
            addr.toLowerCase().includes("govt") || 
            addr.toLowerCase().includes("government") || 
            name.toLowerCase().includes("govt") || 
            name.toLowerCase().includes("government") ||
            addr.toLowerCase().includes("district hospital") ||
            name.toLowerCase().includes("district hospital");
            
          const isCorporate = 
            name.toLowerCase().includes("apollo") || 
            name.toLowerCase().includes("fortis") || 
            name.toLowerCase().includes("max") || 
            name.toLowerCase().includes("medanta") || 
            name.toLowerCase().includes("manipal") ||
            name.toLowerCase().includes("narayana") ||
            name.toLowerCase().includes("yashoda") ||
            name.toLowerCase().includes("care hospital");

          let type: NearbyHospital["type"] = "private";
          let typeLabel = "Private Hospital";

          if (isGovt) {
            type = "government";
            typeLabel = "Government Hospital";
          } else if (isCorporate) {
            type = "corporate";
            typeLabel = "Corporate Hospital";
          } else if (name.toLowerCase().includes("trust") || name.toLowerCase().includes("charitable")) {
            type = "trust";
            typeLabel = "Trust / Charitable Hospital";
          }

          hospitals.push({
            id: `nom-${item.place_id || Math.random()}`,
            name: name,
            distance: Math.round(dist * 10) / 10,
            type,
            typeLabel,
            lat: itemLat,
            lon: itemLon,
            address: addr.split(",").slice(1).join(",").trim() || "Address not available",
          });
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim Search API fallback failed:", nomErr);
    }
  }

  // 4. Deduplicate elements by name and proximity (<200m) to remove duplicate nodes/ways from OSM
  const uniqueHospitals: NearbyHospital[] = [];
  for (const h of hospitals) {
    const isDuplicate = uniqueHospitals.some(
      (uh) =>
        uh.name.toLowerCase() === h.name.toLowerCase() &&
        haversineKm(uh.lat, uh.lon, h.lat, h.lon) < 0.2
    );
    if (!isDuplicate) {
      uniqueHospitals.push(h);
    }
  }

  // Sort all unique hospitals by distance
  return uniqueHospitals.sort((a, b) => a.distance - b.distance);
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
