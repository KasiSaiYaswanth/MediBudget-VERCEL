import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ShieldCheck, CheckCircle2, XCircle, Info, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";

// Import core datasets directly from desktop page
import { indianStates, stateSchemes, type SchemeResult } from "@/pages/SchemeChecker";

export const MobileSchemeChecker = () => {
  const [income, setIncome] = useState("");
  const [hasRationCard, setHasRationCard] = useState("");
  const [rationCardType, setRationCardType] = useState("");
  const [employment, setEmployment] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<SchemeResult[] | null>(null);

  const checkEligibility = () => {
    const annualIncome = parseInt(income) || 0;
    const isGovEmployee = employment === "government";
    const isBPL = rationCardType === "white" || rationCardType === "yellow" || rationCardType === "antyodaya";

    const eligibilityResults: SchemeResult[] = [];

    // 1. Ayushman Bharat PM-JAY (National)
    const pmjayEligible = annualIncome <= 300000 && hasRationCard === "yes" && isBPL;
    eligibilityResults.push({
      name: "Ayushman Bharat (PM-JAY)",
      eligible: pmjayEligible,
      coverage: "₹5,00,000 per family/year",
      reason: pmjayEligible
        ? "Income below ₹3L and BPL/eligible ration card holder"
        : annualIncome > 300000
        ? "Income exceeds ₹3,00,000 limit"
        : "BPL ration card (White/Yellow/Antyodaya) required",
      details: "National health protection covering 1,949 procedures at empanelled hospitals across India. Cashless and paperless at point of care.",
    });

    // 2. ESI
    const esiEligible = employment === "private" && annualIncome <= 252000;
    eligibilityResults.push({
      name: "ESI (Employee State Insurance)",
      eligible: esiEligible,
      coverage: "Full medical coverage for employee & family",
      reason: esiEligible
        ? "Private sector employee with qualifying salary (≤ ₹21,000/month)"
        : employment !== "private"
        ? "Only for organized private sector employees"
        : "Salary exceeds ₹21,000/month limit",
      details: "Covers medical, sickness, maternity, disability, and dependent benefits. Employer contribution: 3.25%, Employee: 0.75%.",
    });

    // 3. CGHS
    eligibilityResults.push({
      name: "CGHS (Central Gov Health Scheme)",
      eligible: isGovEmployee,
      coverage: "Comprehensive healthcare + ₹5,00,000 empanelled hospitals",
      reason: isGovEmployee
        ? "Central government employee – eligible for CGHS"
        : "Only for central government employees, pensioners, and their dependents",
      details: "Covers OPD, specialists, diagnostics, hospitalization. Available in 76 cities. CGHS card required.",
    });

    // 4. ECHS (Ex-servicemen)
    eligibilityResults.push({
      name: "ECHS (Ex-Servicemen Contributory Health Scheme)",
      eligible: employment === "defence",
      coverage: "Comprehensive medical cover for veterans",
      reason: employment === "defence"
        ? "Defence personnel / ex-serviceman eligible"
        : "Only for ex-servicemen and their dependents",
      details: "Free treatment at 433 ECHS polyclinics and empanelled hospitals for defence personnel.",
    });

    // 5. SC/ST/OBC specific
    if (category === "sc" || category === "st") {
      eligibilityResults.push({
        name: "Post-Matric Scholarship Health Benefits",
        eligible: annualIncome <= 250000,
        coverage: "Health coverage under scholarship scheme",
        reason: annualIncome <= 250000
          ? "SC/ST category with income within limit"
          : "Income exceeds limit for scholarship health benefits",
        details: "Additional health benefits available under post-matric scholarship for SC/ST students and families.",
      });
    }

    // 6. State-specific schemes
    const stateSpecific = stateSchemes[state] || [];
    for (const scheme of stateSpecific) {
      const eligible = scheme.maxIncome === 0
        ? true // Universal or based on other criteria
        : annualIncome <= scheme.maxIncome;
      
      // Refine eligibility for employee-specific schemes
      let actuallyEligible = eligible;
      let reason = "";
      
      if (scheme.name.includes("Employee") && !isGovEmployee) {
        actuallyEligible = false;
        reason = "Only for state government employees";
      } else if (scheme.maxIncome > 0 && annualIncome > scheme.maxIncome) {
        actuallyEligible = false;
        reason = `Income exceeds ₹${(scheme.maxIncome / 100000).toFixed(1)}L limit`;
      } else {
        actuallyEligible = true;
        reason = scheme.maxIncome === 0
          ? "Universal scheme / eligible based on criteria"
          : `Income within ₹${(scheme.maxIncome / 100000).toFixed(1)}L limit`;
      }

      eligibilityResults.push({
        name: scheme.name,
        eligible: actuallyEligible,
        coverage: scheme.coverage,
        reason,
        details: scheme.details,
      });
    }

    // 7. Jan Aushadhi (applicable to all)
    eligibilityResults.push({
      name: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
      eligible: true,
      coverage: "50-90% discount on medicines",
      reason: "Available to all Indian citizens – no income criteria",
      details: "9,500+ Jan Aushadhi Kendras providing quality generic medicines at 50-90% lower prices than branded equivalents.",
    });

    setResults(eligibilityResults);
    
    // Save metric to localStorage
    try {
      const currentCount = parseInt(localStorage.getItem('schemesChecked') || '0');
      localStorage.setItem('schemesChecked', (currentCount + 1).toString());
    } catch (e) {}
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
            <h1 className="text-lg font-black text-foreground">Government Schemes</h1>
            <p className="text-[10px] text-muted-foreground">Find eligible state & national health subsidies</p>
          </div>
        </div>

        <Card className="shadow-sm border border-border/40">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-primary" /> Subsidies Eligibilty Check
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">State of Residence</label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose state" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {indianStates.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Annual Household Income (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 250000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Do you have a Ration Card?</label>
              <Select value={hasRationCard} onValueChange={setHasRationCard}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes" className="text-xs">Yes</SelectItem>
                  <SelectItem value="no" className="text-xs">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasRationCard === "yes" && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Ration Card Category</label>
                <Select value={rationCardType} onValueChange={setRationCardType}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antyodaya" className="text-xs">Antyodaya (AAY)</SelectItem>
                    <SelectItem value="white" className="text-xs">White / BPL Card</SelectItem>
                    <SelectItem value="yellow" className="text-xs">Yellow Card</SelectItem>
                    <SelectItem value="orange" className="text-xs">Orange / Priority Card</SelectItem>
                    <SelectItem value="pink" className="text-xs">Pink / APL Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Primary Occupation / Employment</label>
              <Select value={employment} onValueChange={setEmployment}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose Occupation" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="government" className="text-xs">Central Government</SelectItem>
                  <SelectItem value="state-government" className="text-xs">State Government</SelectItem>
                  <SelectItem value="defence" className="text-xs">Defence Forces</SelectItem>
                  <SelectItem value="private" className="text-xs">Private Sector</SelectItem>
                  <SelectItem value="unorganized" className="text-xs">Daily wage / Unorganized</SelectItem>
                  <SelectItem value="self-employed" className="text-xs">Self-Employed / Business</SelectItem>
                  <SelectItem value="farmer" className="text-xs">Farmer / Agriculture</SelectItem>
                  <SelectItem value="student" className="text-xs">Student</SelectItem>
                  <SelectItem value="unemployed" className="text-xs">Unemployed</SelectItem>
                  <SelectItem value="retired" className="text-xs">Retired / Pensioner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Social Class (Optional)</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general" className="text-xs">General</SelectItem>
                  <SelectItem value="obc" className="text-xs">OBC</SelectItem>
                  <SelectItem value="sc" className="text-xs">Scheduled Caste (SC)</SelectItem>
                  <SelectItem value="st" className="text-xs">Scheduled Tribe (ST)</SelectItem>
                  <SelectItem value="ews" className="text-xs">EWS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="hero" className="w-full h-11 text-xs font-bold active-scale mt-1" onClick={checkEligibility} disabled={!income || !employment || !state}>
              Evaluate Subsidies
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pb-8">
              
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-muted-foreground font-black uppercase">evaluated schemes ({results.length})</span>
                <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{results.filter(x => x.eligible).length} Eligible</span>
              </div>

              {/* Eligible list */}
              {results.filter(r => r.eligible).map((r) => (
                <Card key={r.name} className="border-emerald-500/20 shadow-sm relative overflow-hidden bg-card">
                  <CardContent className="p-4 flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-snug">{r.name}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{r.reason}</p>
                      <p className="text-[9px] text-emerald-600 font-bold mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Coverage: {r.coverage}</p>
                      {r.details && (
                        <p className="text-[8px] leading-relaxed text-muted-foreground bg-secondary/50 p-2 rounded-xl mt-2 border border-border/40">
                          <Info className="h-3 w-3 inline-block mr-1 text-primary shrink-0" />
                          {r.details}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Non eligible list */}
              {results.filter(r => !r.eligible).map((r) => (
                <Card key={r.name} className="border-border/30 shadow-sm opacity-60 bg-secondary/25">
                  <CardContent className="p-4 flex items-start gap-2.5">
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-snug">{r.name}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{r.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MobileDashboardLayout>
  );
};

export default MobileSchemeChecker;
