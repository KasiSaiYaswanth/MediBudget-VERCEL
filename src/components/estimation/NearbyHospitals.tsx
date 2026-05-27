import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Loader2,
  Navigation,
  Building2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Locate,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  getUserLocation,
  reverseGeocode,
  fetchNearbyHospitals,
  matchCityToList,
  type LocationResult,
  type NearbyHospital,
} from "@/lib/locationService";
import { toast } from "sonner";

interface Props {
  citiesList: Array<{ value: string; label: string; state: string; multiplier: number }>;
  onLocationDetected: (cityValue: string, locality: string) => void;
  onHospitalSelected: (hospitalType: string) => void;
  onDismiss: () => void;
}

const hospitalTypeColors: Record<string, string> = {
  government: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  private: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  corporate: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  trust: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const NearbyHospitals = ({ citiesList, onLocationDetected, onHospitalSelected, onDismiss }: Props) => {
  const [status, setStatus] = useState<"idle" | "detecting" | "loading" | "done" | "error">("idle");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const detectLocation = async () => {
    try {
      setStatus("detecting");
      setErrorMsg("");

      const pos = await getUserLocation();
      const { latitude, longitude } = pos.coords;

      setStatus("loading");
      
      let loc: LocationResult | null = null;
      let hosp: NearbyHospital[] = [];
      let geocodeError = false;

      const results = await Promise.allSettled([
        reverseGeocode(latitude, longitude),
        fetchNearbyHospitals(latitude, longitude, 25),
      ]);

      if (results[0].status === "fulfilled") {
        loc = results[0].value;
      } else {
        geocodeError = true;
        console.warn("Reverse geocoding failed:", results[0].reason);
        loc = {
          latitude,
          longitude,
          city: "",
          locality: "",
          state: "",
          postalCode: "",
          displayName: "Coordinates detected",
        };
      }

      if (results[1].status === "fulfilled") {
        hosp = results[1].value;
      } else {
        console.warn("Fetching nearby hospitals failed:", results[1].reason);
      }

      setLocation(loc);
      setHospitals(hosp);
      setStatus("done");

      // Auto-match city if reverse geocoding succeeded
      if (!geocodeError && loc && loc.city) {
        const matchedCity = matchCityToList(loc.city, loc.state, citiesList);
        if (matchedCity) {
          onLocationDetected(matchedCity, loc.locality);
          const locationName = [loc.city, loc.state].filter(Boolean).join(", ");
          toast.success(`Location detected: ${locationName}`);
        } else {
          const locationName = [loc.city, loc.state].filter(Boolean).join(", ");
          toast.info(`Detected ${locationName} — please select nearest city manually.`);
        }
      } else {
        toast.info("Location coordinates detected — please select your city manually.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to detect location.");
      toast.error(err.message || "Location detection failed.");
    }
  };

  const selectHospital = (hospital: NearbyHospital) => {
    setSelectedId(hospital.id);
    onHospitalSelected(hospital.type);
    toast.success(`Selected: ${hospital.name} (${hospital.typeLabel})`);
  };

  if (status === "idle") {
    return (
      <Card className="shadow-card border-primary/10 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Locate className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Auto-detect your location</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Find nearby hospitals and get more accurate cost estimates.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="hero" onClick={detectLocation}>
                  <Navigation className="h-3.5 w-3.5 mr-1.5" />
                  Detect My Location
                </Button>
                <Button size="sm" variant="ghost" onClick={onDismiss} className="text-muted-foreground">
                  Skip
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                🔒 Your location is used only to identify nearby hospitals. We do not store it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "detecting" || status === "loading") {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-foreground font-medium">
            {status === "detecting" ? "Accessing your location..." : "Finding nearby hospitals..."}
          </p>
          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Location Detection Failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{errorMsg}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={detectLocation}>
                  Try Again
                </Button>
                <Button size="sm" variant="ghost" onClick={onDismiss} className="text-muted-foreground">
                  Select Manually
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Done state
  return (
    <div className="space-y-3">
      {/* Detected Location */}
      {location && (
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {location.locality ? `${location.locality}, ` : ""}
                    {location.city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.state} {location.postalCode && `• ${location.postalCode}`}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={onDismiss} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Map View */}
            <div className="h-48 w-full mt-4 rounded-xl overflow-hidden border border-border relative z-0">
              <MapContainer 
                center={[location.latitude, location.longitude]} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Marker */}
                <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
                
                {/* Hospital Markers */}
                {hospitals.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lon]} icon={markerIcon}>
                    <Popup>
                      <strong>{h.name}</strong><br/>
                      {h.typeLabel}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hospital List */}
      {hospitals.length > 0 ? (
        <Card className="shadow-card">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Nearby Hospitals ({hospitals.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Select a hospital to auto-fill your estimation
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 max-h-72 overflow-y-auto space-y-2">
            <AnimatePresence>
              {hospitals.slice(0, 15).map((h, i) => (
                <motion.button
                  key={h.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => selectHospital(h)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedId === h.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{h.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{h.address}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${hospitalTypeColors[h.type] || ""}`}
                        >
                          {h.typeLabel}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {h.distance} km
                        </span>
                      </div>
                      
                      {/* Explicit Baseline Cost Injection */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 text-[10px] font-medium text-slate-500">
                        <span>Est. Consultation: <strong className="text-emerald-700">
                          {h.type === 'government' ? 'Free (₹10-50)' : h.type === 'corporate' ? '₹800+' : h.type === 'trust' ? '₹100 - ₹300' : '₹400 - ₹800'}
                        </strong></span>
                      </div>
                      
                    </div>
                    {selectedId === h.id ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No hospitals found nearby. Please select your hospital type manually.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NearbyHospitals;
