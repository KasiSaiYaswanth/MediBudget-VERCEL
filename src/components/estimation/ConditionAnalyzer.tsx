import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { conditions as conditionsList } from "@/pages/CostEstimation";

interface DetectedCondition {
  value: string;
  label: string;
  probability: number;
  reasoning: string;
}

interface AnalysisResult {
  conditions: DetectedCondition[];
  extracted_symptoms: string[];
  severity: "low" | "moderate" | "high" | "urgent";
}

interface Props {
  onConditionSelected: (conditionValue: string) => void;
  initialDescription?: string;
  initialCondition?: string;
  cityMultiplier?: number;
  hospitalMultiplier?: number;
}

const severityConfig = {
  low: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Low" },
  moderate: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Moderate" },
  high: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", label: "High" },
  urgent: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Urgent" },
};

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/condition-analyze`;

const ConditionAnalyzer = ({ 
  onConditionSelected, 
  initialDescription, 
  initialCondition,
  cityMultiplier = 1,
  hospitalMultiplier = 1
}: Props) => {
  const [description, setDescription] = useState(initialDescription || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const analyze = async () => {
    if (!description.trim() && !initialCondition) return;
    setIsAnalyzing(true);
    setResult(null);
    setSelectedValue(null);

    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          description: description.trim(),
          chatbotCondition: initialCondition || undefined,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        if (resp.status === 429) toast.error("Too many requests. Please wait.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error(err.error || "Analysis failed.");
        return;
      }

      const data: AnalysisResult = await resp.json();
      setResult(data);

      if (data.conditions.length > 0) {
        toast.success(`Detected ${data.conditions.length} possible condition(s)`);
      } else {
        toast.info("No specific conditions detected. Please select manually.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectCondition = (condition: DetectedCondition) => {
    setSelectedValue(condition.value);
    onConditionSelected(condition.value);
    toast.success(`Selected: ${condition.label}`);
  };

  // Auto-analyze if chatbot condition is passed
  useEffect(() => {
    if (initialCondition) {
      analyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="shadow-card border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 px-4 pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Condition Analyzer
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
              Smart
            </Badge>
          </CardTitle>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expanded && (
          <p className="text-xs text-muted-foreground mt-1">
            Describe your health problem and AI will suggest the most likely conditions.
          </p>
        )}
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Input */}
              <Textarea
                placeholder="E.g. I have severe stomach pain since yesterday with nausea and mild fever..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
                disabled={isAnalyzing}
              />
              <Button
                size="sm"
                variant="hero"
                onClick={analyze}
                disabled={isAnalyzing || (!description.trim() && !initialCondition)}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Analyzing symptoms...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Analyze My Condition
                  </>
                )}
              </Button>

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Extracted Symptoms */}
                  {result.extracted_symptoms.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Detected Symptoms
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_symptoms.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Severity */}
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Severity:</span>
                    <Badge className={`text-[10px] ${severityConfig[result.severity].color}`}>
                      {severityConfig[result.severity].label}
                    </Badge>
                  </div>

                  {/* Conditions */}
                  {result.conditions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        Possible Conditions — tap to select:
                      </p>
                      {result.conditions.map((c, i) => (
                        <motion.button
                          key={c.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => selectCondition(c)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                            selectedValue === c.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{c.label}</span>
                                {selectedValue === c.value && (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{c.reasoning}</p>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              <div className="relative h-10 w-10">
                                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                                  <circle
                                    cx="18" cy="18" r="14"
                                    fill="none" stroke="hsl(var(--muted))"
                                    strokeWidth="3"
                                  />
                                  <circle
                                    cx="18" cy="18" r="14"
                                    fill="none" stroke="hsl(var(--primary))"
                                    strokeWidth="3"
                                    strokeDasharray={`${c.probability * 0.88} 88`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                                  {c.probability}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Cost Breakdown Injection */}
                          {(() => {
                            const match = conditionsList.find((x) => x.value === c.value);
                            if (!match) return null;
                            
                            let consultation = Math.round(match.baseCost.consultation * cityMultiplier * hospitalMultiplier);
                            let tests = Math.round(match.baseCost.tests * cityMultiplier * hospitalMultiplier);
                            let medicines = Math.round(match.baseCost.medicines * cityMultiplier * hospitalMultiplier);
                            let treatment = Math.round(match.baseCost.treatment * cityMultiplier * hospitalMultiplier);
                            
                            // Business Logic Requirements: Only show tests if severe or definitive need (fractures/major)
                            const isSevere = result.severity === 'high' || result.severity === 'urgent';
                            const mandatoryTestConditions = ['fracture', 'cardiac', 'cancer', 'transplant', 'knee', 'spine', 'appendix', 'hernia', 'csection', 'kidney', 'neuro'];
                            
                            if (!isSevere && !mandatoryTestConditions.includes(c.value)) {
                              tests = 0;
                            }
                            
                            let total = consultation + tests + medicines + treatment;
                            
                            if (total > 0 && total < 500) {
                              const diff = 500 - total;
                              consultation += diff;
                              total = 500;
                            }
                            
                            return (
                              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Estimated Cost</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{total.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                                  {consultation > 0 && <span>Fees: ₹{consultation}</span>}
                                  {tests > 0 && <span>Tests: ₹{tests}</span>}
                                  {medicines > 0 && <span>Meds: ₹{medicines}</span>}
                                  {treatment > 0 && <span>Treatment: ₹{treatment}</span>}
                                </div>
                              </div>
                            );
                          })()}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No matching conditions found. Please select manually below.
                    </p>
                  )}

                  {/* Disclaimer */}
                  <p className="text-[10px] text-muted-foreground italic">
                    ⚕️ This estimation is based on reported symptoms and typical treatment patterns.
                    Actual medical costs may vary. Always consult a qualified healthcare professional.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ConditionAnalyzer;
