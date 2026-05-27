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
  PieChart as PieChartIcon,
  ArrowRight,
  Info,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";

export const insuranceProviders = [
  { value: "star_health", label: "Star Health Insurance" },
  { value: "icici_lombard", label: "ICICI Lombard" },
  { value: "hdfc_ergo", label: "HDFC Ergo" },
  { value: "bajaj_allianz", label: "Bajaj Allianz" },
  { value: "niva_bupa", label: "Niva Bupa (Max Bupa)" },
  { value: "care_health", label: "Care Health Insurance" },
  { value: "tata_aig", label: "Tata AIG" },
  { value: "sbi_general", label: "SBI General Insurance" },
  { value: "new_india", label: "New India Assurance" },
  { value: "oriental", label: "Oriental Insurance" },
  { value: "united_india", label: "United India Insurance" },
  { value: "national", label: "National Insurance" },
  { value: "manipal_cigna", label: "ManipalCigna" },
  { value: "aditya_birla", label: "Aditya Birla Health" },
  { value: "reliance_general", label: "Reliance General" },
  { value: "digit", label: "Go Digit Insurance" },
  { value: "acko", label: "Acko General Insurance" },
  { value: "chola_ms", label: "Cholamandalam MS" },
  { value: "iffco_tokio", label: "IFFCO Tokio" },
  { value: "other", label: "Other Provider" },
];

export const policyTypes = [
  { value: "individual", label: "Individual" },
  { value: "family_floater", label: "Family Floater" },
  { value: "group", label: "Group / Employer" },
  { value: "top_up", label: "Super Top-Up" },
];

export const coveragePresets = [
  { value: "60", label: "60%" },
  { value: "70", label: "70%" },
  { value: "75", label: "75%" },
  { value: "80", label: "80%" },
  { value: "90", label: "90%" },
  { value: "100", label: "100%" },
];

export const claimLimitPresets = [
  { value: "100000", label: "₹1 Lakh" },
  { value: "200000", label: "₹2 Lakh" },
  { value: "300000", label: "₹3 Lakh" },
  { value: "500000", label: "₹5 Lakh" },
  { value: "1000000", label: "₹10 Lakh" },
  { value: "2500000", label: "₹25 Lakh" },
  { value: "5000000", label: "₹50 Lakh" },
];

export interface CalculationResult {
  treatmentCost: number;
  coveragePercent: number;
  maxClaimLimit: number;
  rawCoverage: number;
  finalCoverage: number;
  patientPayable: number;
  coPaymentAmount: number;
  deductibleAmount: number;
  limitExceeded: boolean;
  providerName: string;
  policyType: string;
}

const CHART_COLORS = ["hsl(168, 80%, 36%)", "hsl(25, 95%, 53%)", "hsl(210, 90%, 55%)"];

