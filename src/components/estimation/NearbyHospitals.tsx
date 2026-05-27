import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Navigation,
  X,
  CheckCircle2,
  Locate,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  getUserLocation,
  reverseGeocode,
  type LocationResult,
} from "@/lib/locationService";
import { toast } from "sonner";

interface Props {
  citiesList: Array<{ value: string; label: string; state: string; multiplier: number }>;
  onLocationDetected: (cityName: string, stateName: string, locality: string) => void;
  onHospitalSelected?: (hospitalType: string) => void; // kept for prop compatibility
  onDismiss: () => void;
}

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const NearbyHospitals = ({ onLocationDetected, onDismiss }: Props) => {
  const [status, setStatus] = useState<"idle" | "detecting" | "loading" | "done" | "error">("idle");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const detectLocation = async () => {
    try {
      setStatus("detecting");
      setErrorMsg("");

      const pos = await getUserLocation();
      const { latitude, longitude } = pos.coords;

      setStatus("loading");
      
      const loc = await reverseGeocode(latitude, longitude);

      setLocation(loc);
      setStatus("done");

      // Auto-match/insert city if geocoding succeeded
      if (loc && loc.city) {
        onLocationDetected(loc.city, loc.state || "", loc.locality || "");
        const locationName = [loc.city, loc.state].filter(Boolean).join(", ");
        toast.success(`Location detected: ${locationName}`);
      } else {
        toast.info("Location detected — please select your city manually.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to detect location.");
      toast.error(err.message || "Location detection failed.");
    }
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
                Automatically detect your current city and locality to pre-fill your cost estimation details.
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
                🔒 Your location coordinates are processed client-side only to auto-fill the form. We do not store your coordinate history.
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
            {status === "detecting" ? "Requesting device coordinates..." : "Identifying your city and locality..."}
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
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Location detection failed</p>
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
                  <Popup>Your detected location</Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Location pre-filled successfully below.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NearbyHospitals;
