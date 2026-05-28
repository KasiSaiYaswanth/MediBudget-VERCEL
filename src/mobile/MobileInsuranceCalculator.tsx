import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ShieldCheck,
  IndianRupee,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";
import { supabase } from "@/integrations/supabase/client";

// Import core datasets directly from desktop page
import { 
  insuranceProviders, 
  policyTypes, 
  coveragePresets, 
  claimLimitPresets, 
  type CalculationResult 
} from "@/pages/InsuranceCalculator";

export const MobileInsuranceCalculator = () => {
  const [provider, setProvider] = useState("");
  const [policyType, setPolicyType] = useState("individual");
  const [coveragePercent, setCoveragePercent] = useState("");
  const [customCoverage, setCustomCoverage] = useState("");
  const [maxClaimLimit, setMaxClaimLimit] = useState("");
  const [customClaimLimit, setCustomClaimLimit] = useState("");
  const [treatmentCost, setTreatmentCost] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [coPayPercent, setCoPayPercent] = useState("");
  const [deductible, setDeductible] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const getCoverageValue = () => {
    if (coveragePercent === "custom") return parseFloat(customCoverage) || 0;
    return parseFloat(coveragePercent) || 0;
  };

  const getClaimLimitValue = () => {
    if (maxClaimLimit === "custom") return parseFloat(customClaimLimit) || 0;
    return parseFloat(maxClaimLimit) || 0;
  };

  const isValid = () => {
    const cv = getCoverageValue();
    const cl = getClaimLimitValue();
    const tc = parseFloat(treatmentCost) || 0;
    return provider && cv > 0 && cv <= 100 && cl > 0 && tc > 0;
  };

  const calculate = () => {
    const tc = parseFloat(treatmentCost) || 0;
    const cv = getCoverageValue();
    const cl = getClaimLimitValue();
    const coPayPct = parseFloat(coPayPercent) || 0;
    const ded = parseFloat(deductible) || 0;

    // Raw coverage
    const rawCoverage = tc * (cv / 100);

    // Apply claim limit
    const limitExceeded = rawCoverage > cl;
    let finalCoverage = limitExceeded ? cl : rawCoverage;

    // Apply deductible
    const deductibleAmount = Math.min(ded, tc);
    const costAfterDeductible = Math.max(0, tc - deductibleAmount);

    // Recalculate
    const rawCoverageAfterDed = costAfterDeductible * (cv / 100);
    finalCoverage = Math.min(rawCoverageAfterDed, cl);

    // Apply co-payment
    const coPaymentAmount = Math.round(finalCoverage * (coPayPct / 100));
    finalCoverage = Math.round(finalCoverage - coPaymentAmount);

    // Patient payable
    const patientPayable = Math.round(tc - finalCoverage);

    const providerObj = insuranceProviders.find((p) => p.value === provider);
    const policyObj = policyTypes.find((p) => p.value === policyType);

    setResult({
      treatmentCost: tc,
      coveragePercent: cv,
      maxClaimLimit: cl,
      rawCoverage: Math.round(rawCoverage),
      finalCoverage,
      patientPayable,
      coPaymentAmount,
      deductibleAmount: Math.round(deductibleAmount),
      limitExceeded,
      providerName: providerObj?.label || "Unknown",
      policyType: policyObj?.label || "Individual",
    });

    // Save to Supabase cost_estimation_logs in real-time
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("cost_estimation_logs").insert({
          user_id: user.id,
          condition: `Insurance: ${policyObj?.label || "Policy Estimate"}`,
          city: providerObj?.label || "Insurer",
          hospital_type: "Insurance Audit",
          estimated_cost: tc,
          insurance_applied: true,
          insurance_coverage: finalCoverage
        }).then(({ error }) => {
          if (error) console.error("Failed to sync insurance estimate to Supabase:", error);
        });
      }
    }).catch(err => console.warn("Supabase auth check failed in insurance calculator:", err));

    // Save to localStorage for robust offline access
    const savedEstimation = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      condition: `Insurance: ${policyObj?.label || "Policy Estimate"}`,
      city: providerObj?.label || "Insurer",
      hospitalType: "Insurance Audit",
      consultation: 0,
      tests: Math.round(rawCoverage), // raw insurance coverage
      medicines: coPaymentAmount, // copay amount
      treatment: Math.round(deductibleAmount), // deductible amount
      total: patientPayable,
      cityMultiplier: 1,
      hospitalMultiplier: 1,
    };
    const existing = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
    existing.unshift(savedEstimation);
    localStorage.setItem("estimationHistory", JSON.stringify(existing.slice(0, 50)));
  };

  const resetForm = () => {
    setResult(null);
    setProvider("");
    setCoveragePercent("");
    setMaxClaimLimit("");
    setTreatmentCost("");
    setCoPayPercent("");
    setDeductible("");
    setShowAdvanced(false);
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;

  const coveragePercentage = result
    ? Math.round((result.finalCoverage / result.treatmentCost) * 100)
    : 0;

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
            <ChevronLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground">Insurance Calculator</h1>
            <p className="text-[10px] text-muted-foreground">Calculate dynamic co-pays and insurance limits</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Treatment input */}
              <Card className="shadow-sm border border-border/40">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-primary" /> Estimated Treatment Expense
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">₹</span>
                    <Input
                      type="number"
                      placeholder="e.g. 80000"
                      value={treatmentCost}
                      onChange={(e) => setTreatmentCost(e.target.value)}
                      className="pl-7 h-9 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Policy detail card */}
              <Card className="shadow-sm border border-border/40">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Policy Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground">Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose Provider" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {insuranceProviders.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground">Coverage (%)</Label>
                    <Select value={coveragePercent} onValueChange={setCoveragePercent}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose Coverage %" />
                      </SelectTrigger>
                      <SelectContent>
                        {coveragePresets.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-xs">Custom %</SelectItem>
                      </SelectContent>
                    </Select>
                    {coveragePercent === "custom" && (
                      <Input
                        type="number"
                        placeholder="e.g. 85"
                        value={customCoverage}
                        onChange={(e) => setCustomCoverage(e.target.value)}
                        className="h-9 text-xs mt-1.5"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground">Policy Sum Assured (Limit)</Label>
                    <Select value={maxClaimLimit} onValueChange={setMaxClaimLimit}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose Claim Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {claimLimitPresets.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-xs">Custom limit</SelectItem>
                      </SelectContent>
                    </Select>
                    {maxClaimLimit === "custom" && (
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">₹</span>
                        <Input
                          type="number"
                          placeholder="e.g. 500000"
                          value={customClaimLimit}
                          onChange={(e) => setCustomClaimLimit(e.target.value)}
                          className="pl-7 h-9 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Controls Toggle */}
              <Card className="shadow-sm border border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-xs font-bold text-foreground">Co-pays & Deductibles</Label>
                    </div>
                    <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 mt-3 overflow-hidden">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-muted-foreground">Co-payment Percentage</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 10"
                            value={coPayPercent}
                            onChange={(e) => setCoPayPercent(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-muted-foreground">Initial Deductible Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">₹</span>
                            <Input
                              type="number"
                              placeholder="e.g. 10000"
                              value={deductible}
                              onChange={(e) => setDeductible(e.target.value)}
                              className="pl-7 h-9 text-xs"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Button
                variant="hero"
                className="w-full h-11 text-xs font-bold active-scale mt-1"
                onClick={calculate}
                disabled={!isValid()}
              >
                <Calculator className="h-4 w-4 mr-1.5" />
                Calculate Coverage
              </Button>

            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Detailed Breakdown results */}
              <Card className="shadow-md border-primary/20">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-black text-foreground">Breakdown Analysis</CardTitle>
                  <div className="flex flex-wrap gap-1.5 text-[8px] text-muted-foreground">
                    <span className="bg-secondary px-2 py-0.5 rounded-full">{result.providerName}</span>
                    <span className="bg-secondary px-2 py-0.5 rounded-full">{result.coveragePercent}% Base</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-4">
                  {result.limitExceeded && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-destructive">Claim Limit Exceeded</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">Coverage capped at maximum claim limit {formatCurrency(result.maxClaimLimit)}.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[9px] text-muted-foreground">Insurer Pays</p>
                      <p className="text-lg font-black text-primary mt-0.5">{formatCurrency(result.finalCoverage)}</p>
                      <p className="text-[8px] text-primary/80 mt-0.5">{coveragePercentage}% of total</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                      <p className="text-[9px] text-muted-foreground">Patient Pays</p>
                      <p className="text-lg font-black text-destructive mt-0.5">{formatCurrency(result.patientPayable)}</p>
                      <p className="text-[8px] text-destructive/80 mt-0.5">{100 - coveragePercentage}% of total</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                      <span>Total Coverage Progress</span>
                      <span>{coveragePercentage}%</span>
                    </div>
                    <Progress value={coveragePercentage} className="h-2" />
                  </div>

                  <div className="space-y-1.5 border-t border-border/40 pt-3 text-xs">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Treatment Cost</span>
                      <span className="font-bold">{formatCurrency(result.treatmentCost)}</span>
                    </div>
                    {result.deductibleAmount > 0 && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Deductible (Out of Pocket)</span>
                        <span className="font-bold text-destructive">- {formatCurrency(result.deductibleAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Raw Insurer Coverage</span>
                      <span className="font-bold">{formatCurrency(result.rawCoverage)}</span>
                    </div>
                    {result.coPaymentAmount > 0 && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Co-payment deduction</span>
                        <span className="font-bold text-destructive">- {formatCurrency(result.coPaymentAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] border-t border-border/40 pt-2 font-black">
                      <span className="text-primary">Final Insurer Share</span>
                      <span className="text-primary">{formatCurrency(result.finalCoverage)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-destructive">Final Patient Share</span>
                      <span className="text-destructive">{formatCurrency(result.patientPayable)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-secondary border border-border/40">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-foreground leading-relaxed">
                      {coveragePercentage >= 80
                        ? "Excellent policy! Your insurance covers nearly all expenses."
                        : "Consider verifying local government schemes to reduce out-of-pocket costs further."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="outline" className="h-10 text-xs font-bold" onClick={resetForm}>New Calculation</Button>
                <Link to="/schemes">
                  <Button variant="hero" className="w-full h-10 text-xs font-bold">Check Schemes <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
                </Link>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MobileDashboardLayout>
  );
};

export default MobileInsuranceCalculator;
