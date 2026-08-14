import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MapPin, Building2, Stethoscope, Calculator, ArrowRight, RefreshCw, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";
import CostResults from "@/components/estimation/CostResults";
import NearbyHospitals from "@/components/estimation/NearbyHospitals";
import ConditionAnalyzer from "@/components/estimation/ConditionAnalyzer";
import { matchCityToList } from "@/lib/locationService";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/context/RealtimeSyncContext";

// Import core datasets directly from desktop component to ensure sync
import { conditions, sortedStates, cityGroups, hospitalTypes, type EstimationResult } from "@/pages/CostEstimation";

export const MobileCostEstimation = () => {
  const { addEstimation } = useRealtimeSync();
  const location = useLocation();
  const navState = location.state as { chatbotCondition?: string; description?: string } | null;

  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [condition, setCondition] = useState("");
  const [locality, setLocality] = useState("");
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [showLocationDetector, setShowLocationDetector] = useState(true);
  const [chatbotCondition] = useState(navState?.chatbotCondition || "");
  const [initialDescription] = useState(navState?.description || "");

  const totalSteps = 3;

  // Custom multiplier computation
  const calculate = () => {
    // Flatten and search
    let allCities: any[] = [];
    Object.values(cityGroups).forEach((arr: any) => {
      allCities = [...allCities, ...arr];
    });

    const c = allCities.find((x) => x.value === city);
    const h = hospitalTypes.find((x) => x.value === hospitalType);
    const cond = conditions.find((x) => x.value === condition);

    if (!c || !h || !cond) return;

    const cm = c.multiplier;
    const hm = h.multiplier;

    const consultation = Math.round(cond.baseCost.consultation * cm * hm);
    const tests = Math.round(cond.baseCost.tests * cm * hm);
    const medicines = Math.round(cond.baseCost.medicines * cm * hm);
    const treatment = Math.round(cond.baseCost.treatment * cm * hm);
    const total = consultation + tests + medicines + treatment;

    setResult({
      condition: cond.label,
      city: `${c.label}, ${c.state}`,
      hospitalType: h.label,
      consultation,
      tests,
      medicines,
      treatment,
      total,
      cityMultiplier: cm,
      hospitalMultiplier: hm,
      recommendedTests: cond.recommendedTests,
      recommendedMedicines: cond.recommendedMedicines,
    });

    // Save via unified real-time sync provider
    addEstimation({
      condition: cond.label,
      city: `${c.label}, ${c.state}`,
      hospital_type: h.label,
      estimated_cost: total,
    }).catch((err) => {
      console.warn("Failed to sync mobile estimation in real-time:", err);
    });

    setStep(4);
  };

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
            <ChevronLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground">Treatment Cost Estimator</h1>
            <p className="text-[10px] text-muted-foreground">Get exact breakdown before hospital admission</p>
          </div>
        </div>

        {/* Step progress pills */}
        {step <= totalSteps && (
          <div className="flex gap-2 py-1 shrink-0">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "gradient-primary scale-x-105" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="shadow-sm border border-border/40">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                      <MapPin className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Select Location</CardTitle>
                      <CardDescription className="text-[9px]">Select city and your local region</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {showLocationDetector && (
                    <NearbyHospitals
                      citiesList={(() => {
                        let all: any[] = [];
                        Object.values(cityGroups).forEach((arr: any) => { all = [...all, ...arr]; });
                        return all;
                      })()}
                      onLocationDetected={(cityName, stateName, loc) => {
                        let all: any[] = [];
                        Object.values(cityGroups).forEach((arr: any) => { all = [...all, ...arr]; });
                        const matchedCity = matchCityToList(cityName, stateName, all);
                        if (matchedCity) {
                          setCity(matchedCity);
                          setLocality(loc);
                        }
                      }}
                      onHospitalSelected={(type) => {
                        setHospitalType(type);
                      }}
                      onDismiss={() => setShowLocationDetector(false)}
                    />
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">Target City</label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="Search / Select City" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {sortedStates.map((state) => (
                          <SelectGroup key={state}>
                            <SelectLabel className="text-[9px] font-black text-primary uppercase bg-secondary px-3 py-1 sticky top-0">{state}</SelectLabel>
                            {cityGroups[state]?.map((c: any) => (
                              <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">Locality / Sector</label>
                    <Input
                      placeholder="e.g. Jubilee Hills, Whitefield..."
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>

                  <Button variant="hero" className="w-full h-11 text-xs font-bold mt-2 active-scale" onClick={() => setStep(2)} disabled={!city}>
                    Next: Hospital Type <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="shadow-sm border border-border/40">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                      <Building2 className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Hospital Facility</CardTitle>
                      <CardDescription className="text-[9px]">Select type of hospital facility</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {hospitalTypes.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => setHospitalType(h.value)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all active-scale ${
                        hospitalType === h.value
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-foreground">{h.label}</span>
                        <span className="text-[8px] bg-secondary text-primary font-bold px-2 py-0.5 rounded-full">{h.multiplier}x multiplier</span>
                      </div>
                    </button>
                  ))}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-10 text-xs">Back</Button>
                    <Button variant="hero" onClick={() => setStep(3)} disabled={!hospitalType} className="flex-1 h-10 text-xs">
                      Next: Condition <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="shadow-sm border border-border/40">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                      <Stethoscope className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Medical Condition</CardTitle>
                      <CardDescription className="text-[9px]">Find or input your condition</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5">
                  
                  {/* Geolocation/AI Condition Analyzer */}
                  <ConditionAnalyzer
                    onConditionSelected={(val) => setCondition(val)}
                    initialDescription={initialDescription}
                    initialCondition={chatbotCondition}
                    cityMultiplier={1} // Safe default
                    hospitalMultiplier={1}
                  />

                  <div className="relative flex items-center gap-2">
                    <div className="flex-1 h-px bg-border/60" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">or select manually</span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>

                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Choose Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-10 text-xs">Back</Button>
                    <Button variant="hero" onClick={calculate} disabled={!condition} className="flex-1 h-10 text-xs">
                      <Calculator className="h-3.5 w-3.5 mr-1" /> Calculate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div key="step4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-4">
                <CostResults result={result} onReset={() => { setStep(1); setResult(null); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MobileDashboardLayout>
  );
};

const MobileCostEstimationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="min-h-screen bg-background pb-20">{children}</div>;
};

export default MobileCostEstimation;