const InsuranceCalculator = () => {
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

    // Step 1: Raw coverage
    const rawCoverage = tc * (cv / 100);

    // Step 2: Apply claim limit
    const limitExceeded = rawCoverage > cl;
    let finalCoverage = limitExceeded ? cl : rawCoverage;

    // Step 3: Apply deductible
    const deductibleAmount = Math.min(ded, tc);
    const costAfterDeductible = Math.max(0, tc - deductibleAmount);

    // Recalculate coverage on cost after deductible
    const rawCoverageAfterDed = costAfterDeductible * (cv / 100);
    finalCoverage = Math.min(rawCoverageAfterDed, cl);

    // Step 4: Apply co-payment
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
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Insurance Calculator</h1>
          <p className="text-muted-foreground mt-1">
            Understand your insurance coverage and out-of-pocket costs.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Treatment Cost */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Treatment Cost</CardTitle>
                      <CardDescription>
                        Enter estimated cost or{" "}
                        <Link to="/estimate" className="text-primary underline">
                          calculate it first
                        </Link>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={treatmentCost}
                      onChange={(e) => setTreatmentCost(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Details */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Insurance Details</CardTitle>
                      <CardDescription>Enter your policy information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider */}
                  <div className="space-y-2">
                    <Label>Insurance Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your insurer" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {insuranceProviders.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Policy Type */}
                  <div className="space-y-2">
                    <Label>Policy Type</Label>
                    <Select value={policyType} onValueChange={setPolicyType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {policyTypes.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coverage % */}
                  <div className="space-y-2">
                    <Label>Coverage Percentage</Label>
                    <Select value={coveragePercent} onValueChange={setCoveragePercent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coverage %" />
                      </SelectTrigger>
                      <SelectContent>
                        {coveragePresets.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom %</SelectItem>
                      </SelectContent>
                    </Select>
                    {coveragePercent === "custom" && (
                      <Input
                        type="number"
                        placeholder="Enter percentage (1-100)"
                        value={customCoverage}
                        onChange={(e) => setCustomCoverage(e.target.value)}
                        min={1}
                        max={100}
                      />
                    )}
                  </div>

                  {/* Max Claim Limit */}
                  <div className="space-y-2">
                    <Label>Maximum Claim Limit</Label>
                    <Select value={maxClaimLimit} onValueChange={setMaxClaimLimit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select claim limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {claimLimitPresets.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    {maxClaimLimit === "custom" && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="Enter claim limit"
                          value={customClaimLimit}
                          onChange={(e) => setCustomClaimLimit(e.target.value)}
                          className="pl-7"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Options */}
              <Card className="shadow-card">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Advanced Options</Label>
                    </div>
                    <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <Label>Co-payment Percentage</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 10 (for 10%)"
                            value={coPayPercent}
                            onChange={(e) => setCoPayPercent(e.target.value)}
                            min={0}
                            max={100}
                          />
                          <p className="text-xs text-muted-foreground">
                            Percentage you pay from the insured amount
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Deductible Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              ₹
                            </span>
                            <Input
                              type="number"
                              placeholder="e.g. 5000"
                              value={deductible}
                              onChange={(e) => setDeductible(e.target.value)}
                              className="pl-7"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Initial amount you pay before insurance kicks in
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Button
                variant="hero"
                className="w-full"
                onClick={calculate}
                disabled={!isValid()}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Coverage
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <Card className="shadow-elevated border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Insurance Coverage Breakdown
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="bg-secondary px-2 py-1 rounded-full">
                      {result.providerName}
                    </span>
                    <span className="bg-secondary px-2 py-1 rounded-full">
                      {result.policyType}
                    </span>
                    <span className="bg-secondary px-2 py-1 rounded-full">
                      {result.coveragePercent}% Coverage
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Limit Warning */}
                  {result.limitExceeded && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">
                          Claim Limit Exceeded
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your calculated coverage ({formatCurrency(result.rawCoverage)}) exceeds
                          your policy limit ({formatCurrency(result.maxClaimLimit)}). Coverage is
                          capped at the policy limit.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Big Numbers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">Insurance Covers</p>
                      <p className="text-2xl font-extrabold text-primary">
                        {formatCurrency(result.finalCoverage)}
                      </p>
                      <p className="text-xs text-primary/70 mt-1">{coveragePercentage}% of total</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <p className="text-xs text-muted-foreground mb-1">You Pay</p>
                      <p className="text-2xl font-extrabold text-destructive">
                        {formatCurrency(result.patientPayable)}
                      </p>
                      <p className="text-xs text-destructive/70 mt-1">
                        {100 - coveragePercentage}% of total
                      </p>
                    </div>
                  </div>

                  {/* Coverage Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Coverage</span>
                      <span>{coveragePercentage}%</span>
                    </div>
                    <Progress value={coveragePercentage} className="h-3" />
                  </div>

                  {/* Pie Chart */}
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Insurance Covers", value: result.finalCoverage },
                            { name: "Your Payment", value: result.patientPayable },
                            ...(result.coPaymentAmount > 0
                              ? [{ name: "Co-payment", value: result.coPaymentAmount }]
                              : []),
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {[0, 1, 2].map((i) => (
                            <Cell key={i} fill={CHART_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Detailed Breakdown</p>
                    <div className="divide-y divide-border rounded-xl border bg-secondary/30 overflow-hidden">
                      <Row
                        label="Total Treatment Cost"
                        value={formatCurrency(result.treatmentCost)}
                      />
                      {result.deductibleAmount > 0 && (
                        <Row
                          label="Deductible (you pay first)"
                          value={`- ${formatCurrency(result.deductibleAmount)}`}
                          muted
                        />
                      )}
                      <Row
                        label={`Coverage (${result.coveragePercent}%)`}
                        value={formatCurrency(result.rawCoverage)}
                      />
                      {result.limitExceeded && (
                        <Row
                          label="Capped at Policy Limit"
                          value={formatCurrency(result.maxClaimLimit)}
                          highlight
                        />
                      )}
                      {result.coPaymentAmount > 0 && (
                        <Row
                          label="Co-payment Deduction"
                          value={`- ${formatCurrency(result.coPaymentAmount)}`}
                          muted
                        />
                      )}
                      <Row
                        label="Final Insurance Coverage"
                        value={formatCurrency(result.finalCoverage)}
                        bold
                        color="text-primary"
                      />
                      <Row
                        label="Patient Out-of-Pocket"
                        value={formatCurrency(result.patientPayable)}
                        bold
                        color="text-destructive"
                      />
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      {coveragePercentage >= 80
                        ? "Great news! Your insurance covers most of the treatment cost."
                        : coveragePercentage >= 50
                        ? "Your insurance covers a significant portion. Consider checking government schemes for additional support."
                        : "Your out-of-pocket cost is significant. We recommend checking government schemes for additional coverage."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={resetForm}>
                  New Calculation
                </Button>
                <Link to="/schemes">
                  <Button variant="hero" className="w-full">
                    Check Schemes <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Disclaimer */}
              <Card className="border-primary/20 bg-secondary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    ⚕️ This is an estimate based on the inputs you provided. Actual coverage may
                    vary depending on your specific policy terms, exclusions, and sub-limits.
                    Please refer to your policy document or contact your insurer for exact details.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

const Row = ({
  label,
  value,
  bold,
  muted,
  highlight,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  highlight?: boolean;
  color?: string;
}) => (
  <div
    className={`flex justify-between px-4 py-2.5 text-sm ${
      highlight ? "bg-destructive/5" : ""
    }`}
  >
    <span
      className={
        bold
          ? "font-semibold text-foreground"
          : muted
          ? "text-muted-foreground"
          : "text-foreground"
      }
    >
      {label}
    </span>
    <span className={bold ? `font-bold ${color || "text-foreground"}` : "text-foreground"}>
      {value}
    </span>
  </div>
);

export default InsuranceCalculator;
