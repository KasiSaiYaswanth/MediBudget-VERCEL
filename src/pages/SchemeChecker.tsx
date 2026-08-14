import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ShieldCheck, CheckCircle2, XCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRealtimeSync } from "@/context/RealtimeSyncContext";

export interface SchemeResult {
  name: string;
  eligible: boolean;
  coverage: string;
  reason: string;
  details?: string;
}

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// State-specific health schemes
export const stateSchemes: Record<string, { name: string; maxIncome: number; coverage: string; details: string }[]> = {
  "Andhra Pradesh": [
    { name: "YSR Aarogyasri", maxIncome: 500000, coverage: "₹5,00,000 per family/year", details: "Covers 2,446 procedures in empanelled hospitals. Cashless treatment for BPL & eligible families. White ration card holders eligible." },
    { name: "NTR Vaidya Seva", maxIncome: 500000, coverage: "₹2,50,000 per family/year", details: "For unorganized sector workers and BPL families in AP. Covers hospitalization and surgeries." },
    { name: "AP CBHIS (Employees)", maxIncome: 0, coverage: "₹2,00,000 - ₹5,00,000", details: "For AP government employees and pensioners. Cashless treatment at network hospitals." },
    { name: "Chandranna Bima", maxIncome: 250000, coverage: "₹2,00,000 accidental + ₹5,00,000 natural death", details: "Life and accident insurance for BPL families. Covers accidental death and permanent disability." },
  ],
  "Telangana": [
    { name: "Aarogyasri (Telangana)", maxIncome: 500000, coverage: "₹5,00,000 per family/year", details: "Covers 2,432 procedures. For families with annual income below ₹5L. White ration card required." },
    { name: "Telangana Employees Health Scheme", maxIncome: 0, coverage: "Comprehensive healthcare", details: "For Telangana state government employees and pensioners. Cashless treatment at empanelled hospitals." },
    { name: "KCR Kit", maxIncome: 0, coverage: "₹12,000 for delivery", details: "₹12,000 financial assistance for institutional delivery. Available at all government hospitals in Telangana." },
    { name: "Kanti Velugu", maxIncome: 0, coverage: "Free eye screening & treatment", details: "Free eye care scheme covering screening, spectacles, and surgeries for all residents." },
  ],
  "Tamil Nadu": [
    { name: "Chief Minister's Comprehensive Health Insurance (CMCHIS)", maxIncome: 72000, coverage: "₹5,00,000 per family/year", details: "Covers 1,027 procedures. For families with annual income up to ₹72,000. Priority card holders eligible." },
    { name: "Muthulakshmi Reddy Maternity Benefit", maxIncome: 0, coverage: "₹18,000 maternity benefit", details: "Financial assistance for pregnant women. ₹18,000 in installments during pregnancy and after delivery." },
  ],
  "Karnataka": [
    { name: "Yeshasvini Health Insurance", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "For cooperative society members. Covers 1,600+ surgeries at ₹710/year premium. Low-cost health insurance." },
    { name: "Vajpayee Arogyashri", maxIncome: 150000, coverage: "₹1,50,000 per family/year", details: "For BPL families. Covers 437 types of surgeries and treatments in empanelled hospitals." },
    { name: "Arogya Karnataka", maxIncome: 0, coverage: "Free OPD + ₹5,00,000 IPD", details: "Free OPD at government hospitals. BPL families get free treatment. APL families pay subsidized rates." },
  ],
  "Kerala": [
    { name: "Karunya Arogya Suraksha Padhathi (KASP)", maxIncome: 300000, coverage: "₹5,00,000 per family/year", details: "Integrated with Ayushman Bharat. Covers BPL families. Cashless treatment at empanelled hospitals." },
    { name: "CHIS Plus", maxIncome: 500000, coverage: "₹5,00,000 per family/year", details: "For APL families not covered under KASP. Affordable health insurance by Kerala government." },
  ],
  "Maharashtra": [
    { name: "Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)", maxIncome: 100000, coverage: "₹1,50,000 per family/year", details: "For BPL and APL families. Covers 1,134 types of surgeries and treatments. Merged with PM-JAY." },
    { name: "Rajiv Gandhi Jeevandayee Arogya Yojana", maxIncome: 100000, coverage: "₹2,50,000 per family/year", details: "Covers critical illnesses and surgeries. For families with yellow/orange ration card." },
  ],
  "Rajasthan": [
    { name: "Chiranjeevi Swasthya Bima Yojana", maxIncome: 0, coverage: "₹10,00,000 per family/year", details: "₹5L general + ₹5L critical illness. ₹850/year premium for general families. Free for specified categories." },
    { name: "Bhamashah Swasthya Bima Yojana", maxIncome: 0, coverage: "₹3,00,000 per family/year", details: "Merged into Chiranjeevi scheme. Previously covered BPL families." },
  ],
  "West Bengal": [
    { name: "Swasthya Sathi", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Universal health coverage for all West Bengal residents. Smart card-based. No premium for beneficiaries." },
  ],
  "Gujarat": [
    { name: "MA Amrutam Yojana", maxIncome: 400000, coverage: "₹5,00,000 per family/year", details: "For BPL and lower middle class families. Covers 1,600+ treatments. Cashless at empanelled hospitals." },
    { name: "MA Vatsalya Yojana", maxIncome: 400000, coverage: "₹5,00,000 per family/year", details: "Extension of MA Amrutam for middle class families. Premium subsidized by government." },
  ],
  "Punjab": [
    { name: "Sarbat Sehat Bima Yojana", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Integrated with Ayushman Bharat. Covers all Smart Ration Card holder families and other eligible categories." },
  ],
  "Odisha": [
    { name: "Biju Swasthya Kalyan Yojana (BSKY)", maxIncome: 0, coverage: "₹5,00,000 (₹10,00,000 for women)", details: "Universal health assurance. Women get ₹10L coverage. Free treatment at empanelled hospitals." },
  ],
  "Uttar Pradesh": [
    { name: "Mukhyamantri Jan Arogya Yojana", maxIncome: 180000, coverage: "₹5,00,000 per family/year", details: "For families not covered under PMJAY. Focuses on rural and urban poor." },
  ],
  "Bihar": [
    { name: "Mukhyamantri Swasthya Bima Yojana", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Integrated with PM-JAY. For ration card holder families in Bihar." },
  ],
  "Madhya Pradesh": [
    { name: "Ayushman Bharat Niramayam", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "State extension of PM-JAY covering additional families. For Samagra ID holders." },
  ],
  "Chhattisgarh": [
    { name: "Khubchand Baghel Swasthya Sahayata Yojana", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Universal health coverage for all Chhattisgarh residents. No income limit." },
  ],
  "Jharkhand": [
    { name: "Mukhyamantri Swasthya Bima Yojana (Jharkhand)", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "State implementation of PM-JAY with additional state coverage." },
  ],
  "Haryana": [
    { name: "Ayushman Bharat - Chirayu Yojana", maxIncome: 180000, coverage: "₹5,00,000 per family/year", details: "State extension covering families not under PM-JAY. For families with income up to ₹1.8L/year." },
  ],
  "Himachal Pradesh": [
    { name: "HIMCARE", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "For families not covered under PM-JAY. ₹365-₹1,000 annual premium. Cashless treatment." },
  ],
  "Uttarakhand": [
    { name: "Atal Ayushman Uttarakhand Yojana", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Universal health coverage integrated with PM-JAY for all ration card holders." },
  ],
  "Assam": [
    { name: "Atal Amrit Abhiyan", maxIncome: 500000, coverage: "₹2,00,000 per patient/year", details: "Covers 6 critical diseases: cancer, heart, kidney, liver, neuro, and burns." },
  ],
  "Goa": [
    { name: "Deen Dayal Swasthya Seva Yojana", maxIncome: 300000, coverage: "₹2,50,000 per family/year", details: "For families with income below ₹3L. Covers hospitalization at empanelled private hospitals." },
  ],
  "Delhi": [
    { name: "Delhi Arogya Kosh", maxIncome: 300000, coverage: "Up to ₹5,00,000 per patient", details: "Financial assistance for serious illnesses. For Delhi residents below poverty line." },
  ],
  "Sikkim": [
    { name: "Sikkim Health Care Scheme", maxIncome: 0, coverage: "Comprehensive free healthcare", details: "Free healthcare for all Sikkim residents at government facilities. Referral to outside state covered." },
  ],
  "Meghalaya": [
    { name: "Megha Health Insurance Scheme (MHIS)", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Universal health coverage integrated with PM-JAY for all BPL families." },
  ],
  "Tripura": [
    { name: "Mukhyamantri Swasthya Bima Yojana (Tripura)", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "State implementation of PM-JAY for BPL and eligible APL families." },
  ],
  "Arunachal Pradesh": [
    { name: "Chief Minister's Arogya Arunachal Yojana (CMAAY)", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Universal health coverage for all APST card holders and other eligible families." },
  ],
  "Manipur": [
    { name: "CMHT (Chief Minister gi Hakshelgi Tengbang)", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "State component of PM-JAY covering BPL families in Manipur." },
  ],
  "Mizoram": [
    { name: "Mizoram State Health Care Scheme", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "For all ration card holder families. Integrated with PM-JAY." },
  ],
  "Nagaland": [
    { name: "Nagaland Health Protection Scheme", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "PM-JAY integrated scheme for BPL families in Nagaland." },
  ],
  "Jammu & Kashmir": [
    { name: "AB-PMJAY SEHAT", maxIncome: 0, coverage: "₹5,00,000 per family/year", details: "Universal health insurance for all J&K residents. No income criteria. Free for all." },
  ],
};

const SchemeChecker = () => {
  const { addSchemeCheck } = useRealtimeSync();
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
    
    addSchemeCheck({
      state,
      annual_income: annualIncome,
      employment_type: employment,
      eligible_schemes_count: eligibilityResults.filter(r => r.eligible).length,
      total_schemes_evaluated: eligibilityResults.length
    }).catch(console.warn);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Scheme Eligibility</h1>
          <p className="text-muted-foreground mt-1">
            Check your eligibility for central & state government health schemes.
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Your Information
            </CardTitle>
            <CardDescription>Fill in your details to check eligibility across all schemes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">State</label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {indianStates.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Annual Household Income (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 250000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Ration Card</label>
              <Select value={hasRationCard} onValueChange={setHasRationCard}>
                <SelectTrigger><SelectValue placeholder="Do you have a ration card?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasRationCard === "yes" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Ration Card Type</label>
                <Select value={rationCardType} onValueChange={setRationCardType}>
                  <SelectTrigger><SelectValue placeholder="Select ration card type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antyodaya">Antyodaya (AAY) - Poorest of the Poor</SelectItem>
                    <SelectItem value="white">White / BPL Card</SelectItem>
                    <SelectItem value="yellow">Yellow Card</SelectItem>
                    <SelectItem value="orange">Orange / Priority Card</SelectItem>
                    <SelectItem value="pink">Pink / APL Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Employment Type</label>
              <Select value={employment} onValueChange={setEmployment}>
                <SelectTrigger><SelectValue placeholder="Select employment type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Central Government Employee</SelectItem>
                  <SelectItem value="state-government">State Government Employee</SelectItem>
                  <SelectItem value="defence">Defence / Ex-Serviceman</SelectItem>
                  <SelectItem value="private">Private Sector (Organized)</SelectItem>
                  <SelectItem value="unorganized">Unorganized Sector / Daily Wage</SelectItem>
                  <SelectItem value="self-employed">Self-Employed / Business</SelectItem>
                  <SelectItem value="farmer">Farmer / Agriculture</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired / Pensioner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Social Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC (Scheduled Caste)</SelectItem>
                  <SelectItem value="st">ST (Scheduled Tribe)</SelectItem>
                  <SelectItem value="ews">EWS (Economically Weaker Section)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="hero" className="w-full" onClick={checkEligibility} disabled={!income || !employment || !state}>
              Check Eligibility
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Results</h2>
                <span className="text-sm text-muted-foreground">
                  {results.filter((r) => r.eligible).length} of {results.length} schemes eligible
                </span>
              </div>

              {/* Eligible schemes first */}
              {results.filter((r) => r.eligible).length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-primary">✅ Eligible Schemes</p>
                  {results.filter((r) => r.eligible).map((r, i) => (
                    <motion.div
                      key={r.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Card className="shadow-card border-primary/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{r.name}</h3>
                              <p className="text-sm text-muted-foreground">{r.reason}</p>
                              <p className="text-sm font-medium text-primary mt-1">Coverage: {r.coverage}</p>
                              {r.details && (
                                <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md">
                                  <Info className="h-3 w-3 inline mr-1" />{r.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Not eligible schemes */}
              {results.filter((r) => !r.eligible).length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">❌ Not Eligible</p>
                  {results.filter((r) => !r.eligible).map((r, i) => (
                    <motion.div
                      key={r.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (results.filter((x) => x.eligible).length + i) * 0.08 }}
                    >
                      <Card className="shadow-card border-border opacity-70">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <XCircle className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-foreground">{r.name}</h3>
                              <p className="text-sm text-muted-foreground">{r.reason}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default SchemeChecker;
